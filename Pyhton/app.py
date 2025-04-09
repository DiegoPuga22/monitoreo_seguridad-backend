from flask import Flask, request, jsonify
import sys
import traceback
from flask_cors import CORS
from datetime import datetime, timedelta
import random
import pickle
import os
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import pandas as pd
from conexion import get_db_connection  # Importar desde conexion.py
import logging

# Configurar logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
logger.info("Iniciando el servidor Flask...")

app = Flask(__name__)
CORS(app)

# Ruta para modelos de aprendizaje
MODELS_DIR = "models/"
os.makedirs(MODELS_DIR, exist_ok=True)

# Manejador global de excepciones
@app.errorhandler(Exception)
def handle_exception(e):
    exc_type, exc_value, exc_traceback = sys.exc_info()
    traceback_details = traceback.format_exception(exc_type, exc_value, exc_traceback)
    error_message = "".join(traceback_details)
    logger.error(f"Error global: {error_message}")
    return jsonify({"error": str(e), "traceback": error_message}), 500

@app.route("/")
def home():
    logger.info("Accediendo a la ruta /")
    return "🔥 El servidor Flask está corriendo correctamente"

@app.route("/delegaciones", methods=["GET"])
def obtener_lista_delegaciones():
    logger.info("Accediendo a /delegaciones")
    try:
        conn = get_db_connection()
        if not conn:
            logger.error("No se pudo conectar a la base de datos")
            return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

        cursor = conn.cursor(dictionary=True)
        logger.debug("Ejecutando consulta SELECT * FROM v_lista_delegaciones")
        cursor.execute("SELECT * FROM v_lista_delegaciones")
        delegaciones = cursor.fetchall()
        
        cursor.close()
        conn.close()
        logger.info("Delegaciones obtenidas correctamente")
        return jsonify(delegaciones)
    except Exception as e:
        logger.error(f"Error en obtener_lista_delegaciones: {e}", exc_info=True)
        return jsonify({"error": str(e)}), 500

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

