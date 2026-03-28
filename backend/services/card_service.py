# =========================
# Import ฟังก์ชันเชื่อมต่อฐานข้อมูล
# =========================

# get_db_connection คือฟังก์ชันที่ใช้สร้าง connection ไปยัง database
# โดยปกติจะ return object conn ที่ใช้ query ได้
from utils.db import get_db_connection


# =========================
# GET cards (ดึงข้อมูลบัตรของ user นั้น ๆ)
# =========================
def get_cards(user_id):

    # สร้าง connection ไปยัง database
    conn = get_db_connection()

    # สร้าง cursor สำหรับ execute SQL
    # DictCursor ถูกตั้งไว้แล้ว → ทำให้ผลลัพธ์เป็น dictionary (อ่านง่าย)
    cursor = conn.cursor()

    # =========================
    # Query ข้อมูลบัตร
    # =========================

    # SELECT ข้อมูลจากตาราง payment_card
    # WHERE User_ID = %s → ดึงเฉพาะบัตรของ user คนนี้
    # ORDER BY Card_ID DESC → เอาบัตรใหม่ล่าสุดขึ้นก่อน
    cursor.execute("""
        SELECT 
            Card_ID,
            Fullname,
            Cardnumber,
            Expiry_date,
            CVV,
            User_ID
        FROM payment_card
        WHERE User_ID = %s
        ORDER BY Card_ID DESC
    """, (user_id,))  # ส่ง user_id เข้าไปแทน %s (ป้องกัน SQL injection)

    # fetchall() = ดึงข้อมูลทุกแถวที่ query ได้
    # ผลลัพธ์จะเป็น list ของ dictionary
    cards = cursor.fetchall()

    # ปิด cursor (คืน resource)
    cursor.close()

    # ปิด connection กับ database
    conn.close()

    # return ข้อมูลบัตรทั้งหมดกลับไป (ใช้ส่งต่อให้ API response)
    return cards


# =========================
# ADD card (เพิ่มบัตร + เช็ค duplicate)
# =========================
def add_card(data):

    # สร้าง connection ไปยัง database
    conn = get_db_connection()

    # สร้าง cursor สำหรับ query
    cursor = conn.cursor()

    # =========================
    # เช็ค duplicate (บัตรซ้ำ)
    # =========================

    # ตรวจสอบว่ามีบัตรเลขเดียวกันของ user คนนี้อยู่แล้วหรือไม่
    # เงื่อนไข:
    # - Cardnumber เหมือนกัน
    # - User_ID เหมือนกัน
    cursor.execute("""
        SELECT Card_ID FROM payment_card
        WHERE Cardnumber = %s AND User_ID = %s
    """, (
        data.get("cardNumber"),  # ดึง cardNumber จาก request
        data.get("user_id")      # ดึง user_id จาก request
    ))

    # fetchone() = เอาแค่ 1 แถวแรก (ถ้ามี)
    existing = cursor.fetchone()

    # =========================
    # ถ้าพบบัตรซ้ำ
    # =========================
    if existing:

        # ปิด resource ก่อน
        cursor.close()
        conn.close()

        # throw error → ให้ layer ข้างบน (controller) จัดการต่อ
        raise ValueError("duplicate")

    # =========================
    # INSERT ข้อมูลบัตรใหม่
    # =========================

    # เพิ่มข้อมูลลงในตาราง payment_card
    cursor.execute("""
        INSERT INTO payment_card
        (Fullname, Cardnumber, Expiry_date, CVV, User_ID)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        data.get("fullName"),   # ชื่อเจ้าของบัตร
        data.get("cardNumber"), # หมายเลขบัตร
        data.get("expiry"),     # วันหมดอายุ
        data.get("cvv"),        # CVV (ควรระวังเรื่อง security)
        data.get("user_id")     # user ที่เป็นเจ้าของบัตร
    ))

    # commit() = ยืนยันการเปลี่ยนแปลงใน database
    # ถ้าไม่ commit → ข้อมูลจะไม่ถูกบันทึกจริง
    conn.commit()

    # ปิด cursor และ connection
    cursor.close()
    conn.close()

    # return response กลับไปให้ API layer
    return {"message": "Card added successfully"}