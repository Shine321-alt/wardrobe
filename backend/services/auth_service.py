import os

import pymysql
import secrets
import bcrypt
from datetime import datetime, timedelta

from utils.db import get_db_connection
from services.user_service import create_user

# ==========================================
# Authenticate user (Login)
# ==========================================
def authenticate_user(identifier, password):

    conn = get_db_connection()

    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:

            # หา user จาก email หรือ username
            query = """
                SELECT * FROM user
                WHERE Email = %s OR Username = %s
                LIMIT 1
            """
            cursor.execute(query, (identifier, identifier))
            user = cursor.fetchone()

        if not user:
            return None

        # ตรวจสอบ password ด้วย bcrypt
        if not bcrypt.checkpw(password.encode('utf-8'), user["Password"].encode('utf-8')):
            return None

        return user

    except Exception as e:
        print(f"Error authenticating user: {e}")
        return None

    finally:
        if conn:
            conn.close()


# ==========================================
# Register user (Signup)
# ==========================================
def register_user(username, email, password):

    # เรียก create_user จาก user_service
    success = create_user(username, email, password)

    if not success:
        return None

    return {
        "username": username,
        "email": email
    }


# ==========================================
# Create password reset token
# ==========================================
def create_reset_token(email):

    conn = get_db_connection()

    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:

            # หา user จาก email
            cursor.execute(
                "SELECT User_ID FROM user WHERE Email=%s",
                (email,)
            )
            user = cursor.fetchone()

            if not user:
                return None

            # สร้าง token และกำหนดเวลา expire
            token = secrets.token_urlsafe(32)
            expiry = datetime.utcnow() + timedelta(hours=1)

            # บันทึก token ลง database
            cursor.execute("""
                INSERT INTO Password_Reset_Tokens (user_id, token, expiry)
                VALUES (%s, %s, %s)
            """, (user["User_ID"], token, expiry))

            conn.commit()

            # ส่ง reset link กลับ
            return f"https://wardrobe-backend-fj3r.onrender.com/reset-password/{token}"

    finally:
        conn.close()


# ==========================================
# Reset user password
# ==========================================
def reset_user_password(token, password):

    # เชื่อมต่อ database
    conn = get_db_connection()

    try:
        # ใช้ DictCursor เพื่อให้ดึงข้อมูลเป็น dictionary
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:

            # ==========================================
            # ค้นหา token ในตาราง Password_Reset_Tokens
            # ==========================================
            cursor.execute("""
                SELECT user_id, expiry
                FROM Password_Reset_Tokens
                WHERE token=%s
            """, (token,))
            record = cursor.fetchone()

            # ถ้าไม่พบ token ใน database
            if not record:
                print("TOKEN NOT FOUND")
                return False

            # ==========================================
            # ตรวจสอบว่า token หมดอายุหรือยัง
            # ==========================================
            if datetime.utcnow() > record["expiry"]:
                return False

            hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())


            # ==========================================
            # อัปเดตรหัสผ่านใหม่ในตาราง user
            # ==========================================
            cursor.execute("""
                UPDATE user
                SET Password=%s
                WHERE User_ID=%s
            """, (hashed.decode('utf-8'), record["user_id"]))

            # ==========================================
            # ลบ token หลังจากใช้งานเสร็จ
            # เพื่อป้องกันการใช้ซ้ำ
            # ==========================================
            cursor.execute("""
                DELETE FROM Password_Reset_Tokens
                WHERE token=%s
            """, (token,))

            # บันทึกการเปลี่ยนแปลงลง database
            conn.commit()

            # ส่งค่า True กลับเพื่อบอกว่า reset สำเร็จ
            return True

    finally:
        # ปิดการเชื่อมต่อ database
        conn.close()