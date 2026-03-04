"""
ไฟล์นี้ใช้สำหรับกำหนด route ที่เกี่ยวกับสินค้า เช่น ดึงข้อมูลสินค้า สร้างสินค้าใหม่ ใน backend (Flask)
"""
from flask import Blueprint, jsonify, request
import json
import os

products_bp = Blueprint('products', __name__)

DATA_FILE = os.path.join(os.path.dirname(__file__), '../data/products.json')

def load_data():
    with open(DATA_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

@products_bp.route('/products', methods=['GET'])
def get_products():
    """ดึงสินค้าทั้งหมด"""
    data = load_data()
    return jsonify(data['products'])

@products_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """ดึงสินค้าตาม ID"""
    data = load_data()
    product = next((p for p in data['products'] if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

@products_bp.route('/products', methods=['POST'])
def create_product():
    """สร้างสินค้าใหม่"""
    data = load_data()
    new_product = request.json
    new_product['id'] = max([p['id'] for p in data['products']]) + 1 if data['products'] else 1
    data['products'].append(new_product)
    save_data(data)
    return jsonify(new_product), 201

@products_bp.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """อัปเดตสินค้า"""
    data = load_data()
    product = next((p for p in data['products'] if p['id'] == product_id), None)
    if product:
        product.update(request.json)
        save_data(data)
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

@products_bp.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """ลบสินค้า"""
    data = load_data()
    data['products'] = [p for p in data['products'] if p['id'] != product_id]
    save_data(data)
    return jsonify({"message": "Product deleted"})

@products_bp.route('/collections', methods=['GET'])
def get_collections():
    """ดึงคอลเลคชั่นทั้งหมด"""
    data = load_data()
    return jsonify(data['collections'])
