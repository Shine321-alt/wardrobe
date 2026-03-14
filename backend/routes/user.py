from flask import Blueprint, request, jsonify
from services.user_service import get_user_by_id, update_user_profile
from utils.token import verify_token

user_bp = Blueprint("user", __name__)

# Endpoint สำหรับดูโปรไฟล์ตัวเอง (GET /profile)
@user_bp.route("/profile", methods=["GET"])
def get_profile():

    token = request.cookies.get("token")
    if not token:
        return jsonify({"error": "Unauthorized"}), 401
    
    payload = verify_token(token)
    if not payload:
        return jsonify({"error": "Invalid token"}), 401

    user_id = payload["user_id"]

    # 2. เรียกใช้ Service เพื่อดึงข้อมูลจาก DB !!! 👈 ตรงนี้แหละครับ !!!
    user_data = get_user_by_id(user_id)
    
    if not user_data:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user_data}), 200