# Obtener incidentes por delegación y fecha (históricos o predicciones)
@app.route("/incidentes", methods=["GET"])
def obtener_incidentes():
    delegacion_id = request.args.get("delegacion_id")
    fecha = request.args.get("fecha")
    periodo = request.args.get("periodo", "day")

    # Validación mejorada de parámetros
    if not delegacion_id:
        return jsonify({"error": "Falta el parámetro 'delegacion_id'"}), 400

    # Manejo de fecha para predicciones mensuales
    if periodo == "month":
        if not fecha or fecha.strip() == "":
            # Si no se proporciona fecha, usar el mes actual
            fecha = datetime.now().strftime("%Y-%m")
        
        try:
            # Validar formato de fecha para mes
            year, month = map(int, fecha.split('-'))
            fecha_consulta = datetime(year, month, 1)
        except (ValueError, TypeError):
            return jsonify({"error": "Formato de fecha inválido para periodo 'month'. Usa 'YYYY-MM'"}), 400

        # Generar predicción si la fecha es futura
        if fecha_consulta > datetime.now():
            return generar_prediccion_incidentes(delegacion_id, fecha, periodo)

    elif periodo in ["day", "week"]:
        # Validación de fecha para día y semana
        if not fecha or fecha.strip() == "":
            fecha = datetime.now().strftime("%Y-%m-%d")
        
        try:
            fecha_consulta = datetime.strptime(fecha, "%Y-%m-%d")
        except ValueError:
            return jsonify({"error": "Formato de fecha inválido. Usa 'YYYY-MM-DD'"}), 400

        # Generar predicción si la fecha es futura
        if fecha_consulta > datetime.now():
            return generar_prediccion_incidentes(delegacion_id, fecha, periodo)

    # Conexión a la base de datos
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    cursor = conn.cursor(dictionary=True)

    try:
        # Consultas SQL por periodo (similar a tu código original)
        if periodo == "month":
            query = """
                SELECT 
                    i.id,
                    i.tipo,
                    i.ubicacion,
                    TIME_FORMAT(i.hora_incidente, '%H:%i') AS hora,
                    r.nombre AS riesgo,
                    r.codigo_color,
                    i.fecha_incidente AS fecha
                FROM 
                    incidentes i
                JOIN 
                    niveles_riesgo r ON i.nivel_riesgo_id = r.id
                WHERE 
                    i.delegacion_id = %s
                    AND YEAR(i.fecha_incidente) = %s
                    AND MONTH(i.fecha_incidente) = %s
                ORDER BY 
                    i.fecha_incidente, i.hora_incidente
            """
            cursor.execute(query, (delegacion_id, year, month))

        elif periodo == "week":
            query = """
                SELECT 
                    i.id,
                    i.tipo,
                    i.ubicacion,
                    TIME_FORMAT(i.hora_incidente, '%H:%i') AS hora,
                    r.nombre AS riesgo,
                    r.codigo_color,
                    i.fecha_incidente AS fecha
                FROM 
                    incidentes i
                JOIN 
                    niveles_riesgo r ON i.nivel_riesgo_id = r.id
                WHERE 
                    i.delegacion_id = %s
                    AND i.fecha_incidente >= %s
                    AND i.fecha_incidente <= DATE_ADD(%s, INTERVAL 6 DAY)
                ORDER BY 
                    i.fecha_incidente, i.hora_incidente
            """
            cursor.execute(query, (delegacion_id, fecha, fecha))

        elif periodo == "day":
            query = """
                SELECT 
                    i.id,
                    i.tipo,
                    i.ubicacion,
                    TIME_FORMAT(i.hora_incidente, '%H:%i') AS hora,
                    r.nombre AS riesgo,
                    r.codigo_color,
                    i.fecha_incidente AS fecha
                FROM 
                    incidentes i
                JOIN 
                    niveles_riesgo r ON i.nivel_riesgo_id = r.id
                WHERE 
                    i.delegacion_id = %s
                    AND i.fecha_incidente = %s
                ORDER BY 
                    i.hora_incidente
            """
            cursor.execute(query, (delegacion_id, fecha))
        else:
            return jsonify({"error": "Periodo inválido. Usa 'day', 'week' o 'month'"}), 400

        incidentes = cursor.fetchall()

    except Exception as e:
        return jsonify({"error": f"Error en la consulta: {str(e)}"}), 500
    finally:
        cursor.close()
        conn.close()

    return jsonify(incidentes)

