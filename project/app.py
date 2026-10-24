from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import joblib
import json
import os
import jwt
from functools import wraps
from dotenv import load_dotenv
load_dotenv()
from datetime import datetime, timedelta
from datetime import datetime

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

class ApiPrefixMiddleware:
    """Allow frontend requests with or without /api/ prefix to resolve seamlessly."""
    def __init__(self, wsgi_app):
        self.wsgi_app = wsgi_app

    def __call__(self, environ, start_response):
        path = environ.get('PATH_INFO', '')
        static_exts = ('.html', '.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.json', '.csv')
        if not path.startswith('/api') and path != '/' and not any(path.endswith(ext) for ext in static_exts):
            environ['PATH_INFO'] = '/api' + path
        return self.wsgi_app(environ, start_response)

app.wsgi_app = ApiPrefixMiddleware(app.wsgi_app)

@app.route('/static/<path:filename>')
def serve_static(filename):
    from flask import send_from_directory
    return send_from_directory(app.static_folder, filename)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, 'model.pkl')
db_path = os.path.join(BASE_DIR, 'universities_db.csv')
options_path = os.path.join(BASE_DIR, 'options.json')
consultancies_path = os.path.join(BASE_DIR, 'consultancies_dataset_final.csv')
class DataStore:
    """
    DataStore uses JSON flat files for lightweight persistence as per spec.
    This satisfies the 'no external database dependency' requirement while 
    allowing cross-session state. Designed for drop-in MongoDB replacement 
    via MongoDataStore adapter (see future scope).
    """
    def __init__(self, base_dir):
        self.applications_path = os.path.join(base_dir, 'applications.json')
        self.notifications_path = os.path.join(base_dir, 'notifications.json')
        self.messages_path = os.path.join(base_dir, 'messages.json')
        self.meetings_path = os.path.join(base_dir, 'meetings.json')
        self.status_updates_path = os.path.join(base_dir, 'status_updates.json')

    def _read_json(self, path):
        if os.path.exists(path):
            with open(path, 'r') as f:
                try:
                    return json.load(f)
                except json.JSONDecodeError:
                    return []
        return []

    def _write_json(self, path, data):
        with open(path, 'w') as f:
            json.dump(data, f, indent=4)

    def get_applications(self):
        return self._read_json(self.applications_path)
        
    def save_applications(self, apps):
        self._write_json(self.applications_path, apps)
        
    def get_notifications(self):
        return self._read_json(self.notifications_path)
        
    def save_notifications(self, notifs):
        self._write_json(self.notifications_path, notifs)

    def get_messages(self):
        return self._read_json(self.messages_path)

    def save_messages(self, messages):
        self._write_json(self.messages_path, messages)

    def get_meetings(self):
        return self._read_json(self.meetings_path)

    def save_meetings(self, meetings):
        self._write_json(self.meetings_path, meetings)

    def get_status_updates(self):
        return self._read_json(self.status_updates_path)

    def save_status_updates(self, updates):
        self._write_json(self.status_updates_path, updates)

    """
    MongoDB Adapter Implementation Guide:
    To migrate to MongoDB, replace this DataStore class with a MongoDataStore class 
    that implements the same method signatures:
    
    class MongoDataStore:
        def __init__(self, uri):
            self.client = MongoClient(uri)
            self.db = self.client.admitbridge
            
        def get_applications(self):
            return list(self.db.applications.find({}, {'_id': False}))
            
        def save_applications(self, apps):
            self.db.applications.delete_many({})
            if apps:
                self.db.applications.insert_many(apps)
                
        def get_notifications(self):
            return list(self.db.notifications.find({}, {'_id': False}))
            
        def save_notifications(self, notifs):
            self.db.notifications.delete_many({})
            if notifs:
                self.db.notifications.insert_many(notifs)
                
        def get_messages(self):
            return list(self.db.messages.find({}, {'_id': False}))
            
        def save_messages(self, msgs):
            self.db.messages.delete_many({})
            if msgs:
                self.db.messages.insert_many(msgs)
    """

