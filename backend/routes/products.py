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
    'host': os.getenv('MYSQL_HOST', 'ballast.proxy.rlwy.net'),
    'port': int(os.getenv('MYSQL_PORT', '58189')),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', 'WwPUUjhdUgqxIBxwqhDdwSxTYcShwuVR'),
    'database': os.getenv('MYSQL_DB', 'Ecommerce'),
    'cursorclass': DictCursor,
    'charset': 'utf8mb4'
}

def get_db_connection():
    return pymysql.connect(
        host=DB_CONFIG['host'],
        port=DB_CONFIG['port'],
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

        cur.execute("""
            INSERT INTO products (Product_Name, Category, Description)
            VALUES (%s,%s,%s)
        """, (
            data['product_name'],
            data['category'],
            data['description']
        ))

        product_id = cur.lastrowid

        conn.commit()

    conn.close()

    return jsonify({
        "message": "product created",
        "product_id": product_id
    })
# -------------------------
# CREATE variant for product
# -------------------------
@products_bp.route('/products/<int:product_id>/variants', methods=['POST'])
def add_variant(product_id):

    data = request.json
    conn = get_db_connection()

    with conn.cursor() as cur:

        for v in data['variants']:

            # ---------- COLOR ----------
            cur.execute("""
                SELECT Color_ID FROM colors
                WHERE Color_Name = %s
            """, (v['color'],))

            color = cur.fetchone()

            if color:
                color_id = color['Color_ID']
            else:
                cur.execute("""
                    INSERT INTO colors (Color_Name)
                    VALUES (%s)
                """, (v['color'],))
                color_id = cur.lastrowid


            # ---------- SIZE ----------
            cur.execute("""
                SELECT Size_ID FROM sizes
                WHERE Size_Name = %s
            """, (v['size'],))

            size = cur.fetchone()

            if size:
                size_id = size['Size_ID']
            else:
                cur.execute("""
                    INSERT INTO sizes (Size_Name)
                    VALUES (%s)
                """, (v['size'],))
                size_id = cur.lastrowid


            # ---------- VARIANT ----------
            cur.execute("""
                INSERT INTO product_variants
                (Product_ID, Color_ID, Size_ID, Price, Stock)
                VALUES (%s,%s,%s,%s,%s)
            """, (
                product_id,
                color_id,
                size_id,
                v['price'],
                v['stock']
            ))

            variant_id = cur.lastrowid


            # ---------- IMAGE ----------
            cur.execute("""
                INSERT INTO product_images
                (Variant_ID, Image_URL)
                VALUES (%s,%s)
            """, (
                variant_id,
                v['image']
            ))

        conn.commit()

    conn.close()

    return jsonify({
        "message": "variants added",
        "product_id": product_id
    })
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
        cur.execute(sql, (data['Product_Name'], data['Category'], data['Description'], product_id))
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

@products_bp.route('/products/hero', methods=['GET'])
def hero_product():
    conn = get_db_connection()

    with conn.cursor() as cur:
        cur.execute("""
            SELECT DISTINCT 
                p.Product_ID,
                p.Product_Name,
                p.Category,
                p.Description,
                pi.Image_URL
            FROM products p
            JOIN product_variants pv 
                ON p.Product_ID = pv.Product_ID
            JOIN product_images pi 
                ON pv.Variant_ID = pi.Variant_ID
            LIMIT 6
        """)

        products = cur.fetchall()

    conn.close()

    return jsonify(products)