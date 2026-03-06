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
    variants = data.get('variants')  # optional list of variants

    if not product_name:
        return jsonify({"error": "product_name is required"}), 400

    conn = get_db_connection()

    try:
        with conn.cursor() as cur:
            # check if product exists
            cur.execute(
                "SELECT Product_ID FROM products WHERE Product_Name = %s",
                (product_name,)
            )
            product = cur.fetchone()

            if product:
                product_id = product['Product_ID']
                exists = True
            else:
                cur.execute(
                    "INSERT INTO products (Product_Name, Category, Description) VALUES (%s,%s,%s)",
                    (product_name, category, description)
                )
                product_id = cur.lastrowid
                exists = False

            # If variants were provided, insert them in the same transaction
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

                        # get or create color (select first to avoid consuming AUTO_INCREMENT on duplicates)
                        cur.execute("SELECT Color_ID FROM colors WHERE Color_Name=%s", (color,))
                        _c = cur.fetchone()
                        if _c:
                            color_id = _c['Color_ID']
                        else:
                            cur.execute("INSERT INTO colors (Color_Name) VALUES (%s)", (color,))
                            color_id = cur.lastrowid

                        # get or create size (select first to avoid consuming AUTO_INCREMENT on duplicates)
                        cur.execute("SELECT Size_ID FROM sizes WHERE Size_Name=%s", (size,))
                        _s = cur.fetchone()
                        if _s:
                            size_id = _s['Size_ID']
                        else:
                            cur.execute("INSERT INTO sizes (Size_Name) VALUES (%s)", (size,))
                            size_id = cur.lastrowid

                        # check if variant exists to avoid creating duplicates (and consuming AUTO_INCREMENT)
                        cur.execute(
                            "SELECT Variant_ID, Price, Stock FROM product_variants WHERE Product_ID=%s AND Color_ID=%s AND Size_ID=%s",
                            (product_id, color_id, size_id)
                        )
                        _v = cur.fetchone()
                        if _v:
                            variant_id = _v['Variant_ID']
                            # optionally update price/stock if values differ
                            try:
                                existing_price = _v.get('Price')
                            except Exception:
                                existing_price = None
                            try:
                                existing_stock = _v.get('Stock')
                            except Exception:
                                existing_stock = None
                            if (price is not None and price != existing_price) or (stock is not None and stock != existing_stock):
                                cur.execute(
                                    "UPDATE product_variants SET Price=%s, Stock=%s WHERE Variant_ID=%s",
                                    (price, stock, variant_id)
                                )
                            # record as existing variant
                            created_variants.append(variant_id)
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

                        # insert/update product image (table likely has UNIQUE Variant_ID)
                        imgs = v.get('images') or v.get('image_url')
                        if imgs:
                            if isinstance(imgs, str):
                                imgs = [imgs]
                            # choose the first image when only one row per Variant is allowed
                            url = imgs[0]
                            cur.execute("SELECT Image_ID FROM product_images WHERE Variant_ID=%s", (variant_id,))
                            _img = cur.fetchone()
                            if _img:
                                cur.execute("UPDATE product_images SET Image_URL=%s WHERE Variant_ID=%s", (url, variant_id))
                                created_images.append(_img['Image_ID'])
                            else:
                                cur.execute("INSERT INTO product_images (Variant_ID, Image_URL) VALUES (%s,%s)", (variant_id, url))
                                created_images.append(cur.lastrowid)

                except IntegrityError:
                    conn.rollback()
                    return jsonify({"error": "one or more variants conflict (duplicate)"}), 400
                except ValueError as e:
                    conn.rollback()
                    return jsonify({"error": str(e)}), 400

            conn.commit()

        if exists:
            return jsonify({"message": "product already exists", "Product_ID": product_id, "created_variants": created_variants, "created_images": created_images})
        else:
            return jsonify({"message": "product created", "Product_ID": product_id, "created_variants": created_variants, "created_images": created_images})

    finally:
        conn.close()
