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
