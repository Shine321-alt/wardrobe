# ==========================================
# Blueprint สำหรับแยก route ของ auth ออกจาก app หลัก
# ==========================================
from flask import Blueprint, request, jsonify, make_response

# services
from services.auth_service import (
    authenticate_user,
    create_reset_token,
    reset_user_password
)
from services.user_service import create_user

# JWT utilities
from utils.token import generate_token, verify_token


# ==========================================
# Auth Blueprint
# ใช้รวม route เกี่ยวกับ authentication
# ==========================================
auth_bp = Blueprint("auth", __name__)


# ==========================================
# Login
# ==========================================
@auth_bp.route("/login", methods=["POST"])
def login():

    # รับข้อมูลจาก frontend
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    # identifier = email หรือ username
    identifier = data.get("identifier")
    password = data.get("password")

    if not identifier or not password:
        return jsonify({"error": "Identifier and password are required"}), 400

    # ตรวจสอบ user ใน database
    user = authenticate_user(identifier, password)
    if not user:
        return jsonify({"error": "Invalid credentials"}), 401

    # สร้าง JWT token
    token = generate_token({
        "user_id": user["User_ID"],
        "role": user["Role"]
    })

    # สร้าง response
    response = make_response(jsonify({
        "message": "Login successful",
        "user": {
            "id": user["User_ID"],
            "email": user["Email"]
        }
    }))

    # เก็บ token ใน cookie
    response.set_cookie(
        "token",
        token,
        httponly=True,   # ป้องกัน JS access
        samesite="Lax",
        secure=False     # dev mode (production ต้อง True)
    )

    return response


# ==========================================
# Check current user (session)
# ใช้ตรวจว่า user login อยู่หรือไม่
# ==========================================
@auth_bp.route("/me", methods=["GET"])
def get_current_user():

    # อ่าน token จาก cookie
    token = request.cookies.get("token")
    if not token:
        return jsonify({"error": "Token not found"}), 401

    # verify token
    payload = verify_token(token)
    if not payload:
        return jsonify({"error": "Invalid or expired token"}), 401

    # ส่ง user_id กลับ
    return jsonify({
        "user_id": payload["user_id"],
        "message": "Token is valid"
    }), 200


# ==========================================
# Logout
# ==========================================
@auth_bp.route("/logout", methods=["POST"])
def logout():

    # สร้าง response
    response = make_response(jsonify({
        "message": "Logout successful"
    }))

    # ลบ cookie token
    response.set_cookie(
        "token",
        "",
        max_age=0,
        httponly=True,
        samesite="Lax",
        secure=False
    )

    return response


# ==========================================
# Signup
# ==========================================
@auth_bp.route("/signup", methods=["POST"])
def signup():

    # รับข้อมูลจาก frontend
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    email = data.get("email")
    username = data.get("username")
    password = data.get("password")

    # ตรวจสอบว่ากรอกครบหรือไม่
    if not email or not username or not password:
        return jsonify({"error": "Email, username and password are required"}), 400

    # เรียก service เพื่อสร้าง user ใหม่
    success = create_user(username, email, password)

    if not success:
        return jsonify({"error": "User already exists"}), 400

    return jsonify({"message": "Signup successful"}), 201


# ==========================================
# Forgot Password
# ==========================================
@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():

    # รับ email จาก frontend
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    email = data.get("email")

    # สร้าง reset token
    result = create_reset_token(email)

    # ถ้าไม่พบ email ในระบบ
    if not result:
        return jsonify({"error": "Email not found"}), 404

    # ส่ง reset link กลับ (dev mode)
    return jsonify({
        "message": "Reset link generated",
        "reset_link": result
    })


# ==========================================
# Reset Password
# ==========================================
@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():

    # รับ token และ password ใหม่
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    token = data.get("token")
    password = data.get("password")

    # เรียก service เพื่อเปลี่ยน password
    success = reset_user_password(token, password)

    # token invalid หรือหมดอายุ
    if not success:
        return jsonify({"error": "Invalid or expired token"}), 400

    return jsonify({
        "message": "Password reset successful"
    })