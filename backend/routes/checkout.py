"""
routes/checkout.py
POST /api/checkout  — ยืนยันคำสั่งซื้อ (สร้าง BuyOrder)
GET  /api/orders    — ดึง order ของ user สำหรับ MyPurchasesTab
"""

from flask import Blueprint, jsonify, request
from utils.token import verify_token
from services.checkout_service import create_buyorder, get_orders_by_user

checkout_bp = Blueprint('checkout', __name__)


def get_user_id_from_request():
    token = request.cookies.get('token')
    if not token:
        return None
    payload = verify_token(token)
    if not payload:
        return None
    user_id = payload.get('user_id')
    return user_id.get('user_id') if isinstance(user_id, dict) else user_id


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/checkout
# ─────────────────────────────────────────────────────────────────────────────
@checkout_bp.route('/checkout', methods=['POST'])
def place_order():
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401

    data = request.get_json() or {}

    delivery_data = {
        'firstname':    data.get('firstname', '').strip(),
        'lastname':     data.get('lastname', '').strip(),
        'address_desc': data.get('address_desc', '').strip(),
        'town':         data.get('town', '').strip(),
        'postcode':     data.get('postcode', '').strip(),
        'country':      data.get('country', '').strip(),
        'phonenumber':  data.get('phonenumber', '').strip(),
    }

    card_data = {
        'cardnumber': data.get('cardnumber', '').replace(' ', ''),
        'expired':    data.get('expired', ''),
        'cvv':        data.get('cvv', ''),
        'save_card':  data.get('save_card', False),
    }

    required_delivery = ['firstname', 'lastname', 'address_desc', 'town', 'postcode', 'country', 'phonenumber']
    missing = [k for k in required_delivery if not delivery_data[k]]
    if missing:
        return jsonify({'message': f'Missing fields: {", ".join(missing)}'}), 400

    try:
        result = create_buyorder(user_id, delivery_data, card_data)

        if result is None:
            return jsonify({'message': 'No active cart found. Please add items to your cart first.'}), 404

        return jsonify({
            'message':  'Order placed successfully',
            'order_id': result['order_id'],
            'bos_id':   result['bos_id'],
        }), 201

    except ValueError as e:
        # stock ไม่เพียงพอ
        return jsonify({'message': str(e)}), 409

    except Exception as e:
        print(f'[POST /checkout] Error: {e}')
        return jsonify({'message': 'Failed to place order. Please try again.'}), 500


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/orders
# ─────────────────────────────────────────────────────────────────────────────
@checkout_bp.route('/orders', methods=['GET'])
def get_orders():
    user_id = get_user_id_from_request()
    if not user_id:
        return jsonify({'message': 'Unauthorized'}), 401

    try:
        orders = get_orders_by_user(user_id)
        return jsonify(orders), 200
    except Exception as e:
        print(f'[GET /orders] Error: {e}')
        return jsonify({'message': 'Failed to fetch orders'}), 500