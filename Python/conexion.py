import mysql.connector
import os
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuración de la base de datos usando variables de entorno
config = {
    "host": os.getenv("DATABASE_HOST"),
    "user": os.getenv("DATABASE_USERNAME"),
    "password": os.getenv("DATABASE_PASSWORD"),
    "database": os.getenv("DATABASE"),
    "use_pure": True,  # Usar la implementación pura de Python para evitar problemas con C extensions
    "protocol": "tcp"  # Forzar el uso de TCP/IP en lugar de named pipes
}

# Configuración de SSL
if os.getenv("RENDER"):  # Si estamos en Render
    config["ssl_ca"] = "/etc/ssl/certs/ca-certificates.crt"
else:  # Si estamos en local
    config["ssl_ca"] = os.path.join(os.path.dirname(__file__), "ca-certificates.crt")

config["ssl_verify_cert"] = True

# Función para conectar con la base de datos
def get_db_connection():
    try:
        conexion = mysql.connector.connect(**config)
        logger.info("✅ Conexión exitosa a la base de datos")
        return conexion
    except mysql.connector.Error as e:
        logger.error(f"❌ Error al conectar a MySQL: {e}")
        raise Exception(f"No se pudo conectar a la base de datos: {e}")
    except Exception as e:
        logger.error(f"❌ Error inesperado: {e}")
        raise Exception(f"No se pudo conectar a la base de datos: {e}")