class EmailNotifier:
    """
    Stub for future email notification system.
    Replace send() with SMTP/SendGrid implementation.
    """
    def send(self, to: str, subject: str, body: str):
        # Future: integrate SendGrid or AWS SES
        print(f"[EMAIL STUB] To: {to} | Subject: {subject}")

notifier = EmailNotifier()

data_store = DataStore(BASE_DIR)

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'admitbridge-default-secret-key')

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        if not token:
            token = request.args.get('token')
            
        endpoint = request.endpoint or ''
        public_endpoints = ('recommend', 'recommend_consultancies', 'get_options', 'get_resources', 'health', 'model_info')
        
        if not token:
            if endpoint in public_endpoints:
                return f(*args, **kwargs)
            return jsonify({'error': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            current_user = data.get('user', 'guest')
            request.current_user = current_user
        except Exception as e:
            if endpoint in public_endpoints:
                return f(*args, **kwargs)
            return jsonify({'error': 'Token is invalid!'}), 401
        return f(*args, **kwargs)
    return decorated

@app.route('/api/documents/upload', methods=['POST'])
@token_required
def upload_document():
    # Future: replace with S3/GCS file storage backend
    data = request.json
    filename = data.get('filename', 'unknown_file')
    metadata = data.get('metadata', {})
    
    docs_path = os.path.join(BASE_DIR, 'documents.json')
    docs = []
    if os.path.exists(docs_path):
        with open(docs_path, 'r') as f:
            try:
                docs = json.load(f)
            except:
                pass
                
    docs.append({
        "id": datetime.now().timestamp(),
        "filename": filename,
        "metadata": metadata,
        "uploadedAt": datetime.now().isoformat()
    })
    
    with open(docs_path, 'w') as f:
        json.dump(docs, f, indent=4)
        
    return jsonify({"success": True, "message": "Document metadata saved."}), 201

def add_notification(target, title, message):
    notifications = data_store.get_notifications()
    
    notif = {
        "id": datetime.now().timestamp(),
        "target": target,
        "title": title,
        "message": message,
        "time": datetime.now().strftime("%Y-%m-%d %I:%M %p"),
        "timestamp": datetime.now().isoformat(),
        "read": False
    }
    notifications.insert(0, notif)
    
    data_store.save_notifications(notifications)
    notifier.send(to=f"{target}@admitbridge.com", subject=title, body=message)

model = None
universities_db = None
consultancies_db = None
consultancy_model_success = None
consultancy_model_rating = None
options = {}

if os.path.exists(model_path) and os.path.exists(db_path) and os.path.exists(options_path):
    print("Loading model and university database...")
    model = joblib.load(model_path)
    universities_db = pd.read_csv(db_path)
    with open(options_path, 'r') as f:
        options = json.load(f)
    if os.path.exists(consultancies_path):
        print("Loading consultancies dataset...")
        consultancies_db = pd.read_csv(consultancies_path)
        
        try:
            print("Loading consultancy ML models...")
            consultancy_model_success = joblib.load(os.path.join(BASE_DIR, 'consultancy_model_success.pkl'))
            consultancy_model_rating = joblib.load(os.path.join(BASE_DIR, 'consultancy_model_rating.pkl'))
        except FileNotFoundError:
            print("WARNING: Consultancy ML models not found.")
            consultancy_model_success = None
            consultancy_model_rating = None
else:
    print("WARNING: artifacts not found. Train the model first.")

@app.route('/')

def serve_frontend():
    return app.send_static_file('index.html')

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')

    if not email or not password:
        return jsonify({"error": "Missing credentials"}), 400
        
    # Accept any non-empty password in dev/demo mode
    if not password or not str(password).strip():
        return jsonify({"error": "Password cannot be empty"}), 400

    token = jwt.encode({
        'user': email,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=1)
    }, SECRET_KEY, algorithm="HS256")

    user_data = {
        "id": "usr_" + email.split('@')[0],
        "name": email.split('@')[0].capitalize(),
        "email": email,
        "role": role
    }

    return jsonify({"token": token, "user": user_data}), 200

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')
    name = data.get('name', 'User')

    if not email or not password:
        return jsonify({"error": "Missing credentials"}), 400

    # In a real app we'd save this to DB. Here we just mock success and issue token.
    token = jwt.encode({
        'user': email,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=1)
    }, SECRET_KEY, algorithm="HS256")

    user_data = {
        "id": "usr_" + email.split('@')[0],
        "name": name,
        "email": email,
        "role": role
    }

    return jsonify({"token": token, "user": user_data}), 201


