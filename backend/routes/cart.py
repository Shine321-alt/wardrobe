
from flask import Blueprint, jsonify, request
import os
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv
from utils.token import verify_token

load_dotenv()

cart_bp = Blueprint('cart', __name__)

DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'database': os.getenv('MYSQL_DB'),
    'cursorclass': DictCursor,
    'charset': 'utf8mb4'
}

def get_db_connection():
    return pymysql.connect(**DB_CONFIG)

def get_user_id_from_request():
    token = request.cookies.get('token')
    if not token: return None
    payload = verify_token(token)
    if not payload: return None
    user_id = payload.get('user_id')
    return user_id.get('user_id') if isinstance(user_id, dict) else user_id


# =========================================
# ฟังก์ชันช่วย: คำนวณยอดรวมและอัปเดตลงตาราง orders
# =========================================
def update_order_total(cur, order_id):

    cur.execute("""
        UPDATE orders 
        SET Total_Price = IFNULL((
            SELECT SUM(Quantity * Price_At_Purchase) 
            FROM order_items 
            WHERE Order_ID = %s
        ), 0)
        WHERE Order_ID = %s
    """, (order_id, order_id))


# =========================================
# GET - ดึงข้อมูลตะกร้าสินค้า
# =========================================
@cart_bp.route('/cart', methods=['GET'])
def get_cart():
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT Order_ID, Total_Price 
                FROM orders 
                WHERE User_ID = %s AND Status = 'Cart'
            """, (user_id,))
            order = cur.fetchone()

            if not order:
                return jsonify({"items": [], "total_price": 0, "total_items": 0})

            order_id = order['Order_ID']

            # ดึง Price จาก oi.Price (ที่บันทึกไว้ตอนแอด) แทน
            cur.execute("""
                SELECT 
                    oi.Order_Item_ID AS Cart_ID, 
                    oi.Variant_ID,
                    oi.Quantity,
                    oi.Price_At_Purchase AS Price,
                    p.Product_ID,
                    p.Product_Name,
                    col.Color_Name,
                    s.Size_Name,
                    pv.Stock,
                    (
                        SELECT pi.Image_URL 
                        FROM product_images pi 
                        WHERE pi.Variant_ID = pv.Variant_ID 
                        ORDER BY pi.Image_ID ASC 
                        LIMIT 1
                    ) AS Image_URL
                FROM order_items oi
                JOIN product_variants pv ON oi.Variant_ID = pv.Variant_ID
                JOIN products p ON pv.Product_ID = p.Product_ID
                JOIN colors col ON pv.Color_ID = col.Color_ID
                JOIN sizes s ON pv.Size_ID = s.Size_ID
                WHERE oi.Order_ID = %s
                ORDER BY oi.Order_Item_ID DESC
            """, (order_id,))
            
            cart_items = cur.fetchall()

            return jsonify({
                "items": cart_items,
                "total_price": order['Total_Price'],
                "total_items": len(cart_items)
            })
    finally:
        conn.close()


# =========================================
# POST - เพิ่มสินค้าลงตะกร้า (Add to cart)
# =========================================
@cart_bp.route('/cart', methods=['POST'])
def add_to_cart():
    user_id = get_user_id_from_request()
    if not user_id: return jsonify({"error": "unauthorized"}), 401

    data = request.get_json() or {}
    variant_id = data.get('variant_id')
    quantity = data.get('quantity', 1)

    if not variant_id: return jsonify({"error": "variant_id is required"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # 1. ดึงราคาสินค้าปัจจุบันจาก product_variants ก่อน เพื่อเอาไปใส่ใน order_items
            cur.execute("SELECT Price FROM product_variants WHERE Variant_ID = %s", (variant_id,))
            variant = cur.fetchone()
            if not variant:
                return jsonify({"error": "Variant not found"}), 404
            current_price = variant['Price']

            # 2. เช็คว่ามี Order ที่เป็นสถานะ 'Cart' หรือยัง?
            cur.execute("SELECT Order_ID FROM orders WHERE User_ID = %s AND Status = 'Cart'", (user_id,))
            order = cur.fetchone()

            if order:
                order_id = order['Order_ID']
            else:
                # ถ้ายังไม่มี ให้สร้าง Order ใหม่สถานะเป็น 'Cart'
                cur.execute("""
                    INSERT INTO orders (User_ID, Total_Price, Status) 
                    VALUES (%s, 0, 'Cart')
                """, (user_id,))
                order_id = cur.lastrowid

            # 3. เช็คว่าใน order_items มีสินค้านี้อยู่แล้วไหม?
            cur.execute("""
                SELECT Order_Item_ID, Quantity 
                FROM order_items 
                WHERE Order_ID = %s AND Variant_ID = %s
            """, (order_id, variant_id))
            existing_item = cur.fetchone()

            if existing_item:
                # ถ้ามีอยู่แล้ว -> อัปเดตจำนวน (ส่วนราคาให้คงเดิมไว้ หรืออัปเดตเป็นราคาใหม่ก็ได้ ในเคสนี้เราอัปเดตจำนวนอย่างเดียว)
                new_qty = existing_item['Quantity'] + quantity
                cur.execute("UPDATE order_items SET Quantity = %s WHERE Order_Item_ID = %s", (new_qty, existing_item['Order_Item_ID']))
            else:
                # ถ้ายังไม่มี -> เพิ่มแถวใหม่ พร้อมบันทึก "ราคา" ลงไปด้วย!
                cur.execute("""
                    INSERT INTO order_items (Order_ID, Variant_ID, Quantity, Price_At_Purchase) 
                    VALUES (%s, %s, %s, %s)
                """, (order_id, variant_id, quantity, current_price))

            # 4. อัปเดต Total_Price ของออเดอร์นั้น
            update_order_total(cur, order_id)

            conn.commit()
            return jsonify({"status": "success", "message": "Item added to cart"})
    except Exception as e:
        conn.rollback()
        print("====== ADD TO CART ERROR ======\n", e)
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

# =========================================
# PUT & DELETE (อัปเดตจำนวนและลบสินค้า)
# =========================================
@cart_bp.route('/cart/<int:item_id>', methods=['PUT'])
def update_cart_quantity(item_id):
    user_id = get_user_id_from_request()
    if not user_id: return jsonify({"error": "unauthorized"}), 401

    data = request.get_json() or {}
    new_quantity = data.get('quantity')
    if new_quantity is None or new_quantity < 1: return jsonify({"error": "invalid quantity"}), 400

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT oi.Order_ID FROM order_items oi
                JOIN orders o ON oi.Order_ID = o.Order_ID
                WHERE oi.Order_Item_ID = %s AND o.User_ID = %s AND o.Status = 'Cart'
            """, (item_id, user_id))
            
            result = cur.fetchone()
            if not result: return jsonify({"error": "not found or unauthorized"}), 404
            
            order_id = result['Order_ID']

            cur.execute("UPDATE order_items SET Quantity = %s WHERE Order_Item_ID = %s", (new_quantity, item_id))
            update_order_total(cur, order_id)
            
            conn.commit()
            return jsonify({"status": "success"})
    finally:
        conn.close()

@cart_bp.route('/cart/<int:item_id>', methods=['DELETE'])
def remove_from_cart(item_id):
    user_id = get_user_id_from_request()
    if not user_id: return jsonify({"error": "unauthorized"}), 401

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT oi.Order_ID FROM order_items oi
                JOIN orders o ON oi.Order_ID = o.Order_ID
                WHERE oi.Order_Item_ID = %s AND o.User_ID = %s AND o.Status = 'Cart'
            """, (item_id, user_id))
            
            result = cur.fetchone()
            if not result: return jsonify({"error": "not found or unauthorized"}), 404
            
            order_id = result['Order_ID']

            cur.execute("DELETE FROM order_items WHERE Order_Item_ID = %s", (item_id,))
            update_order_total(cur, order_id)

            conn.commit()
            return jsonify({"status": "success"})
    finally:
        conn.close()