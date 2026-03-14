# Blueprint ใช้สำหรับแยก route ออกจาก server หลัก
from flask import Blueprint, request, jsonify, make_response

# import service สำหรับตรวจสอบ user ตอน login
from services.auth_service import authenticate_user

# import service สำหรับสร้าง user ใหม่ (signup)
from services.user_service import create_user

# import function สำหรับสร้างและตรวจสอบ JWT token
from utils.token import generate_token, verify_token


# ===============================
# สร้าง Blueprint
# ===============================
# ใช้ Blueprint เพื่อแยก module auth ออกจาก app หลัก
auth_bp = Blueprint("auth", __name__)


# ===============================
# Login API
# ===============================
# Endpoint: POST /login
@auth_bp.route("/login", methods=["POST"])
def login():

    # รับข้อมูล JSON จาก request
    data = request.get_json()

    # ตรวจสอบว่ามี JSON ส่งมาหรือไม่
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    # ดึง identifier และ password จาก request
    # identifier สามารถเป็น email หรือ username ได้
    identifier = data.get("identifier")
    password = data.get("password")

    # ตรวจสอบว่ามีข้อมูลครบหรือไม่
    if not identifier or not password:
        return jsonify({
            "error": "Identifier and password are required"
        }), 400

    # เรียก service เพื่อตรวจสอบข้อมูล user จาก database
    user = authenticate_user(identifier, password)

    # ถ้า user ไม่ถูกต้อง (login ไม่ผ่าน)
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401


    # ===============================
    # สร้าง JWT token
    # ===============================
    # เก็บ user_id และ role ลงใน token
    token = generate_token({
        "user_id": user["User_ID"],
        "role": user["Role"]
    })


    # ===============================
    # สร้าง response กลับไป frontend
    # ===============================
    response = make_response(jsonify({
        "message": "Login successful",
        "user": {
            "id": user["User_ID"],
            "email": user["Email"]
        }
    }))


    # ===============================
    # เก็บ token ลงใน cookie
    # ===============================
    # httponly = ป้องกัน javascript access cookie
    # samesite = ป้องกัน CSRF บางส่วน
    response.set_cookie(
        "token",
        token,
        httponly=True,
        samesite="Lax",
        secure=False
    )

    return response


# ===============================
# Get Current User API (ตรวจสอบ session)
# ===============================
# Endpoint: GET /me
# ใช้ตรวจสอบว่าผู้ใช้ login อยู่หรือไม่
@auth_bp.route("/me", methods=["GET"])
def get_current_user():

    # ดึง token จาก cookie
    token = request.cookies.get("token")

    # ถ้าไม่มี token แสดงว่ายังไม่ได้ login
    if not token:
        return jsonify({"error": "Token not found"}), 401

    # ตรวจสอบ token
    payload = verify_token(token)

    # ถ้า token หมดอายุหรือไม่ถูกต้อง
    if not payload:
        return jsonify({"error": "Invalid or expired token"}), 401

    # ส่งข้อมูล user_id ที่อยู่ใน token กลับไป
    return jsonify({
        "user_id": payload["user_id"],
        "message": "Token is valid"
    }), 200


# ===============================
# Logout API
# ===============================
# Endpoint: POST /logout
# ใช้สำหรับ logout โดยลบ cookie token
@auth_bp.route("/logout", methods=["POST"])
def logout():

    # สร้าง response
    response = make_response(jsonify({
        "message": "Logout successful"
    }))

    # ลบ cookie โดยตั้งค่า max_age = 0
    response.set_cookie(
        "token",
        "",
        max_age=0,
        httponly=True,
        samesite="Lax",
        secure=False
    )

    return response


# ===============================
# Signup API
# ===============================
# Endpoint: POST /signup
# ใช้สำหรับสมัครสมาชิกใหม่
@auth_bp.route("/signup", methods=["POST"])
def signup():

    # รับข้อมูล JSON จาก frontend
    data = request.get_json()

    # ถ้า request ไม่มีข้อมูล
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    # ดึงข้อมูลจาก request
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")

    # ตรวจสอบว่ามีข้อมูลครบหรือไม่
    if not email or not username or not password:
        return jsonify({
            "error": "Email, username and password are required"
        }), 400

    # เรียก user_service เพื่อสร้าง user ใหม่ใน database
    success = create_user(username, email, password)

    # ถ้า create ไม่สำเร็จ (เช่น user ซ้ำ)
    if not success:
        return jsonify({
            "error": "User already exists"
        }), 400

    # สมัครสำเร็จ
    return jsonify({
        "message": "Signup successful"
    }), 201