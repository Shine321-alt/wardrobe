"""
Search routes (Flask + MySQL)
ค้นหา product ตาม keyword
"""

from flask import Blueprint, jsonify, request
import os
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv

load_dotenv()

search_bp = Blueprint('search', __name__)

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
# GET /api/search?q=keyword
# -------------------------
@search_bp.route('/search', methods=['GET'])
def search_products():
    """
    ค้นหา product ตาม keyword
    เช่น GET /api/search?q=jacket
    ค้นจาก Product_Name, Category, Type, Description
    """
    q = request.args.get('q', '').strip()

    # ถ้าไม่มี keyword → คืน empty array
    if not q:
        return jsonify([])

    keyword = f'%{q}%'

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    p.Product_ID,
                    p.Product_Name,
                    p.Type,
                    p.Category,
                    MIN(pv.Price)    AS Price,
                    MIN(img.Image_URL) AS Image_URL
                FROM products p
                JOIN product_variants pv ON p.Product_ID = pv.Product_ID
                LEFT JOIN product_images img ON pv.Variant_ID = img.Variant_ID
                WHERE
                    p.Product_Name  LIKE %s OR
                    p.Category      LIKE %s OR
                    p.Type          LIKE %s OR
                    p.Description   LIKE %s
                GROUP BY p.Product_ID
                ORDER BY p.Product_ID DESC
                LIMIT 20
            """, (keyword, keyword, keyword, keyword))

            results = cur.fetchall()
        return jsonify(results)
    finally:
        conn.close()