"""
services/checkout_service.py
สร้าง BuyOrder และอัปเดต orders เมื่อ user ยืนยัน checkout
"""
from utils.db import get_db_connection


def create_buyorder(user_id, delivery_data, card_data):
    """
    ขั้นตอน:
    1. หา Order ที่เป็น Status='Cart' ของ user
    2. ตรวจสอบ stock ว่าเพียงพอทุก item ก่อน
    3. บันทึกข้อมูลลง BuyOrder (แยกกรณีมีบัตร/ไม่มีบัตร)
    4. เปลี่ยน Status ของ orders จาก 'Cart' → 'Pending'
    5. ลด Stock ใน product_variants ตาม quantity ที่สั่ง
    6. บันทึก card ลง payment_card ถ้า save_card=True

    Returns:
        dict { 'bos_id': int, 'order_id': int }  — สำเร็จ
        None  — ไม่พบ Cart order
        raises ValueError  — stock ไม่พอ
        raises Exception   — เกิด error ใน DB
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:

            # ── 1. หา Cart order ของ user ──────────────────────────────────
            cur.execute("""
                SELECT Order_ID, Total_Price
                FROM orders
                WHERE User_ID = %s AND Status = 'Cart'
                LIMIT 1
            """, (user_id,))
            order = cur.fetchone()

            if not order:
                return None  # ไม่มี cart → frontend ควร redirect ไป /cart

            order_id    = order['Order_ID']
            total_price = order['Total_Price']

            # ── 2. ดึง items และตรวจสอบ stock ────────────────────────────
            cur.execute("""
                SELECT
                    oi.Order_Item_ID,
                    oi.Variant_ID,
                    oi.Quantity,
                    pv.Stock,
                    p.Product_Name,
                    s.Size_Name
                FROM order_items oi
                JOIN product_variants pv ON oi.Variant_ID = pv.Variant_ID
                JOIN products p ON pv.Product_ID = p.Product_ID
                JOIN sizes s ON pv.Size_ID = s.Size_ID
                WHERE oi.Order_ID = %s
            """, (order_id,))
            items = cur.fetchall()

            # ตรวจสอบว่า stock พอทุก item
            out_of_stock = []
            for item in items:
                if item['Quantity'] > item['Stock']:
                    out_of_stock.append(
                        f"{item['Product_Name']} (Size {item['Size_Name']}): "
                        f"requested {item['Quantity']}, available {item['Stock']}"
                    )

            if out_of_stock:
                raise ValueError(
                    "Insufficient stock for: " + "; ".join(out_of_stock)
                )

            has_card = bool(card_data.get('cardnumber'))

            # ── 3. INSERT ลง BuyOrder ─────────────────────────────────────
            if has_card:
                cur.execute("""
                    INSERT INTO BuyOrder (
                        Firstname, Lastname, Address_Desc,
                        Town, Postcode, Country, Phonenumber,
                        Order_ID, Cardnumber, Expired, CVV,
                        User_ID, Status
                    ) VALUES (
                        %s, %s, %s,
                        %s, %s, %s, %s,
                        %s, %s, %s, %s,
                        %s, %s
                    )
                """, (
                    delivery_data.get('firstname', ''),
                    delivery_data.get('lastname', ''),
                    delivery_data.get('address_desc', ''),
                    delivery_data.get('town', ''),
                    delivery_data.get('postcode', ''),
                    delivery_data.get('country', ''),
                    delivery_data.get('phonenumber', ''),
                    order_id,
                    card_data.get('cardnumber') or None,
                    card_data.get('expired') or None,
                    card_data.get('cvv') or None,
                    user_id,
                    'Pending'
                ))
            else:
                cur.execute("""
                    INSERT INTO BuyOrder (
                        Firstname, Lastname, Address_Desc,
                        Town, Postcode, Country, Phonenumber,
                        Order_ID, User_ID, Status
                    ) VALUES (
                        %s, %s, %s,
                        %s, %s, %s, %s,
                        %s, %s, %s
                    )
                """, (
                    delivery_data.get('firstname', ''),
                    delivery_data.get('lastname', ''),
                    delivery_data.get('address_desc', ''),
                    delivery_data.get('town', ''),
                    delivery_data.get('postcode', ''),
                    delivery_data.get('country', ''),
                    delivery_data.get('phonenumber', ''),
                    order_id,
                    user_id,
                    'Pending'
                ))

            bos_id = cur.lastrowid

            # ── 4. เปลี่ยน Status orders → 'Pending' ─────────────────────
            cur.execute("""
                UPDATE orders
                SET Status = 'Pending'
                WHERE Order_ID = %s
            """, (order_id,))

            # ── 5. ลด Stock ใน product_variants ──────────────────────────
            for item in items:
                cur.execute("""
                    UPDATE product_variants
                    SET Stock = Stock - %s
                    WHERE Variant_ID = %s
                """, (item['Quantity'], item['Variant_ID']))

            # ── 6. Save card ถ้า user เลือก ───────────────────────────────
            if has_card and card_data.get('save_card'):
                cur.execute("""
                    SELECT Card_ID FROM payment_card
                    WHERE Cardnumber = %s AND User_ID = %s
                """, (card_data['cardnumber'], user_id))

                if not cur.fetchone():
                    cur.execute("""
                        INSERT INTO payment_card (Fullname, Cardnumber, Expiry_date, CVV, User_ID)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (
                        f"{delivery_data.get('firstname','')} {delivery_data.get('lastname','')}" .strip(),
                        card_data['cardnumber'],
                        card_data['expired'],
                        card_data['cvv'],
                        user_id,
                    ))

        conn.commit()
        return {'bos_id': bos_id, 'order_id': order_id}

    except ValueError:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        print(f"[checkout_service] Error: {e}")
        raise
    finally:
        conn.close()


def get_orders_by_user(user_id):
    """
    ดึง order ทั้งหมดของ user (ยกเว้น Status='Cart')
    สำหรับ MyPurchasesTab
    """
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT
                    o.Order_ID        AS id,
                    o.Total_Price     AS total,
                    o.Status          AS status,
                    o.Created_At      AS date,
                    b.BOS_ID,
                    b.Firstname,
                    b.Lastname,
                    b.Address_Desc,
                    b.Town,
                    b.Postcode,
                    b.Country,
                    b.Phonenumber
                FROM orders o
                LEFT JOIN BuyOrder b ON o.Order_ID = b.Order_ID
                WHERE o.User_ID = %s
                  AND o.Status != 'Cart'
                ORDER BY o.Created_At DESC
            """, (user_id,))
            return cur.fetchall()
    finally:
        conn.close()