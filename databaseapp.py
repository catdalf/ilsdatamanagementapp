from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required
from werkzeug.security import check_password_hash, generate_password_hash
import psycopg2
import base64
from flask import Response
from io import BytesIO
import pandas as pd



dbname = 'Failures'
user = 'postgres'
password = 'timberlaker.67'
host = 'localhost'  
port = '5432'  
app = Flask(__name__)
app.secret_key = '4a3d610adc0bf794a02972131ba9a23a'
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})

login_manager = LoginManager()
login_manager.init_app(app)


# User model
class User(UserMixin):
    def __init__(self, id, email, password_hash, role):
        self.id = id
        self.email = email
        self.password_hash = password_hash
        self.role = role

@login_manager.user_loader
def load_user(user_id):
    conn = psycopg2.connect(
            dbname='Failures',
            user='postgres',
            password='timberlaker.67',
            host='localhost',
            port='5432'
        )
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if user:
        return User(user[0], user[1], user[2], user[3])
    return None

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role='casual'
    password_hash = generate_password_hash(password)

    conn = psycopg2.connect(
            dbname='Failures',
            user='postgres',
            password='timberlaker.67',
            host='localhost',
            port='5432'
        )
    cursor = conn.cursor()

    cursor.execute("INSERT INTO users (email, password_hash, role) VALUES (%s, %s, %s)", (email, password_hash, role))
    conn.commit()

    cursor.close()
    conn.close()

    return jsonify({'status': 'success'})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    conn = psycopg2.connect(
            dbname='Failures',
            user='postgres',
            password='timberlaker.67',
            host='localhost',
            port='5432'
        )
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()

    cursor.close()
    conn.close()

    if user and check_password_hash(user[2], password):
        login_user(User(user[0], user[1], user[2], user[3]))
        return jsonify({'status': 'success', 'role': user[3]})

    return jsonify({'status': 'Invalid email or password'})

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'status': 'Logged out'})

# backend flask side to get data from the database and send it to the frontend react side
@app.route('/get_data_from_database', methods=['GET'])
def get_data():
    try:
        conn = psycopg2.connect(
            dbname='Failures',
            user='postgres',
            password='timberlaker.67',
            host='localhost',
            port='5432'
        )
        cursor = conn.cursor()

        cursor.execute("""
        SELECT pi.part_name, pi.part_number, pi.bilgem_part_number, pi.manufacturer, pi.datasheet,
               pi.description, pi.stock_information,
               pc.category, pc.subcategory, pc.subcategory_type, pc.remarks,
               mi.mtbf_value, mi.condition_environment_info, mi.condition_confidence_level,
               mi.condition_temperature_value, mi.finishing_material,
               rp.mtbf, rp.failure_rate, rp.failure_rate_type,
               fi.failure_mode, fi.failure_cause, fi.failure_mode_ratio,
               d.related_documents
        FROM PartIdentification pi
        LEFT JOIN PartCategorization pc ON pi.part_number = pc.part_number
        LEFT JOIN ManufacturerInformation mi ON pi.part_number = mi.part_number
        LEFT JOIN ReliabilityParameters rp ON pi.part_number = rp.part_number
        LEFT JOIN FailureInformation fi ON pi.part_number = fi.part_number
        LEFT JOIN Documents d ON pi.part_number = d.part_number
        """)

        data = cursor.fetchall()

        keys = [desc[0] for desc in cursor.description]
        data_dict = []

        for row in data:
            row_dict = dict(zip(keys, row))
            
            # Convert memoryview to bytes for Datasheet
            if isinstance(row_dict['datasheet'], memoryview):
                row_dict['datasheet'] = base64.b64encode(row_dict['datasheet']).decode('utf-8')

            # Convert memoryview to bytes for related_documents
            if isinstance(row_dict['related_documents'], memoryview):
                row_dict['related_documents'] = base64.b64encode(row_dict['related_documents']).decode('utf-8')
            
            data_dict.append(row_dict)

        cursor.close()
        conn.close()

        # Return JSON response
        return jsonify(data_dict)

    except psycopg2.Error as e:
        print("Error fetching data from PostgreSQL:", e)
        return jsonify({'error': 'Failed to fetch data'})
    
