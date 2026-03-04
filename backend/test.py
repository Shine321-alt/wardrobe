"""
ไฟล์นี้ใช้สำหรับรันเซิร์ฟเวอร์ Flask และกำหนด route หลักของ API
"""
from flask import Flask, jsonify
from flask_cors import CORS
from routes.products import products_bp

app = Flask(__name__)
CORS(app)

# Register blueprints
app.register_blueprint(products_bp, url_prefix='/api')

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)