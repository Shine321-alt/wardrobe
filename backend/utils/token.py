import jwt
import datetime

# secret key สำหรับ encode token
SECRET_KEY = "mysecretkey"


def generate_token(user_id):

    # payload ที่จะใส่ใน token
    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=1)
    }

    # สร้าง JWT token
    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm="HS256"
    )

    return token


# ===============================
# ตรวจสอบ JWT Token
# ===============================
# ฟังก์ชันนี้ใช้สำหรับตรวจสอบความถูกต้องของ token
# หากถูกต้อง จะส่ง payload กลับมา
# หากไม่ถูกต้อง จะส่ง None กลับมา
def verify_token(token):

    try:
        # ถอดรหัส token ด้วย secret key
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]
        )

        # ส่ง payload (มี user_id) กลับไป
        return payload

    except jwt.ExpiredSignatureError:
        # Token หมดอายุ
        return None

    except jwt.InvalidTokenError:
        # Token ไม่ถูกต้อง
        return None