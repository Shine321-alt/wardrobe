from flask import Blueprint, jsonify, request
from utils.token import verify_token
from services.user_service import get_user_by_id, update_user_profile, change_user_password

user_bp = Blueprint('user', __name__)

def get_user_id_from_request():
    token = request.cookies.get('token')
    if not token: return None
    payload = verify_token(token)
    if not payload: return None
    user_id = payload.get('user_id')
    return user_id.get('user_id') if isinstance(user_id, dict) else user_id

# GET /api/user/profile — ดึงข้อมูล user
@user_bp.route('/user/profile', methods=['GET'])
def get_profile():
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(user), 200

# PUT /api/user/profile — อัปเดตข้อมูล user
@user_bp.route('/user/profile', methods=['PUT'])
def update_profile():
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({"error": "unauthorized"}), 401

    data = request.get_json() or {}

    success = update_user_profile(
        user_id,
        firstname    = data.get('firstName'),
        lastname     = data.get('lastName'),
        birth        = data.get('dateOfBirth'),
        zip_code     = data.get('zipCode'),
        address_main = data.get('address'),
        address_alter= data.get('addressLine2'),
        city         = data.get('city'),
        state        = data.get('state'),
        phonenumber  = data.get('phone'),
    )

    if not success:
        return jsonify({"error": "Update failed"}), 500

    return jsonify({"message": "Profile updated"}), 200

# PUT /api/user/change-password — เปลี่ยนรหัสผ่าน
@user_bp.route('/user/change-password', methods=['PUT'])
def change_password():
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json() or {}
    current_password = data.get('currentPassword', '').strip()
    new_password     = data.get('newPassword', '').strip()

    if not current_password or not new_password:
        return jsonify({"message": "กรุณากรอกข้อมูลให้ครบ"}), 400

    result = change_user_password(user_id, current_password, new_password)

    if result == 'wrong_password':
        return jsonify({"message": "รหัสผ่านปัจจุบันไม่ถูกต้อง"}), 401
    if result == 'error':
        return jsonify({"message": "เกิดข้อผิดพลาด กรุณาลองใหม่"}), 500

    return jsonify({"message": "เปลี่ยนรหัสผ่านสำเร็จ"}), 200