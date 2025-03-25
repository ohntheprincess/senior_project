# -*- coding: utf-8 -*-
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.cloud import bigquery
import pandas as pd
import os
import logging
from google.oauth2 import service_account
from ahpy import Compare
from skcriteria import mkdm
from skcriteria.agg.similarity import TOPSIS
from skcriteria import Objective
import datetime
import uuid
import numpy as np
from sklearn.preprocessing import OrdinalEncoder, StandardScaler
from sklearn.cluster import KMeans
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.metrics import silhouette_score
import json
# =======================================================
# ตั้งค่าเริ่มต้น
# =======================================================
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

def get_bq_client():
    """สร้าง BigQuery Client จาก variables"""
    try:
        credentials = service_account.Credentials.from_service_account_file("C:/senior_project/config/bit15-ev-decision-support-2cef27def9c2.json")        
        return bigquery.Client(credentials=credentials, project=os.environ.get("GCP_PROJECT"))
    except Exception as e:
        raise

bq_client = get_bq_client()

# ตั้งค่า BigQuery Client
PROJECT_ID = os.environ.get('PROJECT_ID', 'bit15-ev-decision-support')
DATASET_ID = os.environ.get('DATASET_ID', 'EV_Dataset')
MODEL_TABLE_ID = os.environ.get('MODEL_TABLE_ID', 'Model')
USERPROFILES_TABLE = os.environ.get('USERPROFILES_TABLE', 'UserProfiles')
USERPRODATA_TABLE = os.environ.get('USERPRODATA_TABLE', 'User_data')



# =======================================================
# ส่วนฟังก์ชันเตรียมข้อมูล (สำหรับตาราง Model)
# =======================================================
def load_and_preprocess_data():
    """โหลดและเตรียมข้อมูลจาก BigQuery (ตาราง Model)"""
    try:
        query = f"SELECT * FROM `{PROJECT_ID}.{DATASET_ID}.{MODEL_TABLE_ID}`"
        df = bq_client.query(query).to_dataframe()

        # ทำความสะอาดชื่อคอลัมน์: ลบช่องว่าง, - และ _ แล้วแปลงเป็น lowercase
        df.columns = df.columns.str.strip().str.replace(' ', '').str.replace('-', '').str.replace('_', '').str.lower()

        # รายการคอลัมน์ตัวเลข (ต้องตรงกับชื่อหลังการทำความสะอาด)
        numeric_cols = ['range', 'topspeed', 'accelarate', 'efficiency', 'battery', 'estimatedthbvalue', 'fastcharge']
        for col in numeric_cols:
            df[col] = pd.to_numeric(df[col].astype(str).str.replace(',', ''), errors='coerce')
        df.dropna(subset=numeric_cols)
        print("Model: ",df.head(5))
        # ลบแถวที่มีค่า NaN ในคอลัมน์ที่ระบุ
        return df
    except Exception as e:
        print(f"Error loading data: {str(e)}")
        raise
 
def transform_user_features(profile):
    """แปลงข้อมูลผู้ใช้ให้เหมาะสมสำหรับโมเดล clustering"""
    # เติมค่าที่ขาดหาย
    required_fields = {
        'gender': 'unknown',
        'age_range': 'unknown', 
        'occupation': 'unknown',
        'marital_status': 'unknown',
        'family_status': 'unknown',
        'income_range': 'unknown',
        'vehicle_status': 'unknown',
        'driveCon': 'unknown',
        'seats': 5
    }
    for key, default in required_fields.items():
        if key not in profile:
            profile[key] = default
    
    df = pd.DataFrame([profile])
    
    categorical_cols = [
        'gender', 'age_range', 'occupation', 
        'marital_status', 'family_status', 
        'income_range', 'vehicle_status', 'driveCon'
    ]
    
    # แปลง seats เป็น int
    df['seats'] = int(df['seats'].iloc[0]) if 'seats' in df else 5
    
    return df[categorical_cols + ['seats']]

