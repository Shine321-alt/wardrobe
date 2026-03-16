from flask import Blueprint, jsonify, request
import os
from utils.token import verify_token   # ใช้ฟังก์ชันเดียวกับ auth.py
from services.cart_service import (
    get_user_cart,
    add_to_cart,
    update_cart_quantity,
    delete_cart_item
)

cart_bp = Blueprint("cart", __name__)


def get_user_id_from_cookie():
    """
    Helper: อ่าน token จาก httpOnly Cookie
    (ระบบ Login เก็บ token ไว้ใน cookie ไม่ใช่ localStorage)
    คืนค่า (user_id, None) ถ้าสำเร็จ
    คืนค่า (None, error_response) ถ้าไม่ผ่าน
    """
    token = request.cookies.get("token")
    
    if not token:
        return None, (jsonify({"error": "Unauthorized: Please login first"}), 401)

    payload = verify_token(token)

    if not payload:
        return None, (jsonify({"error": "Unauthorized: Invalid or expired token"}), 401)

    return payload.get("user_id"), None


# ─────────────────────────────────────────
# GET /api/cart  — ดูตะกร้าของ User
# ─────────────────────────────────────────
@cart_bp.route("/cart", methods=["GET"])
def view_cart():
    user_id, err = get_user_id_from_cookie()
    if err:
        return err

    cart_items  = get_user_cart(user_id)
    total_price = sum(
        item['Price'] * item['Quantity']
        for item in cart_items
        if item.get('Price') and item.get('Quantity')
    )

    return jsonify({
        "status":      "success",
        "total_items": len(cart_items),
        "total_price": total_price,
        "cart":        cart_items
    }), 200


# ─────────────────────────────────────────
# POST /api/cart  — เพิ่มสินค้าเข้าตะกร้า
# Body: { "variant_id": 1, "quantity": 1 }
# ─────────────────────────────────────────
@cart_bp.route("/cart", methods=["POST"])
def add_item():
    user_id, err = get_user_id_from_cookie()
    if err:
        return err

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    variant_id = data.get("variant_id")
    quantity   = data.get("quantity", 1)

    if not variant_id:
        return jsonify({"error": "variant_id is required"}), 400

    result = add_to_cart(user_id, variant_id, quantity)
    return jsonify(result), 200 if result["status"] == "success" else 400


# ─────────────────────────────────────────
# PATCH /api/cart/<cart_id>  — อัพเดทจำนวน
# Body: { "quantity": 2 }
# ─────────────────────────────────────────
@cart_bp.route("/cart/<int:cart_id>", methods=["PATCH"])
def update_item(cart_id):
    user_id, err = get_user_id_from_cookie()
    if err:
        return err

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    quantity = data.get("quantity")
    if quantity is None or quantity < 1:
        return jsonify({"error": "quantity must be >= 1"}), 400

    result = update_cart_quantity(cart_id, user_id, quantity)
    return jsonify(result), 200 if result["status"] == "success" else 400


# ─────────────────────────────────────────
# DELETE /api/cart/<cart_id>  — ลบสินค้า
# ─────────────────────────────────────────
@cart_bp.route("/cart/<int:cart_id>", methods=["DELETE"])
def delete_item(cart_id):
    user_id, err = get_user_id_from_cookie()
    if err:
        return err

    result = delete_cart_item(cart_id, user_id)
    return jsonify(result), 200 if result["status"] == "success" else 400
