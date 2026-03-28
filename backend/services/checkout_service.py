"""
services/checkout_service.py
สร้าง BuyOrder และอัปเดต orders เมื่อ user ยืนยัน checkout
"""

# ===============================
# Import ฟังก์ชันเชื่อมต่อ Database
# ===============================

# ใช้สำหรับเชื่อมต่อกับฐานข้อมูล (MySQL หรือ DB ที่ตั้งไว้)
from utils.db import get_db_connection


# ===============================
# ฟังก์ชันหลัก: สร้าง BuyOrder (ตอน user กด checkout)
# ===============================
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

    # ===============================
    # เชื่อมต่อ database
    # ===============================
    conn = get_db_connection()

    try:
        # ใช้ context manager → ปิด cursor ให้อัตโนมัติ
        with conn.cursor() as cur:

            # ===============================
            # 1. หา Cart order ของ user
            # ===============================

            # ดึง order ที่ status = 'Cart' (ยังไม่ checkout)
            cur.execute("""
                SELECT Order_ID, Total_Price
                FROM orders
                WHERE User_ID = %s AND Status = 'Cart'
                LIMIT 1
            """, (user_id,))

            order = cur.fetchone()

            # ถ้าไม่มี cart → ไม่สามารถ checkout ได้
            if not order:
                return None  # frontend ควร redirect ไปหน้า cart

            # เก็บค่า order_id และ total_price ไว้ใช้ต่อ
            order_id    = order['Order_ID']
            total_price = order['Total_Price']

            # ===============================
            # 2. ดึงรายการสินค้า + ตรวจสอบ stock
            # ===============================

            # JOIN หลายตารางเพื่อเอาข้อมูลครบ:
            # - order_items → จำนวนสินค้า
            # - product_variants → stock
            # - products → ชื่อสินค้า
            # - sizes → size
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

            # ===============================
            # เช็ค stock ว่าพอหรือไม่
            # ===============================
            out_of_stock = []

            for item in items:
                # ถ้าจำนวนที่สั่ง > stock ที่มี
                if item['Quantity'] > item['Stock']:
                    out_of_stock.append(
                        f"{item['Product_Name']} (Size {item['Size_Name']}): "
                        f"requested {item['Quantity']}, available {item['Stock']}"
                    )

            # ถ้ามีสินค้าสต็อกไม่พอ → throw error
            if out_of_stock:
                raise ValueError(
                    "Insufficient stock for: " + "; ".join(out_of_stock)
                )

            # ===============================
            # เช็คว่ามีการใช้บัตรหรือไม่
            # ===============================
            has_card = bool(card_data.get('cardnumber'))

            # ===============================
            # 3. INSERT BuyOrder
            # ===============================

            # กรณีมีบัตร
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
                    'Pending'  # สถานะเริ่มต้นหลัง checkout
                ))

            # กรณีไม่มีบัตร (เช่นเก็บเงินปลายทาง)
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

            # lastrowid = id ของ BuyOrder ที่เพิ่ง insert
            bos_id = cur.lastrowid

            # ===============================
            # 4. อัปเดต status ของ order
            # ===============================

            cur.execute("""
                UPDATE orders
                SET Status = 'Pending'
                WHERE Order_ID = %s
            """, (order_id,))

            # ===============================
            # 5. ลด stock ของสินค้า
            # ===============================

            for item in items:
                cur.execute("""
                    UPDATE product_variants
                    SET Stock = Stock - %s
                    WHERE Variant_ID = %s
                """, (item['Quantity'], item['Variant_ID']))

            # ===============================
            # 6. บันทึกบัตร (ถ้า user เลือก save)
            # ===============================

            if has_card and card_data.get('save_card'):

                # เช็คว่าบัตรนี้มีใน DB แล้วหรือยัง
                cur.execute("""
                    SELECT Card_ID FROM payment_card
                    WHERE Cardnumber = %s AND User_ID = %s
                """, (card_data['cardnumber'], user_id))

                # ถ้ายังไม่มี → insert ใหม่
                if not cur.fetchone():
                    cur.execute("""
                        INSERT INTO payment_card (Fullname, Cardnumber, Expiry_date, CVV, User_ID)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (
                        f"{delivery_data.get('firstname','')} {delivery_data.get('lastname','')}".strip(),
                        card_data['cardnumber'],
                        card_data['expired'],
                        card_data['cvv'],
                        user_id,
                    ))

        # commit = ยืนยัน transaction ทั้งหมด
        conn.commit()

        # return id กลับไปให้ frontend
        return {'bos_id': bos_id, 'order_id': order_id}

    # ===============================
    # Error handling
    # ===============================

    except ValueError:
        # rollback = ย้อนกลับ ถ้า stock ไม่พอ
        conn.rollback()
        raise

    except Exception as e:
        # rollback ถ้ามี error อื่น ๆ
        conn.rollback()
        print(f"[checkout_service] Error: {e}")
        raise

    finally:
        # ปิด connection เสมอ
        conn.close()


# ===============================
# ดึง order ทั้งหมดของ user (ไม่รวม cart)
# ===============================
def get_orders_by_user(user_id):
    """
    ดึง order ทั้งหมดของ user (ยกเว้น Status='Cart')
    สำหรับ MyPurchasesTab
    """

    conn = get_db_connection()

    try:
        with conn.cursor() as cur:

            # ดึงข้อมูล order + join BuyOrder เพื่อเอาที่อยู่
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

            # return list ของ orders ทั้งหมด
            return cur.fetchall()

    finally:
        # ปิด connection
        conn.close()