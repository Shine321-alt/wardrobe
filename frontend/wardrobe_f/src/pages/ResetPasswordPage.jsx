// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// Link = ใช้เปลี่ยนหน้าแบบไม่ reload
import { Link } from "react-router-dom";

// ResetPasswordForm = form สำหรับตั้งรหัสผ่านใหม่
import ResetPasswordForm from "../components/auth/ResetPasswordForm";

// import CSS ของหน้า login (ใช้ style ร่วมกัน)
import "../styles/LoginPage.css";


// ===============================
// Component: ResetPasswordPage
// ===============================

// หน้านี้ใช้สำหรับ "ตั้งรหัสผ่านใหม่"
// โดยปกติจะเข้ามาจากลิงก์ reset password (token)
export default function ResetPasswordPage() {

  // ===============================
  // UI ของหน้า Reset Password
  // ===============================
  return (

    // container หลัก (จัดให้อยู่กลางหน้าจอ)
    <div className="login-page">

      {/* กล่อง form */}
      <div className="login-card">


        {/* ==========================================
           Logo (กดแล้วกลับหน้า Home)
        ========================================== */}
        <Link to="/" className="login-logo">
          WARDROBE<span>+</span>
        </Link>


        {/* ==========================================
           Header (หัวข้อ + คำอธิบาย)
        ========================================== */}
        <div className="login-header">

          {/* หัวข้อ */}
          <h1>
            <span>Reset</span> your password
          </h1>

          {/* คำอธิบาย */}
          <p>
            Enter your new password below.
          </p>
        </div>


        {/* ==========================================
           Form (component แยก)
        ========================================== */}

        {/* component นี้จะ handle:
            - รับ password ใหม่
            - validate ความปลอดภัย
            - ส่ง token + password ไป backend */}
        <ResetPasswordForm />


        {/* ==========================================
           Bottom link
        ========================================== */}

        {/* กลับไปหน้า login */}
        <Link to="/login" className="login-bottom">
          Back to login
        </Link>

      </div>
    </div>
  );
}