"""
ไฟล์นี้ใช้สำหรับรันเซิร์ฟเวอร์ Flask และกำหนด route หลักของ API
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from routes.products import products_bp
from routes.auth import auth_bp
from routes.cart import cart_bp
app = Flask(__name__)

FRONTEND_URL = os.environ.get(
    "FRONTEND_URL",
    "http://localhost:5173"
)

# ===============================
# ตั้งค่า CORS
# ===============================
# ต้องตั้ง credentials=True เพื่อให้ cookie ส่งไปได้
# และ origins เพื่อ allow frontend ที่ http://localhost:5173
CORS(
    app,
    origins=[FRONTEND_URL],
    supports_credentials=True
)

# Register blueprints
app.register_blueprint(products_bp, url_prefix='/api')
# routes login
app.register_blueprint(auth_bp, url_prefix="/api")
# routes cart
app.register_blueprint(cart_bp, url_prefix="/api")

@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "Wardrobe API",
        "endpoints": {
            "products": "/api/products",
            "collections": "/api/collections",
            "health": "/health"
        }
    })

@app.route('/health', methods=['GET'])
def health():
    return {'status': 'OK'}



if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)