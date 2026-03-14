import pymysql
from utils.db import get_db_connection
from services.user_service import create_user

def authenticate_user(identifier, password):
    conn = get_db_connection()
    
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cursor:
            query = """
                SELECT * FROM user
                WHERE Email = %s OR Username = %s
                LIMIT 1
            """
            cursor.execute(query, (identifier, identifier))
            user = cursor.fetchone()

        if not user:
            return None

        # ==========================================
        # ⚠️ โหมดทดสอบ: เทียบรหัสผ่านแบบตัวต่อตัว (Plain text)
        # ==========================================
        # ถ้าพาสเวิร์ดในฐานข้อมูล (พิมพ์ธรรมดา) ไม่ตรงกับที่พิมพ์มาหน้าเว็บ
        if user["Password"] != password:
            return None

        return user
        
    except Exception as e:
        print(f"Error authenticating user: {e}")
        return None
        
    finally:
        if conn:
            conn.close()

# ==========================================
# REGISTER USER (Signup)
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