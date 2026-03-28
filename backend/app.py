"""
ไฟล์นี้ใช้สำหรับรันเซิร์ฟเวอร์ Flask และกำหนด route หลักของ API
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS
from routes.products import products_bp
from routes.auth import auth_bp
from routes.cart import cart_bp
from routes.catalog import catalog_bp
from routes.shipping import shipping_bp      # ← import shipping blueprint
from routes.user import user_bp
from routes.cards import cards_bp


app = Flask(__name__)

FRONTEND_URL = os.environ.get(
    "FRONTEND_URL",
    "http://localhost:5173",
)

# ===============================
# ตั้งค่า CORS
# ===============================
CORS(
    app,
    origins=[FRONTEND_URL],
    supports_credentials=True
)

# ===============================
# Register blueprints

app.register_blueprint(products_bp, url_prefix='/api')
# routes login
app.register_blueprint(auth_bp, url_prefix="/api")
# routes cart
app.register_blueprint(cart_bp, url_prefix="/api")
# routes catalog (filter by type/category)
app.register_blueprint(catalog_bp, url_prefix="/api")
# routes user profile
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(cards_bp, url_prefix="/api")
app.register_blueprint(shipping_bp, url_prefix="/api") 
# routes orders



@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "message": "Wardrobe API",
        "endpoints": {
            "products": "/api/products",
            "shipping": "/api/shipping",
            "health": "/health"
        }
    })

@app.route('/health', methods=['GET'])
def health():
    return {'status': 'OK'}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)