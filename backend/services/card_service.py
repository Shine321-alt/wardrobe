from utils.db import get_db_connection

# =========================
# GET cards (เฉพาะของ user นั้น)
# =========================
def get_cards(user_id):
    conn = get_db_connection()
    cursor = conn.cursor()  # DictCursor ถูกเซ็ตใน DB_CONFIG แล้ว

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
    """, (user_id,))

    cards = cursor.fetchall()
    cursor.close()
    conn.close()

    return cards


# =========================
# ADD card (พร้อมเช็ค duplicate)
# =========================
def add_card(data):
    conn = get_db_connection()
    cursor = conn.cursor()

    # เช็ค duplicate
    cursor.execute("""
        SELECT Card_ID FROM payment_card
        WHERE Cardnumber = %s AND User_ID = %s
    """, (data.get("cardNumber"), data.get("user_id")))

    existing = cursor.fetchone()

    if existing:
        cursor.close()
        conn.close()
        raise ValueError("duplicate")

    # INSERT
    cursor.execute("""
        INSERT INTO payment_card
        (Fullname, Cardnumber, Expiry_date, CVV, User_ID)
        VALUES (%s, %s, %s, %s, %s)
    """, (
        data.get("fullName"),
        data.get("cardNumber"),
        data.get("expiry"),
        data.get("cvv"),
        data.get("user_id")
    ))

    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Card added successfully"}