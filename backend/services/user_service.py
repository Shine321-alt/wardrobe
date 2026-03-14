import pymysql
from utils.db import get_db_connection 
from werkzeug.security import generate_password_hash

# ==========================================
# C : CREATE (สร้างข้อมูลใหม่)
# ==========================================
def create_user(username, email, password):
    """ฟังก์ชันสำหรับสร้าง User ใหม่ลงใน Database (Create)"""
    conn = get_db_connection()
    
    # เข้ารหัสผ่านก่อนบันทึกลงฐานข้อมูล (ห้ามเก็บรหัสผ่านเป็น Text ปกติเด็ดขาด)
    hashed_password = generate_password_hash(password)
    
    try:
        with conn.cursor() as cur:
            # แก้ชื่อตารางเป็น user และแก้ชื่อคอลัมน์ให้ตรง DB
            cur.execute("""
                INSERT INTO user (Username, Email, Password) 
                VALUES (%s, %s, %s)
            """, (username, email, hashed_password))
        conn.commit()
        return True # คืนค่า True ถ้ายืนยันการสร้างสำเร็จ
    except Exception as e:
        conn.rollback()
        print(f"Error creating user: {e}")
        return False
    finally:
        conn.close()


# ==========================================
# R : READ (ดึงข้อมูลมาอ่าน)
# ==========================================
def get_user_by_id(user_id):
    """ฟังก์ชันสำหรับดึงข้อมูล User จาก Database (Read)"""
    conn = get_db_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cur: # เพิ่ม DictCursor เพื่อให้ออกมาเป็น Dictionary (อ่านง่าย)
            # แก้ id เป็น User_ID และชื่อตารางเป็น user
            cur.execute("SELECT User_ID, Username, Email FROM user WHERE User_ID = %s", (user_id,))
            user = cur.fetchone()
            return user
    finally:
        conn.close()


# ==========================================
# U : UPDATE (แก้ไขข้อมูล)
# ==========================================
def update_user_profile(user_id, username, email):
    """ฟังก์ชันสำหรับอัปเดตข้อมูล User ใน Database (Update)"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # แก้ id เป็น User_ID และชื่อตารางเป็น user
            cur.execute("""
                UPDATE user 
                SET Username = %s, Email = %s 
                WHERE User_ID = %s
            """, (username, email, user_id))
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"Error updating user: {e}")
        return False
    finally:
        conn.close()


# ==========================================
# D : DELETE (ลบข้อมูล)
# ==========================================
def delete_user(user_id):
    """ฟังก์ชันสำหรับลบบัญชี User ออกจาก Database (Delete)"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # แก้ id เป็น User_ID และชื่อตารางเป็น user
            cur.execute("DELETE FROM user WHERE User_ID = %s", (user_id,))
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"Error deleting user: {e}")
        return False
    finally:
        conn.close()