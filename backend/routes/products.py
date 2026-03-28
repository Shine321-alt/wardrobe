"""
Product routes (Flask + MySQL)
จัดการ API ทั้งหมดที่เกี่ยวกับ products และ wishlist
"""

from flask import Blueprint, jsonify, request
import os
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv
from utils.token import verify_token

load_dotenv()

products_bp = Blueprint('products', __name__)

# ตั้งค่าการเชื่อมต่อ Database จาก environment variables
DB_CONFIG = {
    'host': os.getenv('MYSQL_HOST'),
    'port': int(os.getenv('MYSQL_PORT')),
    'user': os.getenv('MYSQL_USER'),
    'password': os.getenv('MYSQL_PASSWORD'),
    'database': os.getenv('MYSQL_DB'),
    'cursorclass': DictCursor,  # ให้ผลลัพธ์เป็น dict แทน tuple
    'charset': 'utf8mb4'
}


def get_db_connection():
    """สร้าง connection ใหม่ไปยัง MySQL ทุกครั้งที่เรียก"""
    return pymysql.connect(**DB_CONFIG)


def get_user_id_from_request():
    """
    ดึง user_id จาก JWT token ใน cookie
    คืนค่า user_id (int) หรือ None ถ้าไม่มี token / token ไม่ถูกต้อง
    """
    token = request.cookies.get('token')
    if not token:
        return None

    payload = verify_token(token)
    if not payload:
        return None

    user_id = payload.get('user_id')

    # ป้องกันกรณี token ถูก generate ผิด → user_id ซ้อนเป็น dict
    # เช่น payload = {'user_id': {'user_id': 2, 'role': 'customer'}, 'exp': ...}
    if isinstance(user_id, dict):
        user_id = user_id.get('user_id')

    return user_id


# =========================================
# PRODUCTS
# =========================================

# -------------------------
# GET product + all variants
# -------------------------
@products_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """
    ดึงข้อมูล product พร้อม variants ทั้งหมด
    จัด structure เป็น colors → sizes เพื่อให้ frontend ใช้งานง่าย
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    p.Product_ID,
                    p.Product_Name,
                    p.Type,
                    p.Category,
                    p.Description,
                    pv.Variant_ID,
                    pv.Color_ID,
                    c.Color_Name,
                    pv.Size_ID,
                    s.Size_Name,
                    pv.Price,
                    pv.Stock,
                    (
                        SELECT pi2.Image_URL 
                        FROM product_images pi2
                        JOIN product_variants pv2 ON pi2.Variant_ID = pv2.Variant_ID
                        WHERE pv2.Product_ID = p.Product_ID 
                        AND pv2.Color_ID = pv.Color_ID
                        ORDER BY pi2.Image_ID ASC
                        LIMIT 1
                    ) AS Image_URL
                FROM products p
                JOIN product_variants pv ON p.Product_ID = pv.Product_ID
                JOIN colors c ON pv.Color_ID = c.Color_ID
                JOIN sizes s ON pv.Size_ID = s.Size_ID
                WHERE p.Product_ID = %s
                ORDER BY FIELD(s.Size_Name, 'XS', 'S', 'M', 'L', 'XL', 'XXL')
            """, (product_id,))

            rows = cur.fetchall()
            if not rows:
                return jsonify({"error": "not found"}), 404

            # สร้าง product object หลัก
            product = {
                "Product_ID": rows[0]['Product_ID'],
                "Product_Name": rows[0]['Product_Name'],
                "Type": rows[0]['Type'],         # Men / Women / Kid
                "Category": rows[0]['Category'], # Shirts / Pants / Jacket
                "Description": rows[0]['Description'],
                "colors": {}
            }

            # จัด group variants ตาม Color_ID
            # แต่ละสีมี sizes หลายขนาด
            for r in rows:
                cid = r['Color_ID']
                if cid not in product['colors']:
                    product['colors'][cid] = {
                        "Color_ID": cid,
                        "Color_Name": r['Color_Name'],
                        "Image_URL": r['Image_URL'],
                        "sizes": []
                    }
                product['colors'][cid]['sizes'].append({
                    "Size_ID": r['Size_ID'],
                    "Size_Name": r['Size_Name'],
                    "Price": r['Price'],
                    "Stock": r['Stock'],
                    "Variant_ID": r['Variant_ID']
                })

            # แปลง dict เป็น list เพื่อส่งไป frontend
            product['colors'] = list(product['colors'].values())
            return jsonify(product)

    finally:
        conn.close()


# -------------------------
# GET product images by color
# -------------------------
@products_bp.route('/products/<int:product_id>/images/<int:color_id>', methods=['GET'])
def get_product_images(product_id, color_id):
    """ดึงรูปทั้งหมดของ product ตาม color ที่เลือก"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT DISTINCT pi.Image_URL
                FROM product_images pi
                JOIN product_variants pv ON pi.Variant_ID = pv.Variant_ID
                WHERE pv.Product_ID = %s AND pv.Color_ID = %s
            """, (product_id, color_id))

            images = cur.fetchall()
            return jsonify([r['Image_URL'] for r in images])
    finally:
        conn.close()


