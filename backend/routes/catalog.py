"""
Catalog routes (Flask + MySQL)
จัดการ API สำหรับกรอง product ตาม Type และ Category
"""

from flask import Blueprint, jsonify, request
import os
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv

load_dotenv()

# สร้าง Blueprint ชื่อ catalog
catalog_bp = Blueprint('catalog', __name__)

DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST'),
    'port': int(os.getenv('MYSQL_PORT')),
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'database': os.getenv('MYSQL_DB'),
    'cursorclass': DictCursor,
    'charset': 'utf8mb4'
}


def get_db_connection():
    return pymysql.connect(**DB_CONFIG)


# -------------------------
# GET products by type + category
# -------------------------
@catalog_bp.route('/products/filter', methods=['GET'])
def get_products_by_filter():
    """
    ดึง product ตาม Type และ Category จาก query params
    เช่น GET /api/products/filter?type=Men&category=T-Shirts
    ถ้าส่งแค่ type → กรองแค่ type (ทุก category ใน type นั้น)
    ถ้าส่งทั้ง type + category → กรองทั้งคู่
    """
    type_ = request.args.get('type')        # Men / Women / Kid
    category = request.args.get('category') # T-Shirts / Shirts / ...

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:

            # สร้าง WHERE clause แบบ dynamic
            conditions = []
            params = []

            if type_:
                conditions.append("p.Type = %s")
                params.append(type_)

            if category:
                conditions.append("p.Category = %s")
                params.append(category)

            where = "WHERE " + " AND ".join(conditions) if conditions else ""

            cur.execute(f"""
                SELECT
                    p.Product_ID,
                    p.Product_Name,
                    p.Type,
                    p.Category,
                    MIN(pv.Price) AS Price,
                    MIN(img.Image_URL) AS Image_URL
                FROM products p
                JOIN product_variants pv ON p.Product_ID = pv.Product_ID
                LEFT JOIN product_images img ON pv.Variant_ID = img.Variant_ID
                {where}
                GROUP BY p.Product_ID
                ORDER BY p.Product_ID DESC
            """, params)

            rows = cur.fetchall()
        return jsonify(rows)
    finally:
        conn.close()


# -------------------------
# GET new arrivals (12 ล่าสุด ของ type นั้น)
# -------------------------
@catalog_bp.route('/products/new-arrivals', methods=['GET'])
def new_arrivals():
    """
    ดึง 12 product ล่าสุดของ type นั้น
    เช่น GET /api/products/new-arrivals?type=Men
    """
    type_ = request.args.get('type')  # Men / Women / Kid

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    p.Product_ID,
                    p.Product_Name,
                    p.Type,
                    p.Category,
                    MIN(pv.Price) AS Price,
                    MIN(img.Image_URL) AS Image_URL
                FROM products p
                JOIN product_variants pv ON p.Product_ID = pv.Product_ID
                LEFT JOIN product_images img ON pv.Variant_ID = img.Variant_ID
                WHERE p.Type = %s
                GROUP BY p.Product_ID
                ORDER BY p.Product_ID DESC
                LIMIT 12
            """, (type_,))
            rows = cur.fetchall()
        return jsonify(rows)
    finally:
        conn.close()