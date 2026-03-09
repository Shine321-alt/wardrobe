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
# GET product by id
# -------------------------
@products_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):

    conn = get_db_connection()

    with conn.cursor() as cur:
        cur.execute(
            "SELECT * FROM products WHERE Product_ID=%s",
            (product_id,)
        )
        product = cur.fetchone()

    conn.close()

    if not product:
        return jsonify({"error": "Product not found"}), 404

    return jsonify(product)


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
    variants = data.get('variants')

    if not product_name:
        return jsonify({"error": "product_name is required"}), 400

    conn = get_db_connection()

    try:
        with conn.cursor() as cur:

            # ---------- CHECK PRODUCT ----------
            cur.execute(
                "SELECT Product_ID FROM products WHERE Product_Name = %s",
                (product_name,)
            )
            product = cur.fetchone()

            if product:
                product_id = product['Product_ID']
                exists = True

                # UPDATE DESCRIPTION + CATEGORY
                cur.execute("""
                    UPDATE products
                    SET Category=%s, Description=%s
                    WHERE Product_ID=%s
                """, (category, description, product_id))

            else:
                cur.execute("""
                    INSERT INTO products (Product_Name, Category, Description)
                    VALUES (%s,%s,%s)
                """, (product_name, category, description))

                product_id = cur.lastrowid
                exists = False

            # ---------- VARIANTS ----------
            created_variants = []
            created_images = []

            if variants and isinstance(variants, list):

                try:
                    for v in variants:

                        color = v.get('color')
                        size = v.get('size')
                        price = v.get('price')
                        stock = v.get('stock')

                        if not all([color, size, price is not None, stock is not None]):
                            raise ValueError('variant missing required fields')

                        # ---------- COLOR ----------
                        cur.execute(
                            "SELECT Color_ID FROM colors WHERE Color_Name=%s",
                            (color,)
                        )
                        c = cur.fetchone()

                        if c:
                            color_id = c['Color_ID']
                        else:
                            cur.execute(
                                "INSERT INTO colors (Color_Name) VALUES (%s)",
                                (color,)
                            )
                            color_id = cur.lastrowid

                        # ---------- SIZE ----------
                        cur.execute(
                            "SELECT Size_ID FROM sizes WHERE Size_Name=%s",
                            (size,)
                        )
                        s = cur.fetchone()

                        if s:
                            size_id = s['Size_ID']
                        else:
                            cur.execute(
                                "INSERT INTO sizes (Size_Name) VALUES (%s)",
                                (size,)
                            )
                            size_id = cur.lastrowid

                        # ---------- VARIANT ----------
                        cur.execute("""
                            SELECT Variant_ID, Price, Stock
                            FROM product_variants
                            WHERE Product_ID=%s AND Color_ID=%s AND Size_ID=%s
                        """, (product_id, color_id, size_id))

                        variant = cur.fetchone()

                        if variant:
                            variant_id = variant['Variant_ID']

                            existing_price = variant.get('Price')
                            existing_stock = variant.get('Stock')

                            if price != existing_price or stock != existing_stock:
                                cur.execute("""
                                    UPDATE product_variants
                                    SET Price=%s, Stock=%s
                                    WHERE Variant_ID=%s
                                """, (price, stock, variant_id))

                        else:
                            cur.execute("""
                                INSERT INTO product_variants
                                (Product_ID, Color_ID, Size_ID, Price, Stock)
                                VALUES (%s,%s,%s,%s,%s)
                            """, (
                                product_id,
                                color_id,
                                size_id,
                                price,
                                stock
                            ))

                            variant_id = cur.lastrowid

                        created_variants.append(variant_id)

                        # ---------- IMAGES ----------
                        imgs = v.get('images') or v.get('image_url')

                        if imgs:

                            if isinstance(imgs, str):
                                imgs = [imgs]

                            url = imgs[0]

                            cur.execute(
                                "SELECT Image_ID FROM product_images WHERE Variant_ID=%s",
                                (variant_id,)
                            )

                            img = cur.fetchone()

                            if img:
                                cur.execute("""
                                    UPDATE product_images
                                    SET Image_URL=%s
                                    WHERE Variant_ID=%s
                                """, (url, variant_id))

                                created_images.append(img['Image_ID'])

                            else:
                                cur.execute("""
                                    INSERT INTO product_images (Variant_ID, Image_URL)
                                    VALUES (%s,%s)
                                """, (variant_id, url))

                                created_images.append(cur.lastrowid)

                except IntegrityError:
                    conn.rollback()
                    return jsonify({"error": "one or more variants conflict (duplicate)"}), 400

                except ValueError as e:
                    conn.rollback()
                    return jsonify({"error": str(e)}), 400

            conn.commit()

        if exists:
            return jsonify({
                "message": "product updated",
                "Product_ID": product_id,
                "created_variants": created_variants,
                "created_images": created_images
            })
        else:
            return jsonify({
                "message": "product created",
                "Product_ID": product_id,
                "created_variants": created_variants,
                "created_images": created_images
            })

    finally:
        conn.close()


# -------------------------
# UPDATE product
# -------------------------
@products_bp.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):

    data = request.json

    conn = get_db_connection()

    with conn.cursor() as cur:

        cur.execute("""
            UPDATE products
            SET Product_Name=%s,
                Category=%s,
                Description=%s
            WHERE Product_ID=%s
        """, (
            data.get('product_name'),
            data.get('category'),
            data.get('description'),
            product_id
        ))

        conn.commit()

    conn.close()

    return jsonify({"message": "product updated"})


# -------------------------
# DELETE product
# -------------------------
@products_bp.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):

    conn = get_db_connection()

    with conn.cursor() as cur:
        cur.execute(
            "DELETE FROM products WHERE Product_ID=%s",
            (product_id,)
        )
        conn.commit()

    conn.close()

    return jsonify({"message": "product deleted"})


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
        LIMIT 5
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