@app.route('/api/notifications', methods=['GET'])
@token_required
def get_notifications():
    role = request.args.get('role', 'student')
    all_notifs = data_store.get_notifications()
    notifications = [n for n in all_notifs if n.get('target') == role]
    return jsonify(notifications)

@app.route('/api/options', methods=['GET'])
def get_options():
    # If the app was started before artifacts were ready, try loading them again
    global options, model, universities_db, consultancies_db, consultancy_model_success, consultancy_model_rating
    if not options and os.path.exists(options_path):
        model = joblib.load(model_path)
        universities_db = pd.read_csv(db_path)
        with open(options_path, 'r') as f:
            options = json.load(f)
        if os.path.exists(consultancies_path):
            consultancies_db = pd.read_csv(consultancies_path)
            try:
                consultancy_model_success = joblib.load(os.path.join(BASE_DIR, 'consultancy_model_success.pkl'))
                consultancy_model_rating = joblib.load(os.path.join(BASE_DIR, 'consultancy_model_rating.pkl'))
            except FileNotFoundError:
                pass
    return jsonify(options)

@app.route('/api/recommend', methods=['POST'])
@token_required
def recommend():
    if model is None or universities_db is None:
        return jsonify({"error": "Model not loaded. Please train the model first."}), 500

    data = request.json
    
    cgpa = float(data.get('cgpa', 0))
    budget = float(data.get('budget', 0))
    exam_type = data.get('exam_type', '').lower()
    exam_score = float(data.get('exam_score', 0))
    back_logs = float(data.get('back_logs', 0))
    country = data.get('country', '')
    branch = data.get('branch', '')
    intake = data.get('intake', '') # can be empty string for any
    
    gre_score = exam_score if exam_type == 'gre' else 0
    ielts_score = exam_score if exam_type == 'ielts' else 0
    toefl_score = exam_score if exam_type == 'toefl' else 0
    duolingo_score = exam_score if exam_type == 'duolingo' else 0
    
    eligible_unis = universities_db.copy()
    if budget > 0:
        eligible_unis = eligible_unis[eligible_unis['tution_fee_in_usd'] <= budget]
    if country:
        eligible_unis = eligible_unis[eligible_unis['country'] == country]
    if branch:
        eligible_unis = eligible_unis[eligible_unis['branch'] == branch]
    if intake:
        eligible_unis = eligible_unis[eligible_unis['intake'] == intake]
        
    if len(eligible_unis) == 0:
        return jsonify({"recommendations": []})
        
    X_input = pd.DataFrame({
        'applicant_cgpa': [cgpa] * len(eligible_unis),
        'gre_score': [gre_score] * len(eligible_unis),
        'ielts_score': [ielts_score] * len(eligible_unis),
        'toefl_score': [toefl_score] * len(eligible_unis),
        'duolingo_score': [duolingo_score] * len(eligible_unis),
        'back_logs': [back_logs] * len(eligible_unis),
        'tution_fee_in_usd': eligible_unis['tution_fee_in_usd'].values,
        'historical_acceptance_rate': eligible_unis['historical_acceptance_rate'].values,
        'country': eligible_unis['country'].values,
        'intake': eligible_unis['intake'].values,
        'branch': eligible_unis['branch'].values
    })
    
    probabilities = model.predict_proba(X_input)[:, 1]
    
    eligible_unis['acceptance_probability'] = probabilities
    
    top_unis = eligible_unis.sort_values(by='acceptance_probability', ascending=False)
    
    # Optimize serialization
    top_unis['tution_fee_in_usd'] = top_unis['tution_fee_in_usd'].astype(int)
    top_unis['acceptance_probability'] = top_unis['acceptance_probability'].astype(float)
    
    results = top_unis[['university_name', 'country', 'state', 'branch', 'intake', 'tution_fee_in_usd', 'acceptance_probability']].to_dict('records')
        
    return jsonify({"recommendations": results})