# Función para entrenar o actualizar el modelo de predicción
def entrenar_modelo(delegacion_id):
    conn = get_db_connection()
    if not conn:
        print("❌ No se pudo conectar a la base de datos para entrenar el modelo")
        return None
    
    cursor = conn.cursor(dictionary=True)
    
    # Obtener datos históricos para entrenamiento
    query = """
        SELECT 
            HOUR(i.hora_incidente) as hora,
            DAYOFWEEK(i.fecha_incidente) as dia_semana,
            MONTH(i.fecha_incidente) as mes,
            i.tipo,
            i.ubicacion,
            i.nivel_riesgo_id
        FROM 
            incidentes i
        WHERE 
            i.delegacion_id = %s
        ORDER BY 
            i.fecha_incidente DESC, i.hora_incidente DESC
        LIMIT 1000
    """
    
    try:
        cursor.execute(query, (delegacion_id,))
        datos_entrenamiento = cursor.fetchall()
        
        if not datos_entrenamiento or len(datos_entrenamiento) < 10:
            print(f"⚠️ Datos insuficientes para entrenar modelo de delegación {delegacion_id}")
            cursor.close()
            conn.close()
            return None
        
        # Preparar datos para el modelo
        df = pd.DataFrame(datos_entrenamiento)
        
        # Codificar variables categóricas
        df_encoded = pd.get_dummies(df, columns=['tipo', 'ubicacion'])
        
        # Características (X) y objetivo (y)
        X = df_encoded.drop('nivel_riesgo_id', axis=1)
        y = df_encoded['nivel_riesgo_id']
        
        # Entrenar modelo (RandomForest como ejemplo)
        model = RandomForestClassifier(n_estimators=100)
        model.fit(X, y)
        
        # Guardar el modelo entrenado
        model_path = os.path.join(MODELS_DIR, f"modelo_delegacion_{delegacion_id}.pkl")
        
        # Guardar también la estructura de las columnas para usar en predicciones
        model_data = {
            'model': model,
            'columns': X.columns.tolist()
        }
        
        with open(model_path, 'wb') as file:
            pickle.dump(model_data, file)
        
        print(f"✅ Modelo entrenado y guardado para delegación {delegacion_id}")
        
        # Guardar también un modelo para tipos de incidentes
        tipos_query = """
            SELECT tipo, COUNT(*) as count 
            FROM incidentes 
            WHERE delegacion_id = %s 
            GROUP BY tipo
        """
        cursor.execute(tipos_query, (delegacion_id,))
        tipos_incidentes = {row['tipo']: row['count'] for row in cursor.fetchall()}
        
        tipos_path = os.path.join(MODELS_DIR, f"tipos_delegacion_{delegacion_id}.pkl")
        with open(tipos_path, 'wb') as file:
            pickle.dump(tipos_incidentes, file)
        
        # Guardar modelo para ubicaciones
        ubicaciones_query = """
            SELECT ubicacion, COUNT(*) as count 
            FROM incidentes 
            WHERE delegacion_id = %s 
            GROUP BY ubicacion
        """
        cursor.execute(ubicaciones_query, (delegacion_id,))
        ubicaciones = {row['ubicacion']: row['count'] for row in cursor.fetchall()}
        
        ubicaciones_path = os.path.join(MODELS_DIR, f"ubicaciones_delegacion_{delegacion_id}.pkl")
        with open(ubicaciones_path, 'wb') as file:
            pickle.dump(ubicaciones, file)
        
        cursor.close()
        conn.close()
        return model_data
    
    except Exception as e:
        print(f"❌ Error al entrenar modelo: {e}")
        cursor.close()
        conn.close()
        return None

# Cargar modelo existente o entrenar uno nuevo
def cargar_o_entrenar_modelo(delegacion_id):
    model_path = os.path.join(MODELS_DIR, f"modelo_delegacion_{delegacion_id}.pkl")
    
    # Verificar si existe un modelo entrenado
    if os.path.exists(model_path):
        try:
            with open(model_path, 'rb') as file:
                model_data = pickle.load(file)
                # Verificar si el modelo tiene más de 30 días
                if os.path.getmtime(model_path) < (datetime.now() - timedelta(days=30)).timestamp():
                    print("⚠️ Modelo existente pero antiguo, reentrenando...")
                    return entrenar_modelo(delegacion_id) or model_data
                return model_data
        except Exception as e:
            print(f"❌ Error al cargar modelo existente: {e}")
    
    # Si no existe o hubo error, entrenar nuevo modelo
    return entrenar_modelo(delegacion_id)

