"""
ไฟล์นี้ใช้สำหรับกำหนด route ที่เกี่ยวกับสินค้า (Flask + MySQL)
"""
from flask import Blueprint, jsonify, request
import os
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv

load_dotenv()

products_bp = Blueprint('products', __name__)

DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST', '192.168.1.176'),
    'user': os.getenv('MYSQL_USER', 'DataBaseAdmin'),
    'password': os.getenv('MYSQL_PASSWORD', '123456'),
    'database': os.getenv('MYSQL_DB', 'Ecommerce'),
    'cursorclass': DictCursor,
    'charset': 'utf8mb4'
}

def get_db_connection():
    return pymysql.connect(
        host=DB_CONFIG['host'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        database=DB_CONFIG['database'],
        cursorclass=DB_CONFIG['cursorclass'],
        charset=DB_CONFIG['charset']
    )

# -------------------------
# GET all products
# -------------------------
@products_bp.route('/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM products")
        rows = cur.fetchall()
    conn.close()
    return jsonify(rows)

# -------------------------
# GET product by id
# -------------------------
@products_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM products WHERE Product_ID = %s", (product_id,))
        product = cur.fetchone()
    conn.close()

    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

# -------------------------
# CREATE product
# -------------------------
@products_bp.route('/products', methods=['POST'])
def create_product():
    data = request.json

    conn = get_db_connection()
    with conn.cursor() as cur:
        sql = """
        INSERT INTO products (Name, )
        VALUES (%s, %s)
        """
        cur.execute(sql, (data['Name'], data['Category'],data['Description'],))
        conn.commit()
        new_id = cur.lastrowid
    conn.close()

    data['Product_ID'] = new_id
    return jsonify(data), 201

# -------------------------
# UPDATE product
# -------------------------
@products_bp.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.json

    conn = get_db_connection()
    with conn.cursor() as cur:
        sql = """
        UPDATE products
        SET Name=%s, Category=%s, Description=%s
        WHERE Product_ID=%s
        """
        cur.execute(sql, (data['Name'], data['Category'], data['Description'], product_id))
        conn.commit()
    conn.close()

    return jsonify({"message": "Product updated"})

# -------------------------
# DELETE product
# -------------------------
@products_bp.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute("DELETE FROM products WHERE Product_ID=%s", (product_id,))
        conn.commit()
    conn.close()

    return jsonify({"message": "Product deleted"})