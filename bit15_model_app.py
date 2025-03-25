# -*- coding: utf-8 -*-
import os
import datetime
import logging
import numpy as np
import pandas as pd
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import bigquery
from ahpy import Compare
from skcriteria import Objective
from skcriteria.agg.similarity import TOPSIS
from skcriteria import mkdm
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.cluster import KMeans
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import silhouette_score
import google.cloud.logging
from google.cloud.logging.handlers import CloudLoggingHandler

# ตั้งค่า logging สำหรับ production
logging.basicConfig(level=logging.INFO)
client = google.cloud.logging.Client()
handler = CloudLoggingHandler(client)
cloud_logger = logging.getLogger('cloudLogger')
cloud_logger.setLevel(logging.INFO)
cloud_logger.addHandler(handler)


# =======================================================
# สร้าง Flask app และตั้งค่า CORS, BigQuery Client
# =======================================================
app = Flask(__name__)
# ตั้งค่า CORS โดยใช้ environment variable สำหรับ allowed origin
# CORS(app, resources={r"/*": {"origins": os.environ.get("CORS_ORIGIN", "http://localhost:3000")}})
# แทนที่โค้ด CORS เดิม
CORS(app, 
     resources={r"/*": {"origins": "*"}},
     supports_credentials=True,
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Authorization"])

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy"}), 200

@app.errorhandler(Exception)
def handle_exception(e):
    # แจ้ง error แบบมีโครงสร้าง
    logging.error(f"Unhandled exception: {str(e)}")
    return jsonify({
        "error": "Internal server error",
        "message": str(e)
    }), 500

# ตั้งค่า BigQuery Client (ตั้งค่า PROJECT_ID, DATASET_ID, MODEL_TABLE_ID, USERPROFILES_TABLE ผ่าน environment variables)
PROJECT_ID = os.environ.get("PROJECT_ID", "bit15-ev-decision-support")
DATASET_ID = os.environ.get("DATASET_ID", "EV_Dataset")
MODEL_TABLE_ID = os.environ.get("MODEL_TABLE_ID", "Model")
USERPROFILES_TABLE = os.environ.get("USERPROFILES_TABLE", "UserProfiles")

try:
    bq_client = bigquery.Client(project=PROJECT_ID)
except Exception as e:
    logging.error(f"Failed to initialize BigQuery client: {str(e)}")
    # ลองใช้ default credentials
    bq_client = bigquery.Client()

# =======================================================
# ส่วนฟังก์ชันเตรียมข้อมูล (สำหรับตาราง Model)
# =======================================================
def load_and_preprocess_data():
    try:
        query = f"SELECT * FROM `{PROJECT_ID}.{DATASET_ID}.{MODEL_TABLE_ID}`"
        df = bq_client.query(query).to_dataframe()
        df.columns = df.columns.str.strip().str.replace(' ', '').str.replace('-', '').str.replace('_', '').str.lower()
        numeric_cols = ['range', 'topspeed', 'accelarate', 'efficiency', 'battery', 'estimatedthbvalue', 'fastcharge']
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col].astype(str).str.replace(',', ''), errors='coerce')
        return df.dropna(subset=numeric_cols)
    except Exception as e:
        logging.error(f"Error loading data: {str(e)}")
        raise

# =======================================================
# ส่วน Clustering และจัดการข้อมูลผู้ใช้
# =======================================================
def transform_user_features(profile):
    mappings = {
        'gender': {'male': 1, 'female': 2, 'other': 3},
        'age_range': {'18-24': 1, '25-34': 2, '35-44': 3, '45-54': 4, '55-64': 5, '65+': 6},
        'occupation': {'student': 1, 'employed': 2, 'self-employed': 3, 'unemployed': 4, 'retired': 5},
        'marital_status': {'single': 1, 'married': 2, 'divorced': 3, 'widowed': 4},
        'family_status': {'no_children': 1, 'with_children': 2},
        'income_range': {'low': 1, 'medium': 2, 'high': 3, 'very_high': 4},
        'vehicle_status': {'have': 0, "don't_have": 1},
        'driveCon': {'ระบบขับเคลื่อนสี่ล้อแบบอัตโนมัติ': 0,
                     'ระบบขับเคลื่อนล้อหน้า': 1,
                     'ระบบขับเคลื่อนล้อหลัง': 2}
    }
    features = [
        mappings['gender'].get(profile.get('gender', 'other'), 3),
        mappings['age_range'].get(profile.get('age_range', '35-44'), 3),
        mappings['occupation'].get(profile.get('occupation', 'employed'), 2),
        mappings['marital_status'].get(profile.get('marital_status', 'single'), 1),
        mappings['family_status'].get(profile.get('family_status', 'no_children'), 1),
        mappings['income_range'].get(profile.get('income_range', 'medium'), 2),
        mappings['vehicle_status'].get(profile.get('vehicle_status', "don't_have"), 1),
        mappings['driveCon'].get(profile.get('driveCon', 'ระบบขับเคลื่อนสี่ล้อแบบอัตโนมัติ'), 0)
    ]
    user_df = pd.DataFrame([features], columns=[
        'gender', 'age_range', 'occupation', 'marital_status',
        'family_status', 'income_range', 'vehicle_status', 'driveCon'
    ])
    user_df['seats'] = int(profile.get('seats', 5))
    weight_cols = {
        'battery_weight': 14.28,
        'range_weight': 14.28,
        'accelarate_weight': 14.28,
        'topspeed_weight': 14.28,
        'efficiency_weight': 14.28,
        'fastcharge_weight': 14.28,
        'price_weight': 14.32
    }
    for col, val in weight_cols.items():
        user_df[col] = val
    return user_df