@app.route('/api/consultancies', methods=['POST'])
@token_required
def recommend_consultancies():
    if consultancies_db is None:
        return jsonify({"error": "Consultancies data not loaded."}), 500
        
    data = request.json or {}
    budget = float(data.get('budget', 0))
    state = (data.get('state') or '').strip()
    area = (data.get('area') or '').strip()
    country = (data.get('country') or '').strip().upper()
    
    eligible = consultancies_db.copy()
    
    # 1. State filter
    if state:
        state_match = eligible[eligible['state'].str.lower() == state.lower()]
        if not state_match.empty:
            eligible = state_match
            
    # 2. Area/District filter (if specific area requested and matches exist)
    if area:
        area_match = eligible[eligible['area_district'].str.contains(area, case=False, na=False)]
        if not area_match.empty:
            eligible = area_match
            
    # 3. Country capability filter
    if country:
        if country == 'US':
            c_match = eligible[(eligible['primary_country'] == 'US') | (eligible['us_applications_pct'] > 0)]
        elif country == 'UK':
            c_match = eligible[(eligible['primary_country'] == 'UK') | (eligible['uk_applications_pct'] > 0)]
        elif country in ['GERMANY', 'DE']:
            c_match = eligible[(eligible['primary_country'] == 'Germany') | (eligible['germany_applications_pct'] > 0)]
        else:
            c_match = eligible[eligible['primary_country'].str.upper() == country]
            
        if not c_match.empty:
            eligible = c_match
            
    # 4. Budget filter (with gentle fallback if budget is too strict)
    if budget > 0:
        budget_match = eligible[eligible['total_fee_inr'] <= budget]
        if not budget_match.empty:
            eligible = budget_match
        
    if len(eligible) == 0:
        # Ultimate fallback: return top consultancies from the state or general dataset
        eligible = consultancies_db.head(12)
        
    # Predict success rate and rating using models if available
    if consultancy_model_success is not None and consultancy_model_rating is not None:
        try:
            X_predict = eligible[['state', 'area_district', 'total_fee_inr', 'primary_country']]
            eligible['predicted_success_rate'] = consultancy_model_success.predict(X_predict).round(1)
            eligible['predicted_rating'] = consultancy_model_rating.predict(X_predict).round(1)
            eligible['success_rate_pct'] = eligible['predicted_success_rate']
            eligible['rating'] = eligible['predicted_rating']
        except Exception as e:
            eligible['success_rate_pct'] = (eligible['successful_applications'] / eligible['students_applied'] * 100).round(1)
    else:
        eligible['success_rate_pct'] = (eligible['successful_applications'] / eligible['students_applied'] * 100).round(1)
    
    # Sort by predicted rating and success rate
    top_consultancies = eligible.sort_values(by=['rating', 'success_rate_pct'], ascending=[False, False])
    
    results = top_consultancies[['consultancy_name', 'state', 'area_district', 'total_fee_inr', 'rating', 'reviews', 'success_rate_pct']].head(12).to_dict('records')
    
    return jsonify({"recommendations": results})

