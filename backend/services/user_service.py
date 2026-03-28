import pymysql
import bcrypt
from utils.db import get_db_connection 

# ==========================================
# C : CREATE (สร้างข้อมูลใหม่)
# ==========================================
def create_user(username, email, password, role='customer'):
    conn = get_db_connection()
    
    try:
        with conn.cursor() as cur:
            # ✅ hash password ก่อน insert
            hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

            cur.execute("""
                INSERT INTO user (Username, Email, Password, Role) 
                VALUES (%s, %s, %s, %s)
            """, (username, email, hashed.decode('utf-8'), role))  # decode เป็น string ก่อนเก็บ
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        return False
    finally:
        conn.close()


# ==========================================
# R : READ (ดึงข้อมูลมาอ่าน)
# ==========================================
def get_user_by_id(user_id):
    conn = get_db_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cur:
            cur.execute("""
                SELECT User_ID, Username, Email,
                       Firstname, Lastname, Birth,
                       Zip_Code, Address_Main, Address_Alter,
                       City, State, Phonenumber
                FROM user WHERE User_ID = %s
            """, (user_id,))
            return cur.fetchone()
    finally:
        conn.close()


# ==========================================
# U : UPDATE (แก้ไขข้อมูล)
# ==========================================
def update_user_profile(user_id, firstname, lastname, birth,
                        zip_code, address_main, address_alter,
                        city, state, phonenumber):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                UPDATE user
                SET Firstname     = %s,
                    Lastname      = %s,
                    Birth         = %s,
                    Zip_Code      = %s,
                    Address_Main  = %s,
                    Address_Alter = %s,
                    City          = %s,
                    State         = %s,
                    Phonenumber   = %s
                WHERE User_ID = %s
            """, (firstname, lastname, birth,
                  zip_code, address_main, address_alter,
                  city, state, phonenumber, user_id))
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"Error updating user: {e}")
        return False
    finally:
        conn.close()


def change_user_password(user_id, current_password, new_password):
    """
    เปลี่ยน Password ของ User
    - ตรวจสอบ current_password ก่อนว่าถูกต้องไหม
    - ถ้าถูกต้อง → hash new_password แล้ว update ลง DB
    Returns:
        'wrong_password'  — current password ไม่ตรง
        'error'           — เกิด error ใน DB
        True              — สำเร็จ
    """
    conn = get_db_connection()
    try:
        with conn.cursor(pymysql.cursors.DictCursor) as cur:
            # 1) ดึง hashed password ปัจจุบันจาก DB
            cur.execute(
                "SELECT Password FROM user WHERE User_ID = %s",
                (user_id,)
            )
            row = cur.fetchone()
            if not row:
                return 'error'

            stored_hash = row['Password'].encode('utf-8')

            # 2) เปรียบเทียบ current_password กับ hash ใน DB
            if not bcrypt.checkpw(current_password.encode('utf-8'), stored_hash):
                return 'wrong_password'

            # 3) Hash new_password แล้ว update
            new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
            cur.execute(
                "UPDATE user SET Password = %s WHERE User_ID = %s",
                (new_hash.decode('utf-8'), user_id)
            )

        conn.commit()
        return True

    except Exception as e:
        conn.rollback()
        print(f"Error changing password: {e}")
        return 'error'
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
            cur.execute("DELETE FROM user WHERE User_ID = %s", (user_id,))
        conn.commit()
        return True
    except Exception as e:
        conn.rollback()
        print(f"Error deleting user: {e}")
        return False
    finally:
        conn.close()