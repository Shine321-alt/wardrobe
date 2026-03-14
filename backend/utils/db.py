"""
ไฟล์นี้ใช้สำหรับฟังก์ชันจัดการข้อมูลสินค้าและคอลเลคชั่นในระบบ backend
"""
import json
import os

DATA_FILE = os.path.join(os.path.dirname(__file__), '../data/products.json')

def load_data():
    """โหลดข้อมูลจากไฟล์ JSON"""
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_data(data):
    """บันทึกข้อมูลลงไฟล์ JSON"""
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def get_all_products():
    """ดึงสินค้าทั้งหมด"""
    data = load_data()
    return data.get('products', [])

def get_product_by_id(product_id):
    """ดึงสินค้าตาม ID"""
    products = get_all_products()
    return next((p for p in products if p['id'] == product_id), None)

def get_all_collections():
    """ดึงคอลเลคชั่นทั้งหมด"""
    data = load_data()
    return data.get('collections', [])


DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'ballast.proxy.rlwy.net'),
    'port': int(os.getenv('MYSQL_PORT', '58189')),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', 'WwPUUjhdUgqxIBxwqhDdwSxTYcShwuVR'),
    'database': os.getenv('MYSQL_DB', 'Ecommerce'),
    'cursorclass': pymysql.cursors.DictCursor,
    'charset': 'utf8mb4'
}

def get_db_connection():
    """ฟังก์ชันสำหรับสร้างการเชื่อมต่อกับ MySQL Database"""
    return pymysql.connect(**DB_CONFIG)
