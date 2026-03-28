"""
Orders routes (Flask + MySQL)
จัดการ API สำหรับ order history และ order detail
"""

from flask import Blueprint, jsonify, request
import os
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv
from utils.token import verify_token

load_dotenv()

orders_bp = Blueprint('orders', __name__)

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


def get_user_id_from_request():
    """ดึง user_id จาก JWT token ใน cookie"""
    token = request.cookies.get('token')
    if not token:
        return None
    payload = verify_token(token)
    if not payload:
        return None
    user_id = payload.get('user_id')
    if isinstance(user_id, dict):
        user_id = user_id.get('user_id')
    return user_id


# -------------------------
# GET all orders ของ user
# -------------------------
@orders_bp.route('/orders', methods=['GET'])
def get_orders():
    """ดึง order ทั้งหมดของ user (ยกเว้น Status='Cart')"""
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    o.Order_ID        AS id,
                    o.Total_Price     AS total,
                    o.Shipping_Fee    AS shipping_fee,
                    o.Status          AS status,
                    o.Created_At      AS date,
                    b.BOS_ID,
                    b.Firstname,
                    b.Lastname,
                    b.Address_Desc,
                    b.Town,
                    b.Postcode,
                    b.Country,
                    b.Phonenumber,
                    b.Cardnumber
                FROM orders o
                LEFT JOIN BuyOrder b ON o.Order_ID = b.Order_ID
                WHERE o.User_ID = %s
                ORDER BY o.Created_At DESC
            """, (user_id,))
            orders = cur.fetchall()
        return jsonify(orders)
    finally:
        conn.close()


# -------------------------
# GET order detail + items
# -------------------------
@orders_bp.route('/orders/<int:order_id>', methods=['GET'])
def get_order_detail(order_id):
    """ดึงข้อมูล order พร้อม items ทั้งหมด"""
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:

            # ── ดึงข้อมูล order หลัก ──
            cur.execute("""
                SELECT
                    o.Order_ID        AS id,
                    o.Total_Price     AS total,
                    o.Shipping_Fee    AS shipping_fee,
                    o.Status          AS status,
                    o.Payment_Slip_URL AS payment_slip,
                    o.Created_At      AS date,
                    b.BOS_ID,
                    b.Firstname,
                    b.Lastname,
                    b.Address_Desc,
                    b.Town,
                    b.Postcode,
                    b.Country,
                    b.Phonenumber,
                    b.Cardnumber,
                    b.Expired
                FROM orders o
                LEFT JOIN BuyOrder b ON o.Order_ID = b.Order_ID
                WHERE o.Order_ID = %s AND o.User_ID = %s
            """, (order_id, user_id))

            order = cur.fetchone()
            if not order:
                return jsonify({"error": "order not found"}), 404

            # ── ดึง items ใน order ──
            cur.execute("""
                SELECT
                    oi.Order_Item_ID,
                    oi.Quantity,
                    oi.Price_At_Purchase    AS Price,
                    p.Product_Name,
                    c.Color_Name,
                    s.Size_Name,
                    MIN(pi.Image_URL)       AS Image_URL
                FROM order_items oi
                JOIN product_variants pv ON oi.Variant_ID = pv.Variant_ID
                JOIN products p          ON pv.Product_ID = p.Product_ID
                JOIN colors c            ON pv.Color_ID = c.Color_ID
                JOIN sizes s             ON pv.Size_ID = s.Size_ID
                LEFT JOIN product_images pi ON pv.Variant_ID = pi.Variant_ID
                WHERE oi.Order_ID = %s
                GROUP BY oi.Order_Item_ID
            """, (order_id,))

            items = cur.fetchall()

        # รวม items เข้าไปใน order
        order['items'] = items
        return jsonify(order)

    finally:
        conn.close()