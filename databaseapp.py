from flask import Flask,jsonify,request
import psycopg2
from flask_cors import CORS
import base64



dbname = 'Failures'
user = 'postgres'
password = 'timberlaker.67'
host = 'localhost'  
port = '5432'  
app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})



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


    try:
        conn = psycopg2.connect(
            dbname = 'Failures',
            user = 'postgres',
            password = 'timberlaker.67',
            host = 'localhost',
            port = '5432'  
        )
        cursor = conn.cursor()

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






if __name__ == "__main__":
    app.run(host='localhost', port=5000, debug=True)