# Función mejorada para generar predicciones de incidentes
def generar_prediccion_incidentes(delegacion_id, fecha_base, periodo):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    cursor = conn.cursor(dictionary=True)
    
    # Obtener información de la delegación
    cursor.execute("SELECT nombre FROM delegaciones WHERE id = %s", (delegacion_id,))
    delegacion = cursor.fetchone()
    
    if not delegacion:
        cursor.close()
        conn.close()
        return jsonify({"error": "Delegación no encontrada"}), 404
    
    # Cargar o entrenar modelo para esta delegación
    model_data = cargar_o_entrenar_modelo(delegacion_id)
    
    # Cargar distribuciones de tipos y ubicaciones
    tipos_path = os.path.join(MODELS_DIR, f"tipos_delegacion_{delegacion_id}.pkl")
    ubicaciones_path = os.path.join(MODELS_DIR, f"ubicaciones_delegacion_{delegacion_id}.pkl")
    
    try:
        with open(tipos_path, 'rb') as file:
            tipos_incidentes = pickle.load(file)
    except:
        # Si no existe, obtener de la base de datos
        cursor.execute("""
            SELECT tipo, COUNT(*) as count 
            FROM incidentes 
            WHERE delegacion_id = %s 
            GROUP BY tipo 
            ORDER BY count DESC 
            LIMIT 10
        """, (delegacion_id,))
        tipos_incidentes = {row['tipo']: row['count'] for row in cursor.fetchall()}
    
    try:
        with open(ubicaciones_path, 'rb') as file:
            ubicaciones_dict = pickle.load(file)
            ubicaciones = [{"ubicacion": ubicacion} for ubicacion in ubicaciones_dict.keys()]
    except:
        # Si no existe, obtener de la base de datos
        cursor.execute("""
            SELECT DISTINCT ubicacion 
            FROM incidentes 
            WHERE delegacion_id = %s 
            ORDER BY RAND() 
            LIMIT 20
        """, (delegacion_id,))
        ubicaciones = cursor.fetchall()
    
    # Si no hay ubicaciones, crear algunas genéricas
    if not ubicaciones:
        ubicaciones = [
            {"ubicacion": f"Calle Principal {i}, {delegacion['nombre']}"} 
            for i in range(1, 6)
        ]
    
    # Si no hay tipos de incidentes, crear algunos genéricos
    if not tipos_incidentes:
        tipos_incidentes = {
            "Asalto a transeúnte": 10,
            "Robo de vehículo": 8,
            "Asalto a negocio": 6,
            "Robo a casa habitación": 5,
            "Asalto con violencia": 4
        }
    
    # Obtener los niveles de riesgo
    cursor.execute("SELECT id, nombre, codigo_color FROM niveles_riesgo")
    niveles_riesgo = cursor.fetchall()
    
    # Crear mapa de ID a nivel de riesgo
    riesgo_map = {nivel['id']: nivel for nivel in niveles_riesgo}
    
    # Generar predicciones según el periodo
    fecha_base_obj = datetime.strptime(fecha_base, "%Y-%m-%d")
    predicciones = []
    
    if periodo == "day":
        # Para un día, generar entre 3-8 incidentes
        num_incidentes = random.randint(3, 8)
        for i in range(num_incidentes):
            predicciones.append(generar_incidente_con_modelo(
                fecha_base_obj, 
                tipos_incidentes, 
                ubicaciones, 
                riesgo_map,
                model_data
            ))
    
    elif periodo == "week":
        # Para una semana, generar incidentes para cada día
        for i in range(7):
            fecha_dia = fecha_base_obj + timedelta(days=i)
            num_incidentes = random.randint(2, 6)
            for j in range(num_incidentes):
                predicciones.append(generar_incidente_con_modelo(
                    fecha_dia, 
                    tipos_incidentes, 
                    ubicaciones, 
                    riesgo_map,
                    model_data
                ))
    
    elif periodo == "month":
        # Para un mes, extraer año y mes
        year, month = fecha_base.split('-')
        # Determinar el número de días en el mes
        if month == '02':
            if (int(year) % 4 == 0 and int(year) % 100 != 0) or (int(year) % 400 == 0):
                dias_en_mes = 29
            else:
                dias_en_mes = 28
        elif month in ['04', '06', '09', '11']:
            dias_en_mes = 30
        else:
            dias_en_mes = 31
            
        # Generar incidentes para cada día del mes
        for i in range(dias_en_mes):
            fecha_dia = datetime(int(year), int(month), i+1)
            num_incidentes = random.randint(1, 5)
            for j in range(num_incidentes):
                predicciones.append(generar_incidente_con_modelo(
                    fecha_dia, 
                    tipos_incidentes, 
                    ubicaciones, 
                    riesgo_map,
                    model_data
                ))
    
    cursor.close()
    conn.close()
    
    # Ordenar predicciones por fecha y hora
    predicciones.sort(key=lambda x: (x['fecha'], x['hora']))
    
    return jsonify(predicciones)

