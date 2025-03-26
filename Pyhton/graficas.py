from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configuración de la base de datos
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "Fernanda0202",  
    "database": "monitoreo_seguridad"
}

# Función para conectar con la base de datos
def get_db_connection():
    try:
        conn = mysql.connector.connect(**DB_CONFIG)
        return conn
    except mysql.connector.Error as err:
        print(f"❌ Error de conexión a la base de datos: {err}")
        return None

# Ruta para obtener las zonas de riesgo
@app.route('/api/zonas_riesgo', methods=['GET'])
def get_zonas_riesgo():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # Return results as dictionaries
    
    # Consulta para calcular los porcentajes de riesgo
    cursor.execute(''' 
        SELECT 
            d.id, 
            d.nombre,
            ROUND((SUM(CASE WHEN nr.codigo_color = 'danger' THEN 1 ELSE 0 END) / COUNT(i.id)) * 100) AS red,
            ROUND((SUM(CASE WHEN nr.codigo_color = 'warning' THEN 1 ELSE 0 END) / COUNT(i.id)) * 100) AS yellow,
            ROUND((SUM(CASE WHEN nr.codigo_color = 'success' THEN 1 ELSE 0 END) / COUNT(i.id)) * 100) AS green,
            COUNT(i.id) AS total
        FROM delegaciones d
        LEFT JOIN incidentes i ON d.id = i.delegacion_id
        LEFT JOIN niveles_riesgo nr ON i.nivel_riesgo_id = nr.id
        WHERE i.fecha_incidente >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY d.id
    ''')
    
    zonas_riesgo = cursor.fetchall()
    cursor.close()
    conn.close()
    
    return jsonify(zonas_riesgo)

# Ruta para obtener las estimaciones de riesgo
@app.route('/api/estimaciones_riesgo', methods=['GET'])
def get_estimaciones_riesgo():
    delegacion_id = request.args.get('delegacion_id', default=None, type=int)
    dias = request.args.get('dias', default=7, type=int)
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Llamada al procedimiento almacenado para obtener las predicciones
    cursor.callproc('obtener_predicciones', [delegacion_id, dias])
    
    estimaciones_riesgo = []
    for result in cursor.stored_results():
        estimaciones_riesgo = result.fetchall()
    
    cursor.close()
    conn.close()
    
    return jsonify(estimaciones_riesgo)

# Ruta de prueba para ver si la API corre


if __name__ == "__main__":
    app.run(debug=True, port=5001)