# =======================================================
# ส่วน Hybrid Weights
# =======================================================
def create_hybrid_weights(user_weights, cluster_id):
    """สร้างค่าน้ำหนักแบบผสมระหว่างค่าน้ำหนักผู้ใช้และค่าน้ำหนักเฉลี่ยของกลุ่ม"""
    # กำหนดค่าเริ่มต้น
    weights = {
        'battery': 14.28, 
        'range': 14.28,
        'accelarate': 14.28, 
        'topspeed': 14.28,
        'efficiency': 14.28, 
        'fastcharge': 14.28,
        'estimatedthbvalue': 14.32
    }
    
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

        if not result.empty and not result.iloc[0].isnull().all():
            # อัพเดทค่าจาก Query เฉพาะคอลัมน์ที่มีข้อมูล
            new_weights = result.iloc[0].fillna(0).to_dict()
            for k, v in new_weights.items():
                if v != 0:
                    weights[k] = v

    except Exception as e:
        print(f"Error getting cluster weights: {str(e)}")
    
    # คำนวณ hybrid weights
    cluster_weights = user_weights
    hybrid = {
        k: (user_weights.get(k, 0) * 0.8 + cluster_weights.get(k, 0) * 0.2)
        for k in set(user_weights) | set(cluster_weights)
    }
    total = sum(hybrid.values())
    hybrid = {k: (v / total) * 100 for k, v in hybrid.items()}
    return hybrid

# =======================================================
# ส่วน AHP-TOPSIS
# =======================================================
def calculate_ahp_topsis(weights, drive_config, seats):
    """คำนวณ AHP-TOPSIS เพื่อจัดอันดับโมเดล EV"""
    try:
        df = load_and_preprocess_data()
        # ใช้ชื่อคอลัมน์ที่ผ่านการทำความสะอาดแล้ว
        numeric_cols = ['range', 'topspeed', 'accelarate', 'efficiency', 'battery', 'estimatedthbvalue', 'fastcharge']

        # ตรวจสอบค่าน้ำหนัก
        valid_weights = {k: v for k, v in weights.items() if k in numeric_cols}
        if len(valid_weights) != len(numeric_cols):
            raise ValueError("ค่าน้ำหนักและคอลัมน์ไม่ตรงกัน")

        # คำนวณ AHP: สร้าง dictionary เปรียบเทียบคู่
        comparisons = {(k1, k2): valid_weights[k1] / valid_weights[k2]
                       for i, k1 in enumerate(valid_weights) for k2 in list(valid_weights)[i+1:]}
        ahp_model = Compare('Criteria Comparison', comparisons)
        if ahp_model.consistency_ratio >= 0.1:
            return []  # หาก inconsistency สูง ให้คืนค่าเป็น list ว่าง
        ahp_weights = ahp_model.target_weights

        # TOPSIS: ใช้ชื่อคอลัมน์ให้ตรงกับ df
        objectives = [Objective.MAX if c not in ['accelarate', 'estimatedthbvalue', 'efficiency'] else Objective.MIN
                      for c in numeric_cols]

        dm = mkdm(
            matrix=df[numeric_cols].values,
            objectives=objectives,
            weights=list(ahp_weights.values()),
            alternatives=df['model'].values
        )
        # คำนวณ similarity score ด้วย TOPSIS
        df['score'] = TOPSIS().evaluate(dm).e_.similarity

        # normalized_df = df[numeric_cols].apply(lambda x: x / np.sqrt((x**2).sum()), axis=0)

        # # การคำนวณเหล่านี้ตรงข้ามกับคอลัมน์อื่นๆ
        # for col in ['accelarate', 'estimatedthbvalue', 'efficiency']:
        #     if col in normalized_df.columns:
        #         normalized_df[col] = 1 / normalized_df[col].replace(0, np.nan)  # ป้องกันการหารด้วย 0

        # # กำหนดน้ำหนักโดยใช้ AHP
        # final_weights = ahp_weights

        # # คำนวณ Weighted Normalized Matrix
        # weighted_normalized_df = normalized_df * final_weights

        # # หา Ideal Best และ Ideal Worst
        # ideal_best = weighted_normalized_df.max()
        # ideal_worst = weighted_normalized_df.min()

        # # คำนวณระยะทางจาก Ideal Best และ Ideal Worst
        # distance_best = np.sqrt(((weighted_normalized_df - ideal_best) ** 2).sum(axis=1))
        # distance_worst = np.sqrt(((weighted_normalized_df - ideal_worst) ** 2).sum(axis=1))

        # # คำนวณคะแนน TOPSIS
        # topsis_score = distance_worst / (distance_best + distance_worst)
        # df['score'] = topsis_score

        # กรองข้อมูล: ใช้ชื่อคอลัมน์ที่ผ่านการทำความสะอาด (drive_configuration -> driveconfiguration)
        filtered_df = df[
            (df['seats'] == seats) &
            (df['driveconfiguration'].str.lower() == drive_config.lower())
        ]
        if len(filtered_df) < 3:
            filtered_df = df[
              (df['seats'] == seats) |
              (df['driveconfiguration'].str.lower() == drive_config.lower())
          ]
        print("AHP-TOPSIS Result: ",filtered_df.sort_values('score', ascending=False).head(5).to_dict('records'))
        # คืนค่า top 10 แถวตามคะแนน (score)
        return filtered_df.sort_values('score', ascending=False).head(10).to_dict('records')
    except Exception as e:
        print(f"คำนวณ AHP-TOPSIS ไม่สำเร็จ: {str(e)}")
        return []

 # =======================================================