# -------------------------
# CREATE variants
# -------------------------
@products_bp.route('/products/<int:product_id>/variants', methods=['POST'])
def add_variant(product_id):
    data = request.json or {}

    color = data.get('color')
    size = data.get('size')
    price = data.get('price')
    stock = data.get('stock')

    if not all([color, size, price is not None, stock is not None]):
        return jsonify({"error": "color, size, price and stock are required"}), 400

    conn = get_db_connection()

    try:
        with conn.cursor() as cur:
            # ensure product exists
            cur.execute("SELECT Product_ID FROM products WHERE Product_ID=%s", (product_id,))
            if not cur.fetchone():
                return jsonify({"error": "Product not found"}), 404

            # get or create color (select first to avoid consuming AUTO_INCREMENT on duplicates)
            cur.execute("SELECT Color_ID FROM colors WHERE Color_Name=%s", (color,))
            _c = cur.fetchone()
            if _c:
                color_id = _c['Color_ID']
            else:
                cur.execute("INSERT INTO colors (Color_Name) VALUES (%s)", (color,))
                color_id = cur.lastrowid

            # get or create size (select first to avoid consuming AUTO_INCREMENT on duplicates)
            cur.execute("SELECT Size_ID FROM sizes WHERE Size_Name=%s", (size,))
            _s = cur.fetchone()
            if _s:
                size_id = _s['Size_ID']
            else:
                cur.execute("INSERT INTO sizes (Size_Name) VALUES (%s)", (size,))
                size_id = cur.lastrowid

            # check if variant exists first to avoid duplicate and AUTO_INCREMENT consumption
            cur.execute(
                "SELECT Variant_ID, Price, Stock FROM product_variants WHERE Product_ID=%s AND Color_ID=%s AND Size_ID=%s",
                (product_id, color_id, size_id)
            )
            _v = cur.fetchone()
            if _v:
                variant_id = _v['Variant_ID']
                # update price/stock if needed
                existing_price = _v.get('Price')
                existing_stock = _v.get('Stock')
                if (price is not None and price != existing_price) or (stock is not None and stock != existing_stock):
                    cur.execute(
                        "UPDATE product_variants SET Price=%s, Stock=%s WHERE Variant_ID=%s",
                        (price, stock, variant_id)
                    )
                # return existing variant id
                conn.commit()
                return jsonify({"message": "variant already exists", "variant_id": variant_id}), 200
            else:
                try:
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
                except IntegrityError:
                    conn.rollback()
                    return jsonify({"error": "variant already exists"}), 400

                variant_id = cur.lastrowid

            # insert/update image if provided (table likely has UNIQUE Variant_ID)
            imgs = data.get('images') or data.get('image_url')
            created_image_ids = []
            if imgs:
                if isinstance(imgs, str):
                    imgs = [imgs]
                url = imgs[0]
                cur.execute("SELECT Image_ID FROM product_images WHERE Variant_ID=%s", (variant_id,))
                _img = cur.fetchone()
                if _img:
                    cur.execute("UPDATE product_images SET Image_URL=%s WHERE Variant_ID=%s", (url, variant_id))
                    created_image_ids.append(_img['Image_ID'])
                else:
                    cur.execute("INSERT INTO product_images (Variant_ID, Image_URL) VALUES (%s,%s)", (variant_id, url))
                    created_image_ids.append(cur.lastrowid)

            conn.commit()

        return jsonify({"message": "variant created", "variant_id": variant_id, "created_images": created_image_ids})

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
            img.Image_URL,
            v.Price
        FROM products p

        JOIN (
            SELECT Product_ID, MIN(Price) AS Price
            FROM product_variants
            GROUP BY Product_ID
        ) v
        ON p.Product_ID = v.Product_ID

        JOIN product_variants pv
        ON pv.Product_ID = v.Product_ID
        AND pv.Price = v.Price

        LEFT JOIN (
            SELECT Variant_ID, MIN(Image_URL) AS Image_URL
            FROM product_images
            GROUP BY Variant_ID
        ) img
        ON pv.Variant_ID = img.Variant_ID

        ORDER BY p.Product_ID DESC
        LIMIT 5
        """)

        products = cur.fetchall()

    conn.close()

    return jsonify(products)