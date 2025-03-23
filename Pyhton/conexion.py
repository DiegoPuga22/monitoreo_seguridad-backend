import mysql.connector
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def get_db_connection():
    try:
        conexion = mysql.connector.connect(
            host="localhost",
            user="root",
            password="1234567890",
            database="monitoreo_seguridad"
        )
        return conexion
    except mysql.connector.Error as e:
        logger.error(f"Error al conectar a MySQL: {e}")
        raise Exception(f"No se pudo conectar a la base de datos: {e}")