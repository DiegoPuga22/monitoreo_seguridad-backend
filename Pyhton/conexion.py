import mysql.connector
import logging

logger = logging.getLogger(__name__)  # Usará la configuración de app.py



def get_db_connection():
    try:
        conexion = mysql.connector.connect(
            host="jamadev.com",
            user="admin",
            password="5d9n7zJ@6",
            database="admin_plantify",
            charset="utf8",  # Usa utf8 en lugar de utf8mb4
            collation="utf8mb4_general_ci"
        )
        logger.info("Conexión a la base de datos exitosa")
        return conexion
    except mysql.connector.Error as e:
        logger.error(f"Error al conectar a MySQL: {e}")
        raise Exception(f"No se pudo conectar a la base de datos: {e}")