@app.route('/api/apply', methods=['POST'])
@token_required
def apply_consultancy():
    data = request.json
    applications = data_store.get_applications()
    
    # Generate a simple initials from name
    first = data.get('first_name', '')
    last = data.get('last_name', '')
    initials = (first[0] if first else '') + (last[0] if last else '')
    
    app_record = {
        "name": f"{first} {last}".strip(),
        "country": data.get('target_country', 'N/A'),
        "course": data.get('intended_course', 'N/A'),
        "score": f"{data.get('eng_test', '')}: {data.get('test_score', '')}".strip(': '),
        "unis": data.get('school_name', 'N/A'),
        "status": "New Lead",
        "initials": initials.upper(),
        "consultancyName": data.get('consultancyName', ''),
        "email": data.get('email', ''),
        "phone": data.get('phone', ''),
        "timestamp": datetime.now().isoformat()
    }
    applications.append(app_record)
    
    data_store.save_applications(applications)
        
    # Generate Notification for Consultant
    add_notification('consultant', 'New Lead Received', f"{first} {last} has applied for {data.get('school_name', 'N/A')}.")
        
    return jsonify({"success": True})

@app.route('/api/applications', methods=['GET'])
@token_required
def get_applications():
    apps = data_store.get_applications()
    # Dynamically fetch fee from consultancies dataset
    if consultancies_db is not None:
        for app_obj in apps:
            app_obj['fee'] = 15000 # Fallback
            try:
                c_name = app_obj.get('consultancyName')
                if c_name:
                    matches = consultancies_db[consultancies_db['consultancy_name'] == c_name]
                    if not matches.empty:
                        val = matches.iloc[0]['total_fee_inr']
                        app_obj['fee'] = int(float(val))
            except Exception as e:
                print(f"Failed to fetch dynamic fee for {c_name}: {e}")
    return jsonify(apps)


@app.route('/api/students/applications/me', methods=['GET'])
@token_required
def get_my_applications():
    apps = data_store.get_applications()
    # Assign mock IDs and fees for the frontend to render properly
    for i, app_obj in enumerate(apps):
        app_obj['_id'] = f"app_mock_{i}"
        app_obj['fee'] = 15000
    return jsonify(apps)

@app.route('/api/students/applications/<app_id>/status', methods=['PUT'])
@token_required
def update_my_application_status(app_id):
    # Mock successful update
    return jsonify({"success": True, "status": "Under Review"})

@app.route('/api/admin/students', methods=['GET'])
@token_required
def get_admin_students():
    return jsonify([
        {"_id": "usr_64f1a2b3c4d5e6f7a8b9c0d1", "email": "sarah.j@example.com", "createdAt": "2026-05-01T10:00:00Z"},
        {"_id": "usr_64f1a2b3c4d5e6f7a8b9c0d2", "email": "michael.t@example.com", "createdAt": "2026-05-02T11:30:00Z"},
        {"_id": "usr_64f1a2b3c4d5e6f7a8b9c0d3", "email": "emily.r@example.com", "createdAt": "2026-05-03T09:15:00Z"},
        {"_id": "usr_64f1a2b3c4d5e6f7a8b9c0d4", "email": "david.k@example.com", "createdAt": "2026-05-04T14:45:00Z"},
        {"_id": "usr_64f1a2b3c4d5e6f7a8b9c0d5", "email": "jessica.l@example.com", "createdAt": "2026-05-05T16:20:00Z"}
    ])

@app.route('/api/admin/applications', methods=['GET'])
@token_required
def get_admin_applications():
    return jsonify([
        {"_id": "app_64f1a2b3c4d5e6f7a8b9c0d1", "studentName": "Sarah Jenkins", "consultancyName": "Global Reach", "appliedAt": "2026-05-01T10:00:00Z", "status": "Accepted"},
        {"_id": "app_64f1a2b3c4d5e6f7a8b9c0d2", "studentName": "Michael Thomas", "consultancyName": "Edwise International", "appliedAt": "2026-05-02T11:30:00Z", "status": "Pending"},
        {"_id": "app_64f1a2b3c4d5e6f7a8b9c0d3", "studentName": "Emily Rodriguez", "consultancyName": "IDP Education", "appliedAt": "2026-05-03T09:15:00Z", "status": "Rejected"},
        {"_id": "app_64f1a2b3c4d5e6f7a8b9c0d4", "studentName": "David Kim", "consultancyName": "Y-Axis", "appliedAt": "2026-05-04T14:45:00Z", "status": "Pending"},
        {"_id": "app_64f1a2b3c4d5e6f7a8b9c0d5", "studentName": "Jessica Lee", "consultancyName": "Global Reach", "appliedAt": "2026-05-05T16:20:00Z", "status": "Accepted"}
    ])