# ส่วนบันทึกข้อมูลผู้ใช้
# =======================================================
def save_user_data(profile, user_weights ,recommendations, driveCon, seats):
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
        'driveCon': driveCon,
        'seats': seats,
        'timestamp': datetime.datetime.now().isoformat(),
        'vehicle_status': profile.get('vehicle_status'),
        # บันทึกค่าน้ำหนักที่ผู้ใช้กำหนด
        'battery_weight': user_weights.get('battery', 0),
        'range_weight': user_weights.get('range', 0),
        'accelarate_weight': user_weights.get('accelarate', 0),
        'topspeed_weight': user_weights.get('topspeed', 0),
        'efficiency_weight': user_weights.get('efficiency', 0),
        'fastcharge_weight': user_weights.get('fastcharge', 0),
        'price_weight': user_weights.get('estimatedthbvalue', 0),
        'recommended_models': recommended_models,
        'selected_model': selected_model,
        'satisfaction_score': satisfaction_score
    }

    errors = bq_client.insert_rows_json(f"{PROJECT_ID}.{DATASET_ID}.{USERPRODATA_TABLE}", [record],row_ids=[uuid.uuid4().hex],skip_invalid_rows=True)
    if errors:
        print(f"บันทึกข้อมูลไม่สำเร็จ: {errors}")

def save_user_result(profile, user_weights, hybrid_weights, recommendations, cluster_id, driveCon, seats):
    """บันทึกข้อมูลผู้ใช้ลงในตาราง UserProfiles"""
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
        # บันทึกค่าน้ำหนักที่ผู้ใช้กำหนด
        'battery_weight': user_weights.get('battery', 0),
        'range_weight': user_weights.get('range', 0),
        'accelarate_weight': user_weights.get('accelarate', 0),
        'topspeed_weight': user_weights.get('topspeed', 0),
        'efficiency_weight': user_weights.get('efficiency', 0),
        'fastcharge_weight': user_weights.get('fastcharge', 0),
        'price_weight': user_weights.get('estimatedthbvalue', 0),
        # บันทึกค่าน้ำหนักแบบผสม
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

    errors = bq_client.insert_rows_json(f"{PROJECT_ID}.{DATASET_ID}.{USERPROFILES_TABLE}", [record],row_ids=[uuid.uuid4().hex],skip_invalid_rows=True)
    if errors:
        print(f"บันทึกข้อมูลไม่สำเร็จ: {errors}")

