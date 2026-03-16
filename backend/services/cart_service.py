from utils.db import get_db_connection


def get_user_cart(user_id):
    """ดึงข้อมูลสินค้าทั้งหมดในตะกร้าของ User"""
    conn = get_db_connection()
    if not conn:
        return []

    try:
        with conn.cursor() as cur:
            sql = """
                SELECT
                    c.Cart_ID,
                    c.Quantity,
                    v.Variant_ID,
                    v.Price,
                    v.Stock,
                    p.Product_ID,
                    p.Product_Name,
                    p.Category,
                    col.Color_Name,
                    s.Size_Name,
                    (SELECT Image_URL FROM product_images
                     WHERE Variant_ID = v.Variant_ID LIMIT 1) AS Image_URL
                FROM cart c
                JOIN product_variants v  ON c.Variant_ID  = v.Variant_ID
                JOIN products p          ON v.Product_ID  = p.Product_ID
                LEFT JOIN colors col     ON v.Color_ID    = col.Color_ID
                LEFT JOIN sizes s        ON v.Size_ID     = s.Size_ID
                WHERE c.User_ID = %s
            """
            cur.execute(sql, (user_id,))
            return cur.fetchall()
    except Exception as e:
        print(f"Error fetching user cart: {e}")
        return []
    finally:
        conn.close()


def add_to_cart(user_id, variant_id, quantity=1):
    """
    เพิ่มสินค้าเข้าตะกร้า
    - ถ้ามีอยู่แล้ว → บวก quantity เพิ่ม
    - ถ้ายังไม่มี   → INSERT แถวใหม่
    """
    conn = get_db_connection()
    if not conn:
        return {"status": "error", "message": "Database connection failed"}

    try:
        with conn.cursor() as cur:
            # เช็คว่า variant นี้มีอยู่ในตะกร้าของ user แล้วหรือยัง
            cur.execute(
                "SELECT Cart_ID, Quantity FROM cart WHERE User_ID = %s AND Variant_ID = %s",
                (user_id, variant_id)
            )
            existing = cur.fetchone()

            if existing:
                # มีอยู่แล้ว → บวก quantity
                new_qty = existing['Quantity'] + quantity
                cur.execute(
                    "UPDATE cart SET Quantity = %s WHERE Cart_ID = %s",
                    (new_qty, existing['Cart_ID'])
                )
            else:
                # ยังไม่มี → insert ใหม่
                cur.execute(
                    "INSERT INTO cart (User_ID, Variant_ID, Quantity) VALUES (%s, %s, %s)",
                    (user_id, variant_id, quantity)
                )

        conn.commit()
        return {"status": "success", "message": "Item added to cart"}
    except Exception as e:
        conn.rollback()
        print(f"Error adding to cart: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()


def update_cart_quantity(cart_id, user_id, quantity):
    """
    อัพเดทจำนวนสินค้าใน cart
    - ตรวจสอบว่า cart_id นั้นเป็นของ user_id จริงๆ ด้วย
    """
    conn = get_db_connection()
    if not conn:
        return {"status": "error", "message": "Database connection failed"}

    try:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE cart SET Quantity = %s WHERE Cart_ID = %s AND User_ID = %s",
                (quantity, cart_id, user_id)
            )
            if cur.rowcount == 0:
                return {"status": "error", "message": "Cart item not found or unauthorized"}

        conn.commit()
        return {"status": "success", "message": "Quantity updated"}
    except Exception as e:
        conn.rollback()
        print(f"Error updating cart: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()


def delete_cart_item(cart_id, user_id):
    """
    ลบสินค้าออกจากตะกร้า
    - ตรวจสอบว่า cart_id นั้นเป็นของ user_id จริงๆ ด้วย
    """
    conn = get_db_connection()
    if not conn:
        return {"status": "error", "message": "Database connection failed"}

    try:
        with conn.cursor() as cur:
            cur.execute(
                "DELETE FROM cart WHERE Cart_ID = %s AND User_ID = %s",
                (cart_id, user_id)
            )
            if cur.rowcount == 0:
                return {"status": "error", "message": "Cart item not found or unauthorized"}

        conn.commit()
        return {"status": "success", "message": "Item removed from cart"}
    except Exception as e:
        conn.rollback()
        print(f"Error deleting cart item: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        conn.close()