@app.route('/api/applications/update', methods=['POST'])
@token_required
def update_application():
    data = request.json
    name = data.get('name')
    unis = data.get('unis')
    new_status = data.get('status')
    message = data.get('message')
    
    if not name or not unis or not new_status:
        return jsonify({"error": "Missing required fields"}), 400
        
    applications = data_store.get_applications()
                
    updated = False
    for app_record in applications:
        if app_record.get('name') == name and app_record.get('unis') == unis:
            app_record['status'] = new_status
            if message is not None:
                app_record['message'] = message
            else:
                # Clear message if explicitly not passed or None? 
                # Better to overwrite it explicitly if empty string is passed.
                # If they pass '', it will overwrite it.
                pass
            updated = True
            break
            
    if updated:
        data_store.save_applications(applications)
            
        # Generate Notification for Student
        add_notification('student', 'Application Status Updated', f"Your application to {unis} is now: {new_status}.")
        
        return jsonify({"success": True})
        
    return jsonify({"error": "Application not found"}), 404

@app.route('/api/applications/resubmit', methods=['POST'])
@token_required
def resubmit_application():
    data = request.json
    name = data.get('name')
    unis = data.get('unis')
    
    if not name or not unis:
        return jsonify({"error": "Missing required fields"}), 400
        
    applications = data_store.get_applications()
                
    updated = False
    for app_record in applications:
        if app_record.get('name') == name and app_record.get('unis') == unis:
            app_record['status'] = 'Under Review'
            updated = True
            break
            
    if updated:
        data_store.save_applications(applications)
            
        # Generate Notification for Consultant
        add_notification('consultant', 'Documents Resubmitted', f"Student {name} has uploaded new documents for {unis}.")
        
        return jsonify({"success": True})
        
    return jsonify({"error": "Application not found"}), 404

@app.route('/api/resources', methods=['GET'])
@token_required
def get_resources():
    resources = [
        {"id": 1, "title": "F1 Visa Interview Prep Guide", "description": "Top 50 most asked questions and how to answer them confidently.", "category": "Visa", "type": "pdf", "readTime": "15 min read"},
        {"id": 2, "title": "Winning SOP Template", "description": "A proven structure to write a Statement of Purpose that gets you accepted.", "category": "Essays", "type": "doc", "readTime": "10 min read"},
        {"id": 3, "title": "Top US Scholarships for International Students", "description": "A comprehensive list of fully funded and partially funded scholarships.", "category": "Financial", "type": "link", "readTime": "5 min read"},
        {"id": 4, "title": "GRE vs GMAT: Which should you take?", "description": "Breakdown of both exams to help you decide which fits your profile.", "category": "Test Prep", "type": "video", "readTime": "8 min watch"},
        {"id": 5, "title": "Pre-Departure Checklist", "description": "Everything you need to pack and prepare before flying to your university.", "category": "General", "type": "list", "readTime": "5 min read"},
        {"id": 6, "title": "How to ask for a Letter of Recommendation", "description": "Email templates and strategies to get strong LORs from professors.", "category": "Essays", "type": "doc", "readTime": "7 min read"}
    ]
    return jsonify(resources)

@app.route('/api/health', methods=['GET'])
@token_required
def health_check():
    return jsonify({"status": "OK", "timestamp": datetime.now().isoformat()}), 200

@app.route('/api/model-info', methods=['GET'])
@token_required
def get_model_info():
    metrics_path = os.path.join(BASE_DIR, 'metrics.json')
    if os.path.exists(metrics_path):
        with open(metrics_path, 'r') as f:
            try:
                metrics = json.load(f)
                return jsonify(metrics), 200
            except json.JSONDecodeError:
                return jsonify({"error": "Failed to parse metrics data."}), 500
    return jsonify({"error": "Metrics data not found. Train the model first."}), 404

