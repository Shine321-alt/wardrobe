"""
Product routes (Flask + MySQL)
"""

from flask import Blueprint, jsonify, request
import os
import pymysql
from pymysql.cursors import DictCursor
from dotenv import load_dotenv
from pymysql.err import IntegrityError

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
    return pymysql.connect(**DB_CONFIG)


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
# GET product info by id
# -------------------------
@products_bp.route('/products/<int:product_id>/<int:color_id>/<int:size_id>', methods=['GET'])
def get_product(product_id, color_id, size_id):

    conn = get_db_connection()

    with conn.cursor() as cur:
        cur.execute("""
            SELECT
                p.Product_ID,
                p.Product_Name,
                p.Category,
                p.Description,
                v.Price,
                v.Stock,
                c.Color_Name,
                s.Size_Name
            FROM products p
            JOIN product_variants v 
                ON p.Product_ID = v.Product_ID
            JOIN colors c 
                ON v.Color_ID = c.Color_ID
            JOIN sizes s 
                ON v.Size_ID = s.Size_ID
            WHERE 
                p.Product_ID = %s
                AND v.Color_ID = %s
                AND v.Size_ID = %s
        """, (product_id, color_id, size_id))

        product = cur.fetchone()

    conn.close()

    if not product:
        return jsonify({"error": "Product not found"}), 404

    return jsonify(product)

# -------------------------
# GET product colors by product id
# -------------------------
@products_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product_colors(product_id):

    conn = get_db_connection()

    with conn.cursor() as cur:
        cur.execute("""
            SELECT
                c.Color_ID,
                c.Color_Name,
                MIN(pi.Image_URL) AS Image_URL
            FROM product_variants pv
            JOIN colors c
                ON pv.Color_ID = c.Color_ID
            JOIN product_images pi
                ON pv.Variant_ID = pi.Variant_ID
            WHERE pv.Product_ID = %s
            GROUP BY c.Color_ID, c.Color_Name
        """, (product_id,))

        colors = cur.fetchall()

    conn.close()

    return jsonify(colors)

# -------------------------
# GET product sizes by product id
# -------------------------
@products_bp.route('/products/<int:product_id>/<int:color_id>', methods=['GET'])
def get_product_sizes(product_id, color_id):

    conn = get_db_connection()

    with conn.cursor() as cur:
        cur.execute("""
            SELECT DISTINCT
                s.Size_ID,
                s.Size_Name,
                pv.Stock
            FROM product_variants pv
            JOIN sizes s
                ON pv.Size_ID = s.Size_ID
            WHERE pv.Product_ID = %s
            AND pv.Color_ID = %s
        """, (product_id, color_id))

        sizes = cur.fetchall()

    conn.close()

    return jsonify(sizes)

# -------------------------
# GET product images by product id
# -------------------------
@products_bp.route('/products/<int:product_id>/images', methods=['GET'])
def get_product_images(product_id):

    conn = get_db_connection()

    with conn.cursor() as cur:
        cur.execute("""
            SELECT DISTINCT
                pi.Image_URL
            FROM product_variants pv
            JOIN product_images pi
                ON pv.Variant_ID = pi.Variant_ID
            WHERE pv.Product_ID = %s
        """, (product_id,))

        images = cur.fetchall()

    conn.close()

    return jsonify(images)