# Función para generar un incidente usando el modelo entrenado
def generar_incidente_con_modelo(fecha, tipos_incidentes, ubicaciones, riesgo_map, model_data):
    # Elegir un tipo de incidente con probabilidad ponderada por su frecuencia
    tipos = list(tipos_incidentes.keys())
    pesos = list(tipos_incidentes.values())
    selected_tipo = random.choices(tipos, weights=pesos)[0]
    
    # Elegir una ubicación aleatoria
    selected_ubicacion = random.choice(ubicaciones)['ubicacion']
    
    # Generar una hora que tenga en cuenta patrones temporales
    # Las horas se generan con mayor probabilidad en horas con más incidentes históricos
    hour = random.choices(
        range(24),
        weights=[3, 2, 1, 1, 1, 2, 3, 5, 7, 6, 5, 6, 7, 6, 5, 6, 7, 8, 10, 12, 15, 13, 10, 5]
    )[0]
    minute = random.randint(0, 59)
    
    # Si tenemos un modelo entrenado, usarlo para predecir el nivel de riesgo
    if model_data:
        try:
            model = model_data['model']
            columns = model_data['columns']
            
            # Crear un dataframe con las características del incidente
            data = {
                'hora': [hour],
                'dia_semana': [fecha.weekday() + 1],  # 1-7 para día de la semana
                'mes': [fecha.month]
            }
            
            # Crear dataframe inicial
            df_pred = pd.DataFrame(data)
            
            # Crear columnas dummy para tipo y ubicación
            for col in columns:
                if col.startswith('tipo_'):
                    tipo_col = col.replace('tipo_', '')
                    df_pred[col] = 1 if tipo_col == selected_tipo else 0
                elif col.startswith('ubicacion_'):
                    ubicacion_col = col.replace('ubicacion_', '')
                    df_pred[col] = 1 if ubicacion_col == selected_ubicacion else 0
                elif col not in df_pred.columns:
                    df_pred[col] = 0  # Añadir columna faltante con valor 0
            
            # Asegurar que tenemos todas las columnas necesarias
            missing_cols = set(columns) - set(df_pred.columns)
            for col in missing_cols:
                df_pred[col] = 0
                
            # Ordenar columnas igual que el modelo
            df_pred = df_pred[columns]
            
            # Predecir nivel de riesgo
            nivel_riesgo_id = model.predict(df_pred)[0]
            nivel_riesgo = riesgo_map.get(nivel_riesgo_id)
            
            if not nivel_riesgo:
                # Si no podemos encontrar el nivel en el mapa, usar uno aleatorio
                nivel_riesgo = random.choice(list(riesgo_map.values()))
        
        except Exception as e:
            print(f"❌ Error al usar modelo para predicción: {e}")
            # En caso de error, usar un nivel aleatorio
            nivel_riesgo = random.choice(list(riesgo_map.values()))
    else:
        # Si no hay modelo, elegir un nivel aleatorio
        nivel_riesgo = random.choice(list(riesgo_map.values()))
    
    return {
        'id': f"pred-{random.randint(10000, 99999)}",
        'tipo': selected_tipo,
        'ubicacion': selected_ubicacion,
        'hora': f"{hour:02d}:{minute:02d}",
        'riesgo': nivel_riesgo['nombre'],
        'codigo_color': nivel_riesgo['codigo_color'],
        'fecha': fecha.strftime("%Y-%m-%d"),
        'es_prediccion': True
    }