@app.route('/api/messages', methods=['GET'])
@token_required
def get_messages():
    messages = data_store.get_messages()
    
    sender = request.args.get('sender')
    receiver = request.args.get('receiver')
    
    if sender and receiver:
        messages = [m for m in messages if 
                    (m.get('sender_id') == sender and m.get('receiver_id') == receiver) or 
                    (m.get('sender_id') == receiver and m.get('receiver_id') == sender)]
                    
    if not messages and not (sender and receiver):
        # Fallback only if no params passed and empty
        messages = [
            {"id": "msg_1", "sender_id": "usr_alex", "sender_name": "Alex Johnson", "receiver_id": "usr_consultant", "receiver_name": "Consultant", "text": "Hi, I uploaded my transcripts. Did you get my documents?", "timestamp": "10:30 AM", "is_self": False},
            {"id": "msg_2", "sender_id": "usr_consultant", "sender_name": "Consultant", "receiver_id": "usr_alex", "receiver_name": "Alex Johnson", "text": "Yes, I just reviewed them. They look great! I'll initiate the Stanford application tomorrow.", "timestamp": "10:45 AM", "is_self": True}
        ]
    return jsonify(messages)

@app.route('/api/messages', methods=['POST'])
@token_required
def post_message():
    data = request.json
    messages = data_store.get_messages()
    
    new_message = {
        "id": datetime.now().timestamp(),
        "sender_id": data.get('sender_id', ''),
        "sender_name": data.get('sender_name', ''),
        "receiver_id": data.get('receiver_id', ''),
        "receiver_name": data.get('receiver_name', ''),
        "text": data.get('text', ''),
        "timestamp": datetime.now().isoformat()
    }
    
    messages.append(new_message)
    data_store.save_messages(messages)
    
    return jsonify({"success": True, "message": new_message}), 201

@app.route('/api/meetings', methods=['GET'])
@token_required
def get_meetings():
    meetings = data_store.get_meetings()
    if not meetings:
        meetings = [
            {"id": "mtg_1", "month": "Oct", "day": "24", "title": "Profile Evaluation & Strategy", "time": "10:00 AM - 11:00 AM EST", "studentName": "Alex Johnson"}
        ]
    return jsonify(meetings)

@app.route('/api/meetings', methods=['POST'])
@token_required
def schedule_meeting():
    data = request.json
    meetings = data_store.get_meetings()
    new_meeting = {
        "id": "mtg_" + str(int(datetime.now().timestamp())),
        "month": data.get("month", "Jan"),
        "day": data.get("day", "01"),
        "title": data.get("title", "New Meeting"),
        "time": data.get("time", "12:00 PM EST"),
        "studentName": data.get("studentName", "Student")
    }
    meetings.append(new_meeting)
    data_store.save_meetings(meetings)
    return jsonify({"success": True, "meeting": new_meeting}), 201

@app.route('/api/status_updates', methods=['GET'])
@token_required
def get_status_updates():
    updates = data_store.get_status_updates()
    if not updates:
        updates = [
            {"id": "su_1", "title": "Documentation Review", "desc": "Completed on Oct 10, 2026", "status": "completed", "icon": "CheckCircle"},
            {"id": "su_2", "title": "University Applied", "desc": "Application submitted to Stanford University. Awaiting decision.", "status": "current", "icon": "Clock"},
            {"id": "su_3", "title": "Visa Approval", "desc": "Pending", "status": "pending", "icon": "Empty"}
        ]
    return jsonify(updates)

@app.route('/api/consultancy/stats', methods=['GET'])
@token_required
def get_consultancy_stats():
    return jsonify({
        "activeStudents": 124,
        "pendingApps": 89,
        "successRate": "92%",
        "revenueYTD": "$45k"
    })

if __name__ == '__main__':
    app.run(debug=False, port=5000)