def get_cluster_average_weights(cluster_id):
    try:
        query = f"""
        SELECT
            AVG(battery_weight) as battery,
            AVG(range_weight) as `range`,
            AVG(accelarate_weight) as accelarate,
            AVG(topspeed_weight) as topspeed,
            AVG(efficiency_weight) as efficiency,
            AVG(fastcharge_weight) as fastcharge,
            AVG(price_weight) as estimatedthbvalue
        FROM `{PROJECT_ID}.{DATASET_ID}.{USERPROFILES_TABLE}`
        WHERE cluster_id = '{cluster_id}'
        """
        result = bq_client.query(query).to_dataframe()
        if len(result) > 0 and not result.iloc[0].isnull().all():
            weights = result.iloc[0].fillna(0).to_dict()
            for k, v in weights.items():
                if v == 0:
                    weights[k] = 14.28 if k != 'estimatedthbvalue' else 14.32
            return weights
        else:
            return {
                'battery': 14.28,
                'range': 14.28,
                'accelarate': 14.28,
                'topspeed': 14.28,
                'efficiency': 14.28,
                'fastcharge': 14.28,
                'estimatedthbvalue': 14.32
            }
    except Exception as e:
        logging.error(f"Error getting cluster weights: {str(e)}")
        return {
            'battery': 14.28,
            'range': 14.28,
            'accelarate': 14.28,
            'topspeed': 14.28,
            'efficiency': 14.28,
            'fastcharge': 14.28,
            'estimatedthbvalue': 14.32
        }

def predict_user_cluster(profile):
    try:
        os.makedirs('models', exist_ok=True)
        if not all(os.path.exists(f'models/{f}') for f in ['preprocessor.pkl', 'user_scaler.pkl', 'user_cluster_model.pkl']):
            build_user_clustering_model()
        preprocessor = joblib.load('models/preprocessor.pkl')
        scaler = joblib.load('models/user_scaler.pkl')
        cluster_model = joblib.load('models/user_cluster_model.pkl')
        user_df = transform_user_features(profile)
        user_encoded = preprocessor.transform(user_df)
        if hasattr(user_encoded, "toarray"):
            user_encoded = user_encoded.toarray()
        user_encoded = user_encoded.astype(float)
        user_scaled = scaler.transform(user_encoded)
        user_cluster = int(cluster_model.predict(user_scaled)[0])
        return user_cluster
    except Exception as e:
        logging.error(f"Cluster prediction error: {str(e)}")
        return 0

def create_hybrid_weights(user_weights, cluster_id):
    cluster_weights = get_cluster_average_weights(cluster_id)
    hybrid = {
        k: (user_weights.get(k, 0) * 0.7 + cluster_weights.get(k, 0) * 0.3)
        for k in set(user_weights) | set(cluster_weights)
    }
    total = sum(hybrid.values())
    hybrid = {k: (v / total) * 100 for k, v in hybrid.items()}
    return hybrid


