from flask import Blueprint, request, jsonify
from services.card_service import get_cards, add_card
from utils.token import verify_token
import traceback

cards_bp = Blueprint('cards', __name__)

@cards_bp.route('/cards', methods=['GET'])
def fetch_cards():
    try:
        token = request.cookies.get("token")
        if not token:
            return jsonify({"error": "Unauthorized"}), 401

        user = verify_token(token)
        if not user:
            return jsonify({"error": "Invalid or expired token"}), 401

        user_id = user.get("user_id")
        cards = get_cards(user_id)
        return jsonify(cards), 200
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@cards_bp.route('/cards', methods=['POST'])
def create_card():
    try:
        token = request.cookies.get("token")
        if not token:
            return jsonify({"error": "Unauthorized"}), 401

        user = verify_token(token)
        if not user:
            return jsonify({"error": "Invalid or expired token"}), 401
        user_id = user.get("user_id")

        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        required_fields = ['fullName', 'cardNumber', 'expiry', 'cvv']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({"error": f"{field} is required"}), 400

        data["user_id"] = user_id
        result = add_card(data)
        return jsonify(result), 201

    except ValueError as ve:
        if str(ve) == "duplicate":
            return jsonify({"error": "duplicate"}), 409
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        traceback.print_exc()   # << พิมพ์ error จริงใน terminal
        return jsonify({"error": str(e)}), 500