# -------------------------
# CREATE / UPDATE product
# -------------------------
@products_bp.route('/products', methods=['POST'])
def create_product():
    """
    สร้างหรืออัปเดต product พร้อม variants และรูปภาพ
    ใช้ ON DUPLICATE KEY UPDATE เพื่อ upsert อัตโนมัติ
    """
    data = request.json or {}

    product_name = data.get('product_name')
    type_ = data.get('type')          # Men / Women / Kid
    category = data.get('category')   # Shirts / Pants / Jacket
    description = data.get('description')
    variants = data.get('variants', [])

    if not product_name:
        return jsonify({"error": "product_name is required"}), 400

    conn = get_db_connection()

    try:
        with conn.cursor() as cur:

            # ---------- PRODUCT ----------
            # upsert product หลัก
            cur.execute("""
                INSERT INTO products (Product_Name, Type, Category, Description)
                VALUES (%s,%s,%s,%s)
                ON DUPLICATE KEY UPDATE
                Type=VALUES(Type),
                Category=VALUES(Category),
                Description=VALUES(Description)
            """, (product_name, type_, category, description))

            # ดึง Product_ID ที่เพิ่ง insert/update
            cur.execute(
                "SELECT Product_ID FROM products WHERE Product_Name=%s",
                (product_name,)
            )
            product_id = cur.fetchone()['Product_ID']

            # ---------- PRELOAD COLORS & SIZES ----------
            # โหลด color และ size ที่มีอยู่แล้วใน DB มาเก็บไว้
            # เพื่อเช็คก่อนว่าต้อง insert เพิ่มไหม
            cur.execute("SELECT Color_ID, Color_Name FROM colors")
            colors = {c['Color_Name']: c['Color_ID'] for c in cur.fetchall()}

            cur.execute("SELECT Size_ID, Size_Name FROM sizes")
            sizes = {s['Size_Name']: s['Size_ID'] for s in cur.fetchall()}

            variant_rows = []
            image_rows = []
            created_variants = []

            # ---------- PROCESS VARIANTS ----------
            for v in variants:

                color = v.get('color')
                size = v.get('size')
                price = v.get('price')
                stock = v.get('stock')

                if not all([color, size, price is not None, stock is not None]):
                    conn.rollback()
                    return jsonify({"error": "variant missing fields"}), 400

                # ถ้าไม่มี color นี้ใน DB → สร้างใหม่
                if color not in colors:
                    cur.execute(
                        "INSERT INTO colors (Color_Name) VALUES (%s)", (color,)
                    )
                    colors[color] = cur.lastrowid
                color_id = colors[color]

                # ถ้าไม่มี size นี้ใน DB → สร้างใหม่
                if size not in sizes:
                    cur.execute(
                        "INSERT INTO sizes (Size_Name) VALUES (%s)", (size,)
                    )
                    sizes[size] = cur.lastrowid
                size_id = sizes[size]

                variant_rows.append((product_id, color_id, size_id, price, stock))

                # รองรับหลายรูปต่อ variant (images เป็น list หรือ string ก็ได้)
                imgs = v.get('images') or v.get('image_url')
                if imgs:
                    if isinstance(imgs, str):
                        imgs = [imgs]
                    for url in imgs:
                        image_rows.append((color_id, size_id, url))

            # ---------- UPSERT VARIANTS ----------
            cur.executemany("""
                INSERT INTO product_variants
                (Product_ID, Color_ID, Size_ID, Price, Stock)
                VALUES (%s,%s,%s,%s,%s)
                ON DUPLICATE KEY UPDATE
                Price=VALUES(Price),
                Stock=VALUES(Stock)
            """, variant_rows)

            # ---------- GET VARIANT IDS ----------
            # ดึง Variant_ID ที่เพิ่ง upsert เพื่อใช้ผูกกับรูปภาพ
            cur.execute("""
                SELECT Variant_ID, Color_ID, Size_ID
                FROM product_variants
                WHERE Product_ID=%s
            """, (product_id,))

            # map (Color_ID, Size_ID) → Variant_ID
            variant_map = {
                (v['Color_ID'], v['Size_ID']): v['Variant_ID']
                for v in cur.fetchall()
            }

            # ---------- INSERT IMAGES ----------
            img_rows = []
            for color_id, size_id, url in image_rows:
                variant_id = variant_map.get((color_id, size_id))
                if variant_id:
                    img_rows.append((variant_id, url))
                    created_variants.append(variant_id)

            # INSERT IGNORE → ไม่ทับรูปเก่าที่มีอยู่แล้ว
            if img_rows:
                cur.executemany("""
                    INSERT IGNORE INTO product_images (Variant_ID, Image_URL)
                    VALUES (%s,%s)
                """, img_rows)

            conn.commit()

            return jsonify({
                "message": "product created/updated",
                "Product_ID": product_id,
                "variants": created_variants
            })

    finally:
        conn.close()