def calculate_ahp_topsis(weights, drive_config, seats):
    try:
        df = load_and_preprocess_data()
        numeric_cols = ['range', 'topspeed', 'accelarate', 'efficiency', 'battery', 'estimatedthbvalue', 'fastcharge']
        valid_weights = {k: v for k, v in weights.items() if k in numeric_cols}
        if len(valid_weights) != len(numeric_cols):
            raise ValueError("ค่าน้ำหนักและคอลัมน์ไม่ตรงกัน")
        comparisons = {(k1, k2): valid_weights[k1] / valid_weights[k2]
                       for i, k1 in enumerate(valid_weights) for k2 in list(valid_weights)[i+1:]}
        ahp_model = Compare('Criteria Comparison', comparisons)
        if ahp_model.consistency_ratio >= 0.1:
            return []
        ahp_weights = ahp_model.target_weights
        objectives = [Objective.MAX if c not in ['accelarate', 'estimatedthbvalue', 'efficiency'] else Objective.MIN
                      for c in numeric_cols]
        dm = mkdm(
            matrix=df[numeric_cols].values,
            objectives=objectives,
            weights=list(ahp_weights.values()),
            alternatives=df['model'].values
        )
        df['score'] = TOPSIS().evaluate(dm).e_.similarity
        filtered_df = df[
            (df['seats'] == seats) &
            (df['driveconfiguration'].str.lower() == drive_config.lower())
        ]
        if len(filtered_df) < 3:
            filtered_df = df
        return filtered_df.sort_values('score', ascending=False).head(10).to_dict('records')
    except Exception as e:
        logging.error(f"คำนวณ AHP-TOPSIS ไม่สำเร็จ: {str(e)}")
        return []

def save_user_data(profile, user_weights, hybrid_weights, recommendations, cluster_id, driveCon, seats):
    if not isinstance(recommendations, list) or len(recommendations) == 0:
        recommended_models = ''
        selected_model = ''
        satisfaction_score = 0
    else:
        recommended_models = ','.join([r.get('model', '') for r in recommendations[:3]])
        selected_model = recommendations[0].get('model', '')
        satisfaction_score = recommendations[0].get('score', 0)
    record = {
        'user_id': profile.get('user_id', 'anonymous'),
        'gender': profile.get('gender'),
        'age_range': profile.get('age_range'),
        'occupation': profile.get('occupation'),
        'marital_status': profile.get('marital_status'),
        'family_status': profile.get('family_status'),
        'income_range': profile.get('income_range'),
        'cluster_id': int(cluster_id),
        'driveCon': driveCon,
        'seats': seats,
        'timestamp': datetime.datetime.now().isoformat(),
        'vehicle_status': profile.get('vehicle_status'),
        'battery_weight': user_weights.get('battery', 0),
        'range_weight': user_weights.get('range', 0),
        'accelarate_weight': user_weights.get('accelarate', 0),
        'topspeed_weight': user_weights.get('topspeed', 0),
        'efficiency_weight': user_weights.get('efficiency', 0),
        'fastcharge_weight': user_weights.get('fastcharge', 0),
        'price_weight': user_weights.get('estimatedthbvalue', 0),
        'hybrid_battery_weight': hybrid_weights.get('battery', 0),
        'hybrid_range_weight': hybrid_weights.get('range', 0),
        'hybrid_accelarate_weight': hybrid_weights.get('accelarate', 0),
        'hybrid_topspeed_weight': hybrid_weights.get('topspeed', 0),
        'hybrid_efficiency_weight': hybrid_weights.get('efficiency', 0),
        'hybrid_fastcharge_weight': hybrid_weights.get('fastcharge', 0),
        'hybrid_price_weight': hybrid_weights.get('estimatedthbvalue', 0),
        'recommended_models': recommended_models,
        'selected_model': selected_model,
        'satisfaction_score': satisfaction_score
    }
    errors = bq_client.insert_rows_json(f"{PROJECT_ID}.{DATASET_ID}.{USERPROFILES_TABLE}", [record])
    if errors:
        logging.error(f"บันทึกข้อมูลไม่สำเร็จ: {errors}")