# -------------------------
# CREATE product + variants
# -------------------------
# -------------------------
# CREATE product
# -------------------------
@products_bp.route('/products', methods=['POST'])
def create_product():

    data = request.json or {}

    product_name = data.get('product_name')
    category = data.get('category')
    description = data.get('description')
    variants = data.get('variants', [])

    if not product_name:
        return jsonify({"error": "product_name is required"}), 400

    conn = get_db_connection()

    try:
        with conn.cursor() as cur:

            # ---------- PRODUCT ----------
            cur.execute("""
                INSERT INTO products (Product_Name, Category, Description)
                VALUES (%s,%s,%s)
                ON DUPLICATE KEY UPDATE
                Category=VALUES(Category),
                Description=VALUES(Description)
            """, (product_name, category, description))

            cur.execute(
                "SELECT Product_ID FROM products WHERE Product_Name=%s",
                (product_name,)
            )

            product_id = cur.fetchone()['Product_ID']

            # ---------- PRELOAD COLORS ----------
            cur.execute("SELECT Color_ID, Color_Name FROM colors")
            colors = {c['Color_Name']: c['Color_ID'] for c in cur.fetchall()}

            # ---------- PRELOAD SIZES ----------
            cur.execute("SELECT Size_ID, Size_Name FROM sizes")
            sizes = {s['Size_Name']: s['Size_ID'] for s in cur.fetchall()}

            # ---------- PRELOAD VARIANTS ----------
            cur.execute("""
                SELECT Variant_ID, Color_ID, Size_ID
                FROM product_variants
                WHERE Product_ID=%s
            """, (product_id,))

            existing_variants = {
                (v['Color_ID'], v['Size_ID']): v['Variant_ID']
                for v in cur.fetchall()
            }

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

                # COLOR
                if color not in colors:
                    cur.execute(
                        "INSERT INTO colors (Color_Name) VALUES (%s)",
                        (color,)
                    )
                    colors[color] = cur.lastrowid

                color_id = colors[color]

                # SIZE
                if size not in sizes:
                    cur.execute(
                        "INSERT INTO sizes (Size_Name) VALUES (%s)",
                        (size,)
                    )
                    sizes[size] = cur.lastrowid

                size_id = sizes[size]

                variant_rows.append(
                    (product_id, color_id, size_id, price, stock)
                )

                # IMAGE
                imgs = v.get('images') or v.get('image_url')

                if imgs:
                    if isinstance(imgs, str):
                        imgs = [imgs]

                    image_rows.append((color_id, size_id, imgs[0]))

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
            cur.execute("""
                SELECT Variant_ID, Color_ID, Size_ID
                FROM product_variants
                WHERE Product_ID=%s
            """, (product_id,))

            variant_map = {
                (v['Color_ID'], v['Size_ID']): v['Variant_ID']
                for v in cur.fetchall()
            }

            # ---------- PREPARE IMAGE UPSERT ----------
            img_rows = []

            for color_id, size_id, url in image_rows:

                variant_id = variant_map.get((color_id, size_id))

                if variant_id:
                    img_rows.append((variant_id, url))
                    created_variants.append(variant_id)

            if img_rows:
                cur.executemany("""
                    INSERT INTO product_images (Variant_ID, Image_URL)
                    VALUES (%s,%s)
                    ON DUPLICATE KEY UPDATE
                    Image_URL=VALUES(Image_URL)
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
# get Name size by id 
# -------------------------
@products_bp.route('/sizes/<int:size_id>', methods=['GET'])
def get_size_name(size_id):

    conn = get_db_connection()

    with conn.cursor() as cur:
        cur.execute("""
            SELECT Size_ID, Size_Name
            FROM sizes
            WHERE Size_ID = %s
        """, (size_id,))

        size = cur.fetchone()

    conn.close()

    if not size:
        return jsonify({"error": "Size not found"}), 404

    return jsonify(size)



# -------------------------
# HERO products (homepage)
# -------------------------
@products_bp.route('/products/hero', methods=['GET'])
def hero_product():

    conn = get_db_connection()

    with conn.cursor() as cur:
        cur.execute("""
            SELECT
                p.Product_ID,
                p.Product_Name,
                p.Category,
                p.Description,
                MIN(pi.Image_URL) AS Image_URL
            FROM products p
            JOIN product_variants pv
                ON p.Product_ID = pv.Product_ID
            JOIN product_images pi
                ON pv.Variant_ID = pi.Variant_ID
            GROUP BY p.Product_ID
            LIMIT 6
        """)

        products = cur.fetchall()

    conn.close()

    return jsonify(products)

# -------------------------
# GET product cards (for shop page)
# -------------------------
@products_bp.route('/products/arrivals', methods=['GET'])
def product_cards():

    conn = get_db_connection()

    with conn.cursor() as cur:
        cur.execute("""
        SELECT
            p.Product_ID,
            p.Product_Name,
            MIN(pv.Price) AS Price,
            MIN(img.Image_URL) AS Image_URL
        FROM products p

        JOIN product_variants pv
            ON p.Product_ID = pv.Product_ID

        LEFT JOIN product_images img
            ON pv.Variant_ID = img.Variant_ID

        GROUP BY p.Product_ID

        ORDER BY p.Product_ID DESC
        LIMIT 4
        """)

        products = cur.fetchall()

    conn.close()

    return jsonify(products)

@products_bp.route('/products/details/<int:product_id>', methods=['GET'])
def product_details(product_id):

    conn = get_db_connection()

    with conn.cursor() as cur:
        cur.execute("""
        SELECT
            p.Product_Name,
            p.Category,
            p.Description,
            c.Color_Name,
            s.Size_Name,
            v.Price,
            v.Stock,
            img.Image_URL
        FROM products p
        JOIN product_variants v 
        ON p.Product_ID = v.Product_ID
        JOIN colors c
        ON v.Color_ID = c.Color_ID
        JOIN sizes s
        ON v.Size_ID = s.Size_ID
        LEFT JOIN product_images img
        ON v.Variant_ID = img.Variant_ID
        WHERE p.Product_ID = %s
        """, (product_id,))

        products = cur.fetchall()

    conn.close()

    return jsonify(products)