# Ruta para registrar retroalimentación sobre predicciones
@app.route("/retroalimentacion", methods=["POST"])
def registrar_retroalimentacion():
    data = request.json
    
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Datos inválidos"}), 400
    
    # Verificar datos requeridos
    required_fields = ["incidente_id", "delegacion_id", "tipo", "ubicacion", "fecha", "hora", "nivel_riesgo_id"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Falta el campo '{field}'"}), 400
    
    # Verificar si es una predicción (debe tener prefijo "pred-")
    if not data["incidente_id"].startswith("pred-"):
        return jsonify({"error": "Solo se puede registrar retroalimentación para predicciones"}), 400
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    cursor = conn.cursor()
    
    try:
        # Insertar la retroalimentación en una tabla de entrenamiento
        query = """
            INSERT INTO predicciones_confirmadas (
                incidente_original_id, delegacion_id, tipo, ubicacion, 
                fecha_incidente, hora_incidente, nivel_riesgo_id, confirmado
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        
        cursor.execute(query, (
            data["incidente_id"],
            data["delegacion_id"],
            data["tipo"],
            data["ubicacion"],
            data["fecha"],
            data["hora"],
            data["nivel_riesgo_id"],
            data.get("confirmado", True)
        ))
        
        conn.commit()
        
        # Reentrenar el modelo
        entrenar_modelo(data["delegacion_id"])
        
        cursor.close()
        conn.close()
        
        return jsonify({"success": True, "message": "Retroalimentación registrada correctamente"})
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": f"Error al registrar retroalimentación: {str(e)}"}), 500

# Ruta para migrar predicciones confirmadas a la tabla de incidentes reales
@app.route("/migrar_predicciones", methods=["POST"])
def migrar_predicciones():
    """
    Migra las predicciones confirmadas a la tabla de incidentes reales.
    Esto se puede ejecutar diariamente mediante un trabajo programado.
    """
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500
    
    cursor = conn.cursor()
    
    try:
        # Migrar predicciones confirmadas
        query = """
            INSERT INTO incidentes (
                delegacion_id, tipo, ubicacion, fecha_incidente, 
                hora_incidente, nivel_riesgo_id, origen
            )
            SELECT 
                delegacion_id, tipo, ubicacion, fecha_incidente, 
                hora_incidente, nivel_riesgo_id, 'predicción'
            FROM 
                predicciones_confirmadas
            WHERE 
                confirmado = TRUE
                AND migrado = FALSE
        """
        
        cursor.execute(query)
        rows_affected = cursor.rowcount
        
        # Marcar como migradas
        if rows_affected > 0:
            cursor.execute("UPDATE predicciones_confirmadas SET migrado = TRUE WHERE confirmado = TRUE AND migrado = FALSE")
        
        conn.commit()
        
        # Reentrenar todos los modelos afectados
        cursor.execute("SELECT DISTINCT delegacion_id FROM predicciones_confirmadas WHERE migrado = TRUE")
        delegaciones = cursor.fetchall()
        
        for row in delegaciones:
            delegacion_id = row[0]
            entrenar_modelo(delegacion_id)
        
        cursor.close()
        conn.close()
        
        return jsonify({
            "success": True, 
            "message": f"Se migraron {rows_affected} predicciones confirmadas a incidentes reales"
        })
    
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"error": f"Error al migrar predicciones: {str(e)}"}), 500

# Rutas adicionales (mantener las existentes)
@app.route("/estadisticas_historicas", methods=["GET"])
def obtener_estadisticas_historicas():
    # Código original sin cambios
    delegacion_id = request.args.get("delegacion_id")
    dias = request.args.get("dias", 30)

    if not delegacion_id:
        return jsonify({"error": "Falta el parámetro 'delegacion_id'"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "No se pudo conectar a la base de datos"}), 500

    cursor = conn.cursor(dictionary=True)
    cursor.execute("CALL obtener_estadisticas_historicas(%s, %s)", (delegacion_id, dias))
    data = cursor.fetchall()

    cursor.close()
    conn.close()
    return jsonify(data)

if __name__ == "__main__":
    logger.info("Lanzando el servidor en puerto 5000...")
    app.run(debug=True, port=5000)