# backend flask side to save a row to the database after add button is clicked and related fields are filled in frontend react side
@app.route('/add_row', methods=['POST'])
def add_row():
    data = request.form.to_dict()
    print('Received data:',data)

    # Validate the data: check that all fields are present
    fields = ['part_name', 'part_number', 'bilgem_part_number', 'manufacturer', 'description', 'stock_information', 'category', 'subcategory', 'subcategory_type', 'remarks', 'mtbf_value', 'condition_environment_info', 'condition_confidence_level', 'condition_temperature_value', 'finishing_material', 'mtbf', 'failure_rate', 'failure_rate_type', 'failure_mode', 'failure_cause', 'failure_mode_ratio']
    if not all(key in data for key in fields):
        return jsonify({'error': 'Missing data'}), 400

    if 'datasheet' not in request.files or 'related_documents' not in request.files:
        return jsonify({'error': 'Missing files'}), 400

    datasheet_file = request.files['datasheet']
    related_documents_file = request.files['related_documents']

    datasheet_data = datasheet_file.read()
    related_documents_data = related_documents_file.read()
        
    print("Size of datasheet data:", len(datasheet_data))
    print("Size of related documents data:", len(related_documents_data))

    try:
        conn = psycopg2.connect(
            dbname = 'Failures',
            user = 'postgres',
            password = 'timberlaker.67',
            host = 'localhost',
            port = '5432'  
        )
        cursor = conn.cursor()


        cursor.execute("SELECT 1 FROM PartIdentification WHERE part_number = %s", (data['part_number'],))
        if cursor.fetchone():
            return jsonify({'error': 'Part number already exists'}), 400

        # Insert the new row into the database
        cursor.execute("""
        INSERT INTO PartIdentification (part_name, part_number, bilgem_part_number, manufacturer, datasheet, description, stock_information)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (data['part_name'], data['part_number'], data['bilgem_part_number'], data['manufacturer'],psycopg2.Binary(datasheet_data), data['description'], data['stock_information']))

        cursor.execute("""
        INSERT INTO PartCategorization (part_number, category, subcategory, subcategory_type, remarks)
        VALUES (%s, %s, %s, %s, %s)
        """, (data['part_number'], data['category'], data['subcategory'], data['subcategory_type'], data['remarks']))

        cursor.execute("""
        INSERT INTO ManufacturerInformation (part_number, mtbf_value, condition_environment_info, condition_confidence_level, condition_temperature_value, finishing_material)
        VALUES (%s, %s, %s, %s, %s, %s)
        """, (data['part_number'], data['mtbf_value'], data['condition_environment_info'], data['condition_confidence_level'], data['condition_temperature_value'], data['finishing_material']))

        cursor.execute("""
        INSERT INTO ReliabilityParameters (part_number, mtbf, failure_rate, failure_rate_type)
        VALUES (%s, %s, %s, %s)
        """, (data['part_number'], data['mtbf'], data['failure_rate'], data['failure_rate_type']))

        cursor.execute("""
        INSERT INTO FailureInformation (part_number, failure_mode, failure_cause, failure_mode_ratio)
        VALUES (%s, %s, %s, %s)
        """, (data['part_number'], data['failure_mode'], data['failure_cause'], data['failure_mode_ratio']))

        cursor.execute("""
        INSERT INTO Documents (part_number, related_documents)
        VALUES (%s, %s)
        """, (data['part_number'], psycopg2.Binary(related_documents_data)))


                       

        # Add similar insert statements for other tables...

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({'success': 'Row added successfully'})

    except psycopg2.Error as e:
        print("Error inserting data into PostgreSQL:", e)
        return jsonify({'error': 'Failed to add row'}), 50

# backend flask side to delete a row from database when delete button is clicked in frontend react side
@app.route('/delete_row' , methods=['DELETE'])
def delete_row():
    data=request.get_json()
    part_number = data['part_number']

    if not part_number:
        return jsonify({'error': 'Missing part_number'}), 400
    try:
        conn = psycopg2.connect(
            dbname = 'Failures',
            user = 'postgres',
            password='timberlaker.67',
            host='localhost',
            port='5432'
        )
        cursor = conn.cursor()

        #Delete the row from each table

        tables = ['PartCategorization', 'ManufacturerInformation', 'ReliabilityParameters', 'FailureInformation', 'Documents','PartIdentification']
        for table in tables:
            cursor.execute(f"DELETE FROM {table} WHERE part_number = %s", (part_number,))
        
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({'success': 'Row deleted successfully'})
    
    except psycopg2.Error as e:
        print("Error deleting data from PostgreSQL:", e)
        return jsonify({'error': 'Failed to delete row'}), 500


@app.route('/update_row', methods=['PUT'])
def update_row():
    data = request.form.to_dict()
    print('Received data:',data)

    # Check that part_number is present
    if 'part_number' not in data:
        return jsonify({'error': 'Missing part_number'}), 400

    try:
        conn = psycopg2.connect(
            dbname = 'Failures',
            user = 'postgres',
            password = 'timberlaker.67',
            host = 'localhost',
            port = '5432'  
        )
        cursor = conn.cursor()

        # Update the row in the database
        for table, fields in {
            'PartIdentification': ['part_name', 'bilgem_part_number', 'manufacturer', 'description', 'stock_information'],
            'PartCategorization': ['category', 'subcategory', 'subcategory_type', 'remarks'],
            'ManufacturerInformation': ['mtbf_value', 'condition_environment_info', 'condition_confidence_level', 'condition_temperature_value', 'finishing_material'],
            'ReliabilityParameters': ['mtbf', 'failure_rate', 'failure_rate_type'],
            'FailureInformation': ['failure_mode', 'failure_cause', 'failure_mode_ratio'],
            'Documents': ['related_documents']
        }.items():
            for field in fields:
                if field in data:
                    cursor.execute(f"UPDATE {table} SET {field} = %s WHERE part_number = %s", (data[field], data['part_number']))

        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({'success': 'Row updated successfully'})

    except psycopg2.Error as e:
        print("Error updating data in PostgreSQL:", e)
        return jsonify({'error': 'Failed to update row'}), 500  

@app.route('/download/<file_type>/<part_number>', methods=['GET'])
def download_file(file_type, part_number):
    # Query the database to get the file data for the given part_number and file_type
    conn = psycopg2.connect(
        dbname = 'Failures',
        user = 'postgres',
        password = 'timberlaker.67',
        host = 'localhost',
        port = '5432'  
    )
    cursor = conn.cursor()

    # Determine the correct table based on the file_type
    table_name = 'partidentification' if file_type == 'datasheet' else 'documents'

    cursor.execute(f"""
    SELECT {file_type} FROM {table_name} WHERE part_number = %s
    """, (part_number,))

    file_data = cursor.fetchone()[0]

    cursor.close()
    conn.close()

    # Create a BytesIO object from the file data
    file_io = BytesIO(file_data)

    # Create a Response object and set the Content-Disposition header to specify the filename
    response = Response(file_io, mimetype='application/pdf')
    response.headers.set('Content-Disposition', 'attachment', filename=f'{part_number}_{file_type}.pdf')

    return response

#This function is for getting the part numbers from the database and sending them to the frontend react side for autocomplete feature.
@app.route('/get_part_numbers', methods=['GET'])
def get_part_numbers():
    try:
        conn = psycopg2.connect(
            dbname='Failures',
            user='postgres',
            password='timberlaker.67',
            host='localhost',
            port='5432'
        )
        cursor = conn.cursor()

        cursor.execute("SELECT part_number FROM PartIdentification")
        part_numbers = [row[0] for row in cursor.fetchall()]

        cursor.close()
        conn.close()

        return jsonify(part_numbers)
    except psycopg2.Error as e:
        print("Error fetching part numbers from PostgreSQL:", e)
        return jsonify({'error': 'Failed to fetch part numbers'})
    
@app.route('/search', methods=['GET'])
def search():
    try:
        conn = psycopg2.connect(
            dbname='Failures',
            user='postgres',
            password='timberlaker.67',
            host='localhost',
            port='5432'
        )
        cursor = conn.cursor()

        # Get the filter value from the request parameters
        filter_value = request.args.get('filter', '')

        # Split the filter value by spaces to get individual words
        filter_words = filter_value.split()

        # Use the filter words in your SQL query to filter the data
        # Be careful to avoid SQL injection attacks by using parameterized queries
        query = """
        SELECT pi.part_name, pi.part_number, pi.bilgem_part_number, pi.manufacturer,
            pi.description, pi.stock_information,
            pc.category, pc.subcategory, pc.subcategory_type, pc.remarks,
            mi.mtbf_value, mi.condition_environment_info, mi.condition_confidence_level,
            mi.condition_temperature_value, mi.finishing_material,
            rp.mtbf, rp.failure_rate, rp.failure_rate_type,
            fi.failure_mode, fi.failure_cause, fi.failure_mode_ratio

        FROM PartIdentification pi
        LEFT JOIN PartCategorization pc ON pi.part_number = pc.part_number
        LEFT JOIN ManufacturerInformation mi ON pi.part_number = mi.part_number
        LEFT JOIN ReliabilityParameters rp ON pi.part_number = rp.part_number
        LEFT JOIN FailureInformation fi ON pi.part_number = fi.part_number
        LEFT JOIN Documents d ON pi.part_number = d.part_number"""

        # Only append the WHERE clause if there are any filter words
        if filter_words:
            query += " WHERE "

            # Add a condition for each filter word
            # Add a condition for each filter word
        # Add a condition for each filter word
        for i, word in enumerate(filter_words):
            if i > 0:
                query += " OR "
            query += "(pi.part_name ILIKE %s OR CAST(pi.part_number AS TEXT) ILIKE %s OR CAST(pi.bilgem_part_number AS TEXT) ILIKE %s OR pi.manufacturer ILIKE %s OR pi.description ILIKE %s OR pi.stock_information ILIKE %s OR pc.category ILIKE %s OR pc.subcategory ILIKE %s OR pc.subcategory_type ILIKE %s OR pc.remarks ILIKE %s OR CAST(mi.mtbf_value AS TEXT) ILIKE %s OR mi.condition_environment_info ILIKE %s OR CAST(mi.condition_confidence_level AS TEXT) ILIKE %s OR CAST(mi.condition_temperature_value AS TEXT) ILIKE %s OR mi.finishing_material ILIKE %s OR CAST(rp.mtbf AS TEXT) ILIKE %s OR CAST(rp.failure_rate AS TEXT) ILIKE %s OR rp.failure_rate_type ILIKE %s OR fi.failure_mode ILIKE %s OR fi.failure_cause ILIKE %s OR CAST(fi.failure_mode_ratio AS TEXT) ILIKE %s)"

        # Flatten the list of tuples into a single list
        params = [item for sublist in [("%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%", "%" + word + "%") for word in filter_words] for item in sublist]

        # Execute the query with the parameters
        cursor.execute(query, params)
        data = cursor.fetchall()

        keys = [desc[0] for desc in cursor.description]
        data_dict = []

        for row in data:
            row_dict = dict(zip(keys, row))
            data_dict.append(row_dict)

        cursor.close()
        conn.close()

        # Return JSON response
        return jsonify(data_dict)

    except psycopg2.Error as e:
        print("Error fetching data from PostgreSQL:", e)
        return jsonify({'error': 'Failed to fetch data'})
    
@app.route('/autocomplete', methods=['GET'])
def autocomplete():
    try:
        conn = psycopg2.connect(
            dbname='Failures',
            user='postgres',
            password='timberlaker.67',
            host='localhost',
            port='5432'
        )
        cursor = conn.cursor()

        # Get the filter value from the request parameters
        filter_value = request.args.get('filter', '')

        # Use the filter value in your SQL query to filter the data
        query = """
        SELECT DISTINCT pi.part_number
        FROM PartIdentification pi
        WHERE pi.part_number ILIKE %s
        LIMIT 10"""

        # Execute the query with the parameters
        cursor.execute(query, ("%" + filter_value + "%",))
        data = cursor.fetchall()

        # Flatten the list of tuples into a single list
        suggestions = [item[0] for item in data]

        cursor.close()
        conn.close()

        # Return JSON response
        return jsonify(suggestions)

    except psycopg2.Error as e:
        print("Error fetching data from PostgreSQL:", e)
        return jsonify({'error': 'Failed to fetch data'})
    
@app.route('/import', methods=['POST'])
def import_data():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    try:
        # Load the Excel file
        df = pd.read_excel(file, engine='openpyxl')
        df.columns = df.columns.str.strip()

        # Validate the data: check that all fields are present
        fields = ['part_name', 'part_number', 'bilgem_part_number', 'manufacturer', 'description', 'stock_information', 'category', 'subcategory', 'subcategory_type', 'remarks', 'mtbf_value', 'condition_environment_info', 'condition_confidence_level', 'condition_temperature_value', 'finishing_material', 'failure_rate_type', 'failure_mode', 'failure_cause', 'failure_mode_ratio']
        if not all(field in df.columns for field in fields):
            return jsonify({'error': 'Missing data'}), 400

        # Connect to the database
        conn = psycopg2.connect(
            dbname='Failures',
            user='postgres',
            password='timberlaker.67',
            host='localhost',
            port='5432'
        )
        cursor = conn.cursor()

        # Insert the data into the database
        for index, row in df.iterrows():
            # Check if part number already exists
            cursor.execute("SELECT 1 FROM PartIdentification WHERE part_number = %s", (row['part_number'],))
            if cursor.fetchone():
                continue  # Skip this row and continue with the next one

            # Insert the new row into the database
            cursor.execute("""
            INSERT INTO PartIdentification (part_name, part_number, bilgem_part_number, manufacturer, description, stock_information)
            VALUES (%s, %s, %s, %s, %s, %s)
            """, (row['part_name'], row['part_number'], row['bilgem_part_number'], row['manufacturer'], row['description'], row['stock_information']))

            cursor.execute("""
            INSERT INTO PartCategorization (part_number, category, subcategory, subcategory_type, remarks)
            VALUES (%s, %s, %s, %s, %s)
            """, (row['part_number'], row['category'], row['subcategory'], row['subcategory_type'], row['remarks']))

            cursor.execute("""
            INSERT INTO ManufacturerInformation (part_number, mtbf_value, condition_environment_info, condition_confidence_level, condition_temperature_value, finishing_material)
            VALUES (%s, %s, %s, %s, %s, %s)
            """, (row['part_number'], row['mtbf_value'], row['condition_environment_info'], row['condition_confidence_level'], row['condition_temperature_value'], row['finishing_material']))

            cursor.execute("""
            INSERT INTO ReliabilityParameters (part_number, mtbf, failure_rate, failure_rate_type)
            VALUES (%s, %s, %s, %s)
            """, (row['part_number'], row['mtbf'], row['failure_rate'], row['failure_rate_type']))

            cursor.execute("""
            INSERT INTO FailureInformation (part_number, failure_mode, failure_cause, failure_mode_ratio)
            VALUES (%s, %s, %s, %s)
            """, (row['part_number'], row['failure_mode'], row['failure_cause'], row['failure_mode_ratio']))

            
        
                               
        conn.commit()

        cursor.close()
        conn.close()

        return jsonify({'success': 'Data imported successfully'})

    except Exception as e:
        print("Error importing data:", e)
        return jsonify({'error': 'Failed to import data'}), 500
    

    





if __name__ == "__main__":
    app.run(host='localhost', port=5000, debug=True)
