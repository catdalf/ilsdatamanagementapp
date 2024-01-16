from flask import Flask,jsonify
import psycopg2
from flask_cors import CORS
db_name = 'Failures'
db_user = 'postgres'
db_password = 'timberlaker.67'
db_host = 'localhost'  
db_port = '5432'  
app = Flask(__name__)
CORS(app)

@app.route('/get_data_from_database', methods=['GET'])
def get_data():
    try:
        conn = psycopg2.connect(
            dbname=db_name,
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port
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
        data_dict = [dict(zip(keys, row)) for row in data]

        cursor.close()
        conn.close()

        # Return JSON response
        return jsonify(data_dict)

    except psycopg2.Error as e:
        print("Error fetching data from PostgreSQL:", e)
        return jsonify({'error': 'Failed to fetch data'})

if __name__ == "__main__":
    app.run(host='localhost', port=5000, debug=True)
