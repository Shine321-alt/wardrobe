# ===============================
# Import Libraries
# ===============================

# Blueprint ใช้สำหรับแยก route ออกจาก server หลัก
from flask import Blueprint, request, jsonify, make_response

# import service ตรวจสอบ user
from services.auth_service import authenticate_user

# import function สร้าง JWT token และ verify token
from utils.token import generate_token, verify_token


# ===============================
# สร้าง Blueprint
# ===============================
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


    # ดึง identifier และ password
    identifier = data.get("identifier")
    password = data.get("password")


    # ตรวจสอบข้อมูล
    if not identifier or not password:
        return jsonify({
            "error": "Identifier and password are required"
        }), 400


    # เรียก service เพื่อตรวจสอบ user
    user = authenticate_user(identifier, password)


    # ถ้า user ไม่ถูกต้อง
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401


    # ===============================
    # สร้าง JWT token
    # ===============================
    token = generate_token(user["User_ID"])


    # ===============================
    # สร้าง response
    # ===============================
    response = make_response(jsonify({
        "message": "Login successful",
        "user": {
            "id": user["User_ID"],  
            "email": user["Email"]   
        }
    }))


    # ===============================
    # เก็บ token ใน cookie
    # ===============================
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
# ใช้สำหรับดึงข้อมูล user ที่ login อยู่ โดยตรวจสอบ token จาก cookie
@auth_bp.route("/me", methods=["GET"])
def get_current_user():

    # ===============================
    # ดึง token จาก cookie
    # ===============================
    token = request.cookies.get("token")

    # ถ้าไม่มี token
    if not token:
        return jsonify({"error": "Token not found"}), 401

    # ===============================
    # ตรวจสอบ token ว่าถูกต้องหรือไม่
    # ===============================
    payload = verify_token(token)

    # ถ้า token ไม่ถูกต้อง (หมดอายุ หรือ invalid)
    if not payload:
        return jsonify({"error": "Invalid or expired token"}), 401

    # ===============================
    # ส่งข้อมูล user กลับไป (user_id ที่เก็บไว้ใน token payload)
    # ===============================
    return jsonify({
        "user_id": payload["user_id"],
        "message": "Token is valid"
    }), 200


# ===============================
# Logout API (ลบ token)
# ===============================
# Endpoint: POST /logout
# ใช้สำหรับ logout ผู้ใช้ โดยการลบ cookie ที่เก็บ token
@auth_bp.route("/logout", methods=["POST"])
def logout():

    # ===============================
    # สร้าง response
    # ===============================
    response = make_response(jsonify({
        "message": "Logout successful"
    }))

    # ===============================
    # ลบ cookie token โดยการ set max_age = 0
    # ===============================
    response.set_cookie(
        "token",
        "",
        max_age=0,
        httponly=True,
        samesite="Lax",
        secure=False
    )

    return response