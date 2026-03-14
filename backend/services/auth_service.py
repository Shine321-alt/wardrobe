import pymysql
from utils.db import get_db_connection
# คอมเมนต์บรรทัดนี้ไว้ก่อน (เพื่อปิดการใช้งานชั่วคราว)
# from werkzeug.security import check_password_hash

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