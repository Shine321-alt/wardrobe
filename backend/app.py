"""
ไฟล์นี้ใช้สำหรับรันเซิร์ฟเวอร์ Flask และกำหนด route หลักของ API
"""

# ===============================
# Import library และ module ที่จำเป็น
# ===============================

# ใช้สำหรับอ่านค่าจาก environment variable เช่น PORT, FRONTEND_URL
import os

# Flask = framework สำหรับสร้าง web server / API
# jsonify = ใช้แปลงข้อมูล Python (dict) → JSON response
from flask import Flask, jsonify

# CORS = อนุญาตให้ frontend (คนละ domain/port) เรียก API ได้
from flask_cors import CORS

# ===============================
# Import blueprint (แยก route เป็น module ย่อย)
# ===============================

# แต่ละไฟล์ใน routes คือกลุ่ม API เช่น products, auth, cart
# blueprint ช่วยแยกโค้ดให้เป็นระบบ ไม่รวมทุกอย่างในไฟล์เดียว

from routes.products import products_bp     # API เกี่ยวกับสินค้า
from routes.auth import auth_bp             # API login/register
from routes.cart import cart_bp             # API ตะกร้าสินค้า
from routes.catalog import catalog_bp       # API หมวดหมู่สินค้า
from routes.shipping import shipping_bp     # API การจัดส่ง
from routes.user import user_bp             # API ผู้ใช้
from routes.cards import cards_bp           # API บัตร (payment card)
from routes.checkout import checkout_bp     # API การสั่งซื้อ
from routes.search import search_bp         # API ค้นหา
from routes.Orders import orders_bp         # API ออเดอร์

# ===============================
# สร้าง Flask application
# ===============================

# app คือ object หลักของ Flask ที่ใช้ควบคุม server ทั้งหมด
app = Flask(__name__)

# ===============================
# ตั้งค่า FRONTEND URL
# ===============================

# พยายามดึงค่า FRONTEND_URL จาก environment variable
# ถ้าไม่มี → ใช้ค่า default เป็น localhost:5173 (frontend dev server)
FRONTEND_URL = os.environ.get(
    "FRONTEND_URL",
    "http://localhost:5173",
)

# ===============================
# ตั้งค่า CORS (สำคัญมากสำหรับ frontend)
# ===============================

# CORS ทำให้ frontend (เช่น React ที่รัน port 5173)
# สามารถเรียก API จาก backend (port 5000) ได้
CORS(
    app,
    origins=[FRONTEND_URL],          # อนุญาตเฉพาะ origin นี้
    supports_credentials=True        # อนุญาตให้ส่ง cookie / auth header ได้
)

# ===============================
# Register blueprints (เชื่อม route ทั้งหมดเข้ากับ app)
# ===============================

# blueprint แต่ละตัวจะมี route ย่อยของตัวเอง
# เช่น products_bp อาจมี /products, /products/<id>

# url_prefix='/api' หมายความว่า:
# ทุก route จะขึ้นต้นด้วย /api เช่น:
# /products → /api/products

app.register_blueprint(products_bp,  url_prefix='/api')
app.register_blueprint(auth_bp,      url_prefix='/api')
app.register_blueprint(cart_bp,      url_prefix='/api')
app.register_blueprint(catalog_bp,   url_prefix='/api')
app.register_blueprint(user_bp,      url_prefix='/api')
app.register_blueprint(cards_bp,     url_prefix='/api')
app.register_blueprint(shipping_bp,  url_prefix='/api')
app.register_blueprint(checkout_bp,  url_prefix='/api')
app.register_blueprint(search_bp,    url_prefix="/api")
app.register_blueprint(orders_bp,    url_prefix="/api")

# ===============================
# Route หลัก (หน้า root ของ API)
# ===============================

# เมื่อ user เข้า "/" (เช่น http://localhost:5000/)
# จะเรียก function home()
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        # ข้อความบอกว่า API นี้คืออะไร
        "message": "Wardrobe API",

        # แสดง endpoint ตัวอย่างให้ developer ดู
        "endpoints": {
            "products": "/api/products",   # endpoint สินค้า
            "shipping": "/api/shipping",   # endpoint การจัดส่ง
            "health": "/health"            # endpoint ตรวจสอบ server
        }
    })

# ===============================
# Health Check API
# ===============================

# ใช้สำหรับเช็คว่า server ยังทำงานอยู่หรือไม่
# เช่น frontend หรือระบบ monitoring จะเรียก endpoint นี้
@app.route('/health', methods=['GET'])
def health():
    return {'status': 'OK'}  # ถ้า server ยังทำงาน → ส่ง OK

# ===============================
# เริ่มรัน server
# ===============================

# __name__ == "__main__ หมายถึง:
# โค้ดนี้จะทำงานเมื่อไฟล์นี้ถูก run โดยตรง (python app.py)

if __name__ == "__main__":

    # ดึงค่า PORT จาก environment variable
    # ถ้าไม่มี → ใช้ default = 5000
    port = int(os.environ.get("PORT", 5000))

    # เริ่มรัน Flask server
    app.run(
        host="0.0.0.0",   # เปิดให้เครื่องอื่นใน network เข้าถึงได้
        port=port         # port ที่ใช้รัน server
    )