def build_user_clustering_model():
    try:
        query = f"""
        SELECT gender, age_range, occupation, marital_status, family_status, income_range, vehicle_status, driveCon, seats,
               battery_weight, range_weight, accelarate_weight, topspeed_weight, efficiency_weight, fastcharge_weight, price_weight
        FROM `{PROJECT_ID}.{DATASET_ID}.{USERPROFILES_TABLE}`
        """
        df = bq_client.query(query).to_dataframe()
        if len(df) < 5:
            logging.info("สร้างโมเดลเริ่มต้นด้วยข้อมูลจำลอง")
            dummy_data = pd.DataFrame({
                'gender': np.random.choice([1, 2, 3], 10),
                'age_range': np.random.choice([1, 2, 3, 4, 5, 6], 10),
                'occupation': np.random.choice([1, 2, 3, 4, 5], 10),
                'marital_status': np.random.choice([1, 2, 3, 4], 10),
                'family_status': np.random.choice([1, 2], 10),
                'income_range': np.random.choice([1, 2, 3, 4], 10),
                'vehicle_status': np.random.choice([0, 1], 10),
                'driveCon': np.random.choice([0, 1, 2], 10),
                'seats': np.random.randint(2, 8, 10),
                'battery_weight': np.random.rand(10) * 100,
                'range_weight': np.random.rand(10) * 100,
                'accelarate_weight': np.random.rand(10) * 100,
                'topspeed_weight': np.random.rand(10) * 100,
                'efficiency_weight': np.random.rand(10) * 100,
                'fastcharge_weight': np.random.rand(10) * 100,
                'price_weight': np.random.rand(10) * 100
            })
            df = dummy_data
        categorical_features = ['gender', 'age_range', 'occupation', 'marital_status', 'family_status', 'income_range', 'vehicle_status', 'driveCon', 'seats']
        preprocessor = ColumnTransformer([
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse=False), categorical_features)
        ], remainder='passthrough')
        pipeline = Pipeline([
            ('preprocessor', preprocessor),
            ('scaler', StandardScaler()),
            ('cluster', KMeans(n_init='auto'))
        ])
        best_k = 2
        if len(df) >= 10:
            silhouette_scores = []
            K_range = range(2, min(10, len(df) // 2) + 1)
            for k in K_range:
                pipeline.set_params(cluster__n_clusters=k)
                labels = pipeline.fit_predict(df)
                score = silhouette_score(pipeline[:-1].transform(df), labels)
                silhouette_scores.append(score)
            best_k = K_range[np.argmax(silhouette_scores)]
        pipeline.set_params(cluster__n_clusters=best_k)
        pipeline.fit(df)
        joblib.dump(pipeline.named_steps['preprocessor'], 'models/preprocessor.pkl')
        joblib.dump(pipeline.named_steps['scaler'], 'models/user_scaler.pkl')
        joblib.dump(pipeline.named_steps['cluster'], 'models/user_cluster_model.pkl')
        return pipeline
    except Exception as e:
        logging.error(f"สร้างโมเดลคลัสเตอร์ไม่สำเร็จ: {str(e)}")
        return None


@app.route("/handleSubmit", methods=['POST'])
def handle_submit():
    if not request.is_json:
        return jsonify({"error": "Expected JSON data"}), 415
    data = request.get_json()
    user_profile = data.get('userProfile', {})
    user_weights_raw = data.get('summedWeight', {})
    user_weights = {
        'battery': user_weights_raw.get('battery', 14),
        'range': user_weights_raw.get('range', 14),
        'accelarate': user_weights_raw.get('accelarate', 14),
        'topspeed': user_weights_raw.get('top_speed', user_weights_raw.get('topspeed', 14)),
        'efficiency': user_weights_raw.get('efficiency', 14),
        'fastcharge': user_weights_raw.get('fastcharge', 14),
        'estimatedthbvalue': user_weights_raw.get('estimated_thb_value', 16)
    }
    user_cluster = predict_user_cluster(user_profile)
    hybrid_weights = create_hybrid_weights(user_weights, user_cluster)
    results = calculate_ahp_topsis(
        hybrid_weights,
        data.get('driveCon', 'ระบบขับเคลื่อนสี่ล้อแบบอัตโนมัติ'),
        data.get('numSeats', 5)
    )
    if not isinstance(results, list):
        return jsonify({"error": "เกิดข้อผิดพลาดในการคำนวณ"}), 500
    save_user_data(user_profile, user_weights, hybrid_weights, results, user_cluster,
                   data.get('driveCon', 'ระบบขับเคลื่อนสี่ล้อแบบอัตโนมัติ'), data.get('numSeats', 5))
    return jsonify(results[:3] if len(results) >= 3 else results), 200

if __name__ == "__main__":
    os.makedirs('models', exist_ok=True)
    if not all(os.path.exists(f'models/{f}') for f in ['preprocessor.pkl', 'user_scaler.pkl', 'user_cluster_model.pkl']):
        try:
            logging.info("สร้างโมเดลเริ่มต้น...")
            build_user_clustering_model()
        except Exception as e:
            logging.error(f"สร้างโมเดลไม่สำเร็จ: {str(e)}")
    port = int(os.environ.get("PORT", 8080))
    logging.info(f"Starting server on port {port}")
    app.run(port=port, host="0.0.0.0")
