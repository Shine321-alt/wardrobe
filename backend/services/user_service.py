# ===============================
# Import library ที่จำเป็น
# ===============================

# ใช้เชื่อมต่อ MySQL database
import pymysql

# ใช้สำหรับ hash password เพื่อความปลอดภัย
import bcrypt

# ฟังก์ชันสร้าง connection ไป database (เขียนไว้ที่ utils/db.py)
from utils.db import get_db_connection 


# ==========================================
# C : CREATE (สร้าง user ใหม่)
# ==========================================
def create_user(username, email, password, role='customer'):

    # สร้าง connection ไป database
    conn = get_db_connection()
    
    try:
        # ใช้ cursor สำหรับ execute SQL
        with conn.cursor() as cur:

            # ===============================
            # Hash password ก่อนเก็บ
            # ===============================

            # แปลง password → bytes แล้ว hash ด้วย bcrypt
            # bcrypt ทำให้ password ถูกเข้ารหัส (ไม่เก็บ plain text)
            hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

            # ===============================
            # INSERT user ใหม่ลง database
            # ===============================

            cur.execute("""
                INSERT INTO user (Username, Email, Password, Role) 
                VALUES (%s, %s, %s, %s)
            """, (
                username, 
                email, 
                hashed.decode('utf-8'),  # แปลงกลับเป็น string ก่อนเก็บ
                role
            ))

        # commit = ยืนยันการเพิ่มข้อมูล
        conn.commit()

        return True

    except Exception as e:
        # rollback = ยกเลิก transaction ถ้าเกิด error
        conn.rollback()
        return False

    finally:
        # ปิด connection เสมอ
        conn.close()


# ==========================================
# R : READ (ดึงข้อมูล user)
# ==========================================
def get_user_by_id(user_id):

    # เชื่อมต่อ database
    conn = get_db_connection()

    try:
        # ใช้ DictCursor → ทำให้ผลลัพธ์เป็น dict (อ่านง่าย เช่น row['Username'])
        with conn.cursor(pymysql.cursors.DictCursor) as cur:

            # SELECT ข้อมูล user ตาม user_id
            cur.execute("""
                SELECT User_ID, Username, Email,
                       Firstname, Lastname, Birth,
                       Zip_Code, Address_Main, Address_Alter,
                       City, State, Phonenumber
                FROM user WHERE User_ID = %s
            """, (user_id,))

            # fetchone() = เอาแค่ user คนเดียว
            return cur.fetchone()

    finally:
        # ปิด connection
        conn.close()


# ==========================================
# U : UPDATE (แก้ไข profile user)
# ==========================================
def update_user_profile(user_id, firstname, lastname, birth,
                        zip_code, address_main, address_alter,
                        city, state, phonenumber):

    # เชื่อมต่อ database
    conn = get_db_connection()

    try:
        with conn.cursor() as cur:

            # ===============================
            # UPDATE ข้อมูล profile
            # ===============================

            # อัปเดตข้อมูลส่วนตัวของ user
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
            """, (
                firstname, lastname, birth,
                zip_code, address_main, address_alter,
                city, state, phonenumber, user_id
            ))

        # commit = ยืนยันการแก้ไข
        conn.commit()

        return True

    except Exception as e:
        # rollback ถ้าเกิด error
        conn.rollback()
        print(f"Error updating user: {e}")
        return False

    finally:
        conn.close()


# ==========================================
# เปลี่ยนรหัสผ่าน (สำคัญมากด้าน security)
# ==========================================
def change_user_password(user_id, current_password, new_password):
    """
    เปลี่ยน Password ของ User

    Flow:
    1. ดึง password (hash) จาก DB
    2. ตรวจสอบว่า current_password ถูกต้องไหม
    3. ถ้าถูก → hash new_password แล้ว update

    Returns:
        'wrong_password'  — current password ไม่ตรง
        'error'           — เกิด error ใน DB
        True              — สำเร็จ
    """

    conn = get_db_connection()

    try:
        # ใช้ DictCursor เพื่อเข้าถึงข้อมูลแบบ dict
        with conn.cursor(pymysql.cursors.DictCursor) as cur:

            # ===============================
            # 1. ดึง password จาก DB
            # ===============================

            cur.execute(
                "SELECT Password FROM user WHERE User_ID = %s",
                (user_id,)
            )

            row = cur.fetchone()

            # ถ้าไม่เจอ user → error
            if not row:
                return 'error'

            # แปลง hash จาก string → bytes เพื่อใช้กับ bcrypt
            stored_hash = row['Password'].encode('utf-8')

            # ===============================
            # 2. ตรวจสอบ password ปัจจุบัน
            # ===============================

            # bcrypt.checkpw → เทียบ password ที่ user ใส่ กับ hash ใน DB
            if not bcrypt.checkpw(current_password.encode('utf-8'), stored_hash):
                return 'wrong_password'

            # ===============================
            # 3. hash password ใหม่ แล้ว update
            # ===============================

            new_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())

            cur.execute(
                "UPDATE user SET Password = %s WHERE User_ID = %s",
                (new_hash.decode('utf-8'), user_id)
            )

        # commit การเปลี่ยนแปลง
        conn.commit()

        return True

    except Exception as e:
        # rollback ถ้ามี error
        conn.rollback()
        print(f"Error changing password: {e}")
        return 'error'

    finally:
        conn.close()


# ==========================================
# D : DELETE (ลบ user)
# ==========================================
def delete_user(user_id):
    """ฟังก์ชันสำหรับลบบัญชี User ออกจาก Database (Delete)"""

    conn = get_db_connection()

    try:
        with conn.cursor() as cur:

            # ลบ user ตาม user_id
            cur.execute(
                "DELETE FROM user WHERE User_ID = %s", 
                (user_id,)
            )

        # commit การลบ
        conn.commit()

        return True

    except Exception as e:
        # rollback ถ้ามี error
        conn.rollback()
        print(f"Error deleting user: {e}")
        return False

    finally:
        # ปิด connection
        conn.close()