# =======================================================
# ส่วน Train Clustering Model
# =======================================================
def build_user_clustering_model():
    """สร้างโมเดล clustering ใหม่โดยใช้ข้อมูลจากตาราง User"""
    try:
        query = f"""
        SELECT gender, age_range, occupation, marital_status, family_status, income_range, vehicle_status, driveCon, seats
        FROM `{PROJECT_ID}.{DATASET_ID}.{USERPROFILES_TABLE}`
        """
        df = bq_client.query(query).to_dataframe()

        # # หากข้อมูลน้อยเกินไป ให้ใช้ข้อมูลจำลอง
        # if len(df) < 5:
        #     print("สร้างโมเดลเริ่มต้นด้วยข้อมูลจำลอง")
        #     dummy_data = pd.DataFrame({
        #         'gender': np.random.choice([1, 2, 3], 10),
        #         'age_range': np.random.choice([1, 2, 3, 4, 5, 6], 10),
        #         'occupation': np.random.choice([1, 2, 3, 4, 5], 10),
        #         'marital_status': np.random.choice([1, 2, 3, 4], 10),
        #         'family_status': np.random.choice([1, 2], 10),
        #         'income_range': np.random.choice([1, 2, 3, 4], 10),
        #         'vehicle_status': np.random.choice([0, 1], 10),
        #         'driveCon': np.random.choice([0, 1, 2], 10),
        #         'seats': np.random.randint(2, 8, 10),
        #         'battery_weight': np.random.rand(10) * 100,
        #         'range_weight': np.random.rand(10) * 100,
        #         'accelarate_weight': np.random.rand(10) * 100,
        #         'topspeed_weight': np.random.rand(10) * 100,
        #         'efficiency_weight': np.random.rand(10) * 100,
        #         'fastcharge_weight': np.random.rand(10) * 100,
        #         'price_weight': np.random.rand(10) * 100
        #     })
        #     df = dummy_data

        categorical_features = ['gender', 'age_range', 'occupation', 'marital_status', 'family_status', 'income_range', 'vehicle_status', 'driveCon', 'seats']
        
        preprocessor = ColumnTransformer([
            ('cat', OrdinalEncoder(
                handle_unknown='use_encoded_value', 
                unknown_value=-1
            ), categorical_features)
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
        return pipeline
    except Exception as e:
        print(f"สร้างโมเดลคลัสเตอร์ไม่สำเร็จ: {str(e)}")
        return None

# =======================================================
# ส่วน API Endpoints
# =======================================================
@app.route("/handleSubmit", methods=["POST"])
def handle_submit():          
        data = request.get_json()
        
        data = request.get_json()
        user_profile = data.get('userProfile', {})
        user_profile['driveCon'] = data.get('driveCon', 'ระบบขับเคลื่อนสี่ล้อแบบอัตโนมัติ')
        user_profile['seats'] = data.get('numSeats', 5)
        print("user_profile: ",user_profile)
        
        # เตรียมข้อมูลผู้ใช้
        user_df = transform_user_features(user_profile)
        print("user_df: ",user_df)
        # สร้างโมเดล clustering
        clustering_model = build_user_clustering_model()
        
        # ดึง Component จาก Pipeline
        preprocessor = clustering_model.named_steps['preprocessor']  # ได้ Object ColumnTransformer
        scaler = clustering_model.named_steps['scaler']  # ได้ Object StandardScaler
        cluster_model = clustering_model.named_steps['cluster']  # ได้ Object KMeans
        
        # แปลงข้อมูล
        user_processed = preprocessor.transform(user_df)  # ใช้ ColumnTransformer.transform()
        print("user_processed: ",user_processed)
        user_scaled = scaler.transform(user_processed)  # ใช้ StandardScaler.transform()
        print("user_scaled: ",user_scaled)
        # ทำนาย Cluster
        user_cluster = int(cluster_model.predict(user_scaled)[0])
        print("user_cluster: ",user_cluster)

        # แปลงคีย์น้ำหนักให้ตรงกับชื่อคอลัมน์ (mapping 'top_speed' จากฟรอนต์เอนด์เป็น 'topspeed')
        user_weights_raw = data.get('summedWeight', {})
        user_weights = {
            'battery': user_weights_raw.get('battery'),
            'range': user_weights_raw.get('range'),
            'accelarate': user_weights_raw.get('accelarate'),
            'topspeed': user_weights_raw.get('top_speed', user_weights_raw.get('topspeed')),
            'efficiency': user_weights_raw.get('efficiency'),
            'fastcharge': user_weights_raw.get('fastcharge'),
            'estimatedthbvalue': user_weights_raw.get('estimated_thb_value')
        }
        hybrid_weights = create_hybrid_weights(user_weights, user_cluster)
        print("user_weights: ",user_weights)
        print("hybrid_weights: ",hybrid_weights)


        # คำนวณผลลัพธ์ AHP-TOPSIS โดยใช้ driveCon และ numSeats
        results = calculate_ahp_topsis(
            hybrid_weights,
            data.get('driveCon', 'ระบบขับเคลื่อนสี่ล้อแบบอัตโนมัติ'),
            data.get('numSeats', 5)
        )
        save_user_data(user_profile, user_weights,  results, data.get('driveCon', 'ระบบขับเคลื่อนสี่ล้อแบบอัตโนมัติ'), data.get('numSeats', 5))
        save_user_result(user_profile, user_weights, hybrid_weights, results, user_cluster,data.get('driveCon', 'ระบบขับเคลื่อนสี่ล้อแบบอัตโนมัติ'), data.get('numSeats', 5))

        if not isinstance(results, list) or len(results) == 0:
            return jsonify({"error": "ไม่พบรถที่เหมาะกับเงื่อนไข"}), 404

        # ส่งคืนเฉพาะ 3 อันดับแรก หากมีมากกว่า 3
        return jsonify(results[:3] if len(results) >= 3 else results), 200
        
# =======================================================
# ส่วนเริ่มต้นเซิร์ฟเวอร์
# =======================================================
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=8080, debug=False)