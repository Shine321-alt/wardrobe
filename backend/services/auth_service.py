# ใช้สำหรับ query database
# from utils.db import get_db_connection

# ใช้ตรวจสอบ password hash
from werkzeug.security import check_password_hash


def authenticate_user(identifier, password):

    # ===============================
    # ⚠️ TEST MODE - ยังไม่มี Database
    # ===============================
    # ส่วนนี้ใช้เพื่อทดสอบว่า login flow ทำงานถูกต้องหรือไม่
    # ก่อนที่จะเชื่อมต่อกับ database จริง
    
    # Mock username และ password สำหรับทดสอบ
    TEST_USERNAME = "Toy555"
    TEST_PASSWORD = "12345678"
    
    # ตรวจสอบว่า identifier ที่ user ส่งมาตรงกับ TEST_USERNAME หรือไม่
    if identifier != TEST_USERNAME:
        return None
    
    # ตรวจสอบ password
    if password != TEST_PASSWORD:
        return None
    
    # ถ้าทั้ง username และ password ถูกต้อง → return mock user object
    mock_user = {
        "id": 1,
        "username": TEST_USERNAME,
        "email": "toy555@example.com"
    }
    
    return mock_user
    
    # ═══════════════════════════════════════════════════════════════
    # 🔔 เมื่อมี Database จริงแล้ว ให้ทำตามนี้:
    # ═══════════════════════════════════════════════════════════════
    # 
    # Step 1: ลบ TEST MODE ทั้งหมด (บรรทัด 9-34)
    #   ❌ ลบออก:
    #      - ทั้ง TEST MODE comment block
    #      - TEST_USERNAME = "Toy555"
    #      - TEST_PASSWORD = "12345678"
    #      - ทั้ง if identifier != TEST_USERNAME
    #      - ทั้ง if password != TEST_PASSWORD
    #      - ทั้ง mock_user = {...}
    #      - ทั้ง return mock_user
    #
    # Step 2: Uncomment import ที่บรรทัด 1-2
    #   ✅ เปลี่ยนจาก:
    #      # from utils.db import get_db_connection
    #   ✅ เป็น:
    #      from utils.db import get_db_connection
    #
    # Step 3: Uncomment ส่วน Database code ด้านล่าง (บรรทัด 47-75)
    #   ✅ เปลี่ยนจาก:
    #      # # เชื่อมต่อ database
    #      # conn = get_db_connection()
    #   ✅ เป็น:
    #      # เชื่อมต่อ database
    #      conn = get_db_connection()
    #   (ลบ # หนึ่งตัวในแต่ละบรรทัด)
    #
    # ═══════════════════════════════════════════════════════════════

    # # เชื่อมต่อ database
    # conn = get_db_connection()
    # cursor = conn.cursor(dictionary=True)

    # # query หา user จาก email หรือ username
    # query = """
    # SELECT * FROM users
    # WHERE email = %s OR username = %s
    # LIMIT 1
    # """

    # cursor.execute(query, (identifier, identifier))

    # user = cursor.fetchone()

    # cursor.close()
    # conn.close()


    # # ถ้าไม่พบ user
    # if not user:
    #     return None


    # # ตรวจสอบ password
    # if not check_password_hash(user["password"], password):
    #     return None


    # return user