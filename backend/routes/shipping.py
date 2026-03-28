"""
Shipping Address routes (Flask + MySQL)
จัดการ API สำหรับ shipping address ของ user
"""

from flask import Blueprint, jsonify, request
import os
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv
from utils.token import verify_token

load_dotenv()

shipping_bp = Blueprint('shipping', __name__)

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
# GET all shipping addresses ของ user
# -------------------------
@shipping_bp.route('/shipping', methods=['GET'])
def get_shipping_addresses():
    """ดึง shipping address ทั้งหมดของ user ที่ login อยู่"""
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM shipping_address
                WHERE User_ID = %s
                ORDER BY Address_ID DESC
            """, (user_id,))
            rows = cur.fetchall()
        return jsonify(rows)
    finally:
        conn.close()


# -------------------------
# POST add new shipping address
# -------------------------
@shipping_bp.route('/shipping', methods=['POST'])
def add_shipping_address():
    """เพิ่ม shipping address ใหม่ของ user"""
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    data = request.json or {}

    firstname      = data.get('firstName')
    lastname       = data.get('lastName')
    city           = data.get('city')
    address_desc   = data.get('address')        # Address_Desc — ที่อยู่หลัก
    address_source = data.get('addressLine2', '') # Address_Source — ที่อยู่เพิ่มเติม
    postcode       = data.get('zipCode')
    country        = data.get('country')
    phonenumber    = data.get('phone')
    email          = data.get('email', '')

    # ตรวจสอบ field ที่จำเป็น
    if not all([firstname, lastname, city, address_desc, postcode, country, phonenumber]):
        return jsonify({"error": "missing required fields"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO shipping_address
                (User_ID, Firstname, Lastname, City, Address_Desc,
                Postcode, Country, Phonenumber, Email, Address_Source)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """, (
                user_id, firstname, lastname, city, address_desc,
                postcode, country, phonenumber, email, address_source
            ))
            conn.commit()
            new_id = cur.lastrowid

        return jsonify({"message": "address added", "Address_ID": new_id}), 201
    finally:
        conn.close()


# -------------------------
# DELETE shipping address
# -------------------------
@shipping_bp.route('/shipping/<int:address_id>', methods=['DELETE'])
def delete_shipping_address(address_id):
    """ลบ shipping address ของ user"""
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # ลบเฉพาะ address ที่เป็นของ user นั้น
            cur.execute("""
                DELETE FROM shipping_address
                WHERE Address_ID = %s AND User_ID = %s
            """, (address_id, user_id))
        conn.commit()
        return jsonify({"message": "address deleted"})
    finally:
        conn.close()