from flask import Flask,jsonify,request
import psycopg2
from flask_cors import CORS

dbname = 'Failures'
user = 'postgres'
password = 'timberlaker.67'
host = 'localhost'  
port = '5432'  
app = Flask(__name__)
CORS(app)

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
        SELECT pi.part_name, pi.part_number, pi.BILGEM_Part_Number, pi.Manufacturer, pi.Datasheet,
               pi.Description, pi.Stock_Information,
               pc.category, pc.subcategory, pc.subcategory_type, pc.remarks,
               mi.MTBF_value, mi.condition_environment_info, mi.condition_confidence_level,
               mi.condition_temperature_value, mi.Finishing_material,
               rp.MTBF, rp.Failure_Rate, rp.Failure_Rate_Type,
               fi.Failure_Mode, fi.Failure_Cause, fi.Failure_Mode_Ratio,
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
            if isinstance(row_dict['Datasheet'], memoryview):
                row_dict['Datasheet'] = row_dict['Datasheet'].tobytes()
            
            # Convert memoryview to bytes for related_documents
            if isinstance(row_dict['related_documents'], memoryview):
                row_dict['related_documents'] = row_dict['related_documents'].tobytes()
            
            data_dict.append(row_dict)

        cursor.close()
        conn.close()

        # Return JSON response
        return jsonify(data_dict)

    except psycopg2.Error as e:
        print("Error fetching data from PostgreSQL:", e)
        return jsonify({'error': 'Failed to fetch data'})
    

@app.route('/add_row', methods=['POST'])
def add_row():
    data = request.form.to_dict()
    print('Received data:',data)

    # Validate the data: check that all fields are present
    fields = ['part_name', 'part_number', 'BILGEM_Part_Number', 'Manufacturer', 'Description', 'Stock_Information', 'Category', 'Subcategory', 'Subcategory_Type', 'Remarks', 'MTBF_Value', 'Condition_Environment_Info', 'Condition_Confidence_Level', 'Condition_Temperature_Value', 'Finishing_Material', 'MTBF', 'Failure_Rate', 'Failure_Rate_Type', 'Failure_Mode', 'Failure_Cause', 'Failure_Mode_Ratio']
    if not all(key in data for key in fields):
        return jsonify({'error': 'Missing data'}), 400

    if 'Datasheet' not in request.files or 'Related_Documents' not in request.files:
        return jsonify({'error': 'Missing files'}), 400

    datasheet_file = request.files['Datasheet']
    related_documents_file = request.files['Related_Documents']

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
        INSERT INTO PartIdentification (part_name, part_number, BILGEM_Part_Number, Manufacturer, Datasheet, Description, Stock_Information)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (data['part_name'], data['part_number'], data['BILGEM_Part_Number'], data['Manufacturer'],psycopg2.Binary(datasheet_data), data['Description'], data['Stock_Information']))

        cursor.execute("""
        INSERT INTO PartCategorization (part_number, category, subcategory, subcategory_type, remarks)
        VALUES (%s, %s, %s, %s, %s)
        """, (data['part_number'], data['Category'], data['Subcategory'], data['Subcategory_Type'], data['Remarks']))

        cursor.execute("""
        INSERT INTO ManufacturerInformation (part_number, MTBF_value, condition_environment_info, condition_confidence_level, condition_temperature_value, Finishing_material)
        VALUES (%s, %s, %s, %s, %s, %s)
        """, (data['part_number'], data['MTBF_Value'], data['Condition_Environment_Info'], data['Condition_Confidence_Level'], data['Condition_Temperature_Value'], data['Finishing_Material']))

        cursor.execute("""
        INSERT INTO ReliabilityParameters (part_number, MTBF, Failure_Rate, Failure_Rate_Type)
        VALUES (%s, %s, %s, %s)
        """, (data['part_number'], data['MTBF'], data['Failure_Rate'], data['Failure_Rate_Type']))

        cursor.execute("""
        INSERT INTO FailureInformation (part_number, Failure_Mode, Failure_Cause, Failure_Mode_Ratio)
        VALUES (%s, %s, %s, %s)
        """, (data['part_number'], data['Failure_Mode'], data['Failure_Cause'], data['Failure_Mode_Ratio']))

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
    


if __name__ == "__main__":
    app.run(host='localhost', port=5000, debug=True)