# -------------------------
# HERO products (homepage)
# -------------------------
@products_bp.route('/products/hero', methods=['GET'])
def hero_product():
    """ดึง product 6 อันล่าสุดสำหรับแสดงใน Hero Banner หน้าแรก"""
    conn = get_db_connection()
    with conn.cursor() as cur:
        cur.execute("""
            SELECT
                p.Product_ID,
                p.Product_Name,
                p.Type,
                p.Category,
                p.Description,
                MIN(pi.Image_URL) AS Image_URL
            FROM products p
            JOIN product_variants pv ON p.Product_ID = pv.Product_ID
            JOIN product_images pi ON pv.Variant_ID = pi.Variant_ID
            GROUP BY p.Product_ID
            LIMIT 6
        """)
        products = cur.fetchall()
    conn.close()
    return jsonify(products)


# -------------------------
# GET product cards (homepage)
# -------------------------
@products_bp.route('/products/arrivals', methods=['GET'])
def product_cards():
    """ดึง product 4 อันล่าสุดสำหรับแสดงใน New Arrivals section หน้าแรก"""
    conn = get_db_connection()
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
            GROUP BY p.Product_ID
            ORDER BY p.Product_ID DESC
            LIMIT 4
        """)
        products = cur.fetchall()
    conn.close()
    return jsonify(products)


# =========================================
# WISHLIST
# =========================================

# -------------------------
# WISHLIST — toggle like
# -------------------------
@products_bp.route('/wishlist/<int:product_id>', methods=['POST'])
def toggle_wishlist(product_id):
    """
    Toggle like/unlike product
    ถ้า like อยู่แล้ว → unlike (ลบออก)
    ถ้ายังไม่ like → like (เพิ่มเข้าไป)
    """
    user_id = get_user_id_from_request()

    # ถ้าไม่มี token หรือ token ไม่ถูกต้อง → 401
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:

            # เช็คว่า like อยู่แล้วไหม
            cur.execute("""
                SELECT Like_ID FROM `like`
                WHERE User_ID = %s AND Product_ID = %s
            """, (user_id, product_id))

            existing = cur.fetchone()

            if existing:
                # like อยู่แล้ว → ลบออก (unlike)
                cur.execute("""
                    DELETE FROM `like`
                    WHERE User_ID = %s AND Product_ID = %s
                """, (user_id, product_id))
                liked = False
            else:
                # ยังไม่ like → เพิ่มเข้าไป
                cur.execute("""
                    INSERT INTO `like` (User_ID, Product_ID)
                    VALUES (%s, %s)
                """, (user_id, product_id))
                liked = True

            conn.commit()
            return jsonify({"liked": liked})

    finally:
        conn.close()


# -------------------------
# WISHLIST — check like status
# -------------------------
@products_bp.route('/wishlist/<int:product_id>', methods=['GET'])
def get_wishlist_status(product_id):
    """
    เช็คว่า user like product นี้อยู่ไหม
    ถ้าไม่ได้ login → คืน liked: false (ไม่ error)
    """
    user_id = get_user_id_from_request()

    # ไม่ได้ login → liked = false
    if not user_id:
        return jsonify({"liked": False})

    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT Like_ID FROM `like`
                WHERE User_ID = %s AND Product_ID = %s
            """, (user_id, product_id))

            existing = cur.fetchone()
            # bool(existing) → True ถ้าเจอ, False ถ้าไม่เจอ
            return jsonify({"liked": bool(existing)})

    finally:
        conn.close()


# -------------------------
# WISHLIST — get all liked products
# -------------------------
@products_bp.route('/wishlist', methods=['GET'])
def get_wishlist():
    """ดึง product ทั้งหมดที่ user like ไว้ เรียงจากใหม่ไปเก่า"""
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

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
                FROM `like` l
                JOIN products p ON l.Product_ID = p.Product_ID
                JOIN product_variants pv ON p.Product_ID = pv.Product_ID
                LEFT JOIN product_images img ON pv.Variant_ID = img.Variant_ID
                WHERE l.User_ID = %s
                GROUP BY p.Product_ID
                ORDER BY l.Like_ID DESC
            """, (user_id,))
            rows = cur.fetchall()
        return jsonify(rows)
    finally:
        conn.close()

# =========================================
# ORDERS History of user
# =========================================

@products_bp.route('/orders', methods=['GET'])
def fetch_user_orders_list():
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401
    
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # แก้ไข: เพิ่ม %s และกรองสถานะ Cart ออก (ถ้าต้องการ)
            sql = """
                SELECT 
                    Order_ID as id, 
                    CreateAt as date, 
                    Status as status
                FROM BuyOrder 
                WHERE User_ID = %s 
                ORDER BY CreateAt DESC
            """
            cur.execute(sql, (user_id,)) # ส่ง user_id เข้าไปตรงนี้
            results = cur.fetchall()

            return jsonify(results), 200
    except Exception as e:
        print(f"❌ API Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()




