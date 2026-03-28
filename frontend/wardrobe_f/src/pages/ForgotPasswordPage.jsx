// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// Link = ใช้เปลี่ยนหน้าแบบไม่ reload
import { Link } from "react-router-dom";

// import form สำหรับกรอก email เพื่อ reset password
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";

// import CSS ของหน้า login (ใช้ร่วมกัน)
import "../styles/LoginPage.css";


// ===============================
// Component: ForgotPasswordPage
// ===============================
export default function ForgotPasswordPage() {

  // ===============================
  // UI (หน้า Forgot Password)
  // ===============================
  return (

    // container หลัก (จัด layout ให้อยู่กลางจอ)
    <div className="login-page">

      {/* card (กล่อง form) */}
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
            <span>Forgot</span> your password?
          </h1>

          {/* คำอธิบาย */}
          <p>
            Enter your email to reset your password.
          </p>
        </div>


        {/* ==========================================
           Form (component แยก)
        ========================================== */}

        {/* component นี้จะ handle:
            - รับ email
            - validate
            - เรียก API forgot password */}
        <ForgotPasswordForm />


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