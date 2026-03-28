// ===============================
// Import component และ library ที่จำเป็น
// ===============================

// Link = ใช้เปลี่ยนหน้าแบบไม่ reload
import { Link } from 'react-router-dom'

// SignUpForm = form สำหรับสมัครสมาชิก
import SignUpForm from '../components/auth/SignUpForm'

// import CSS ของหน้า login (layout หลัก)
import '../styles/LoginPage.css'

// import CSS เพิ่มเติมเฉพาะหน้า signup
import '../styles/SignUpPage.css'


// ===============================
// Component: SignUpPage
// ===============================

// หน้านี้ใช้สำหรับ "สมัครสมาชิก"
// เป็นจุดเริ่มต้นสำหรับ user ใหม่
export default function SignUpPage() {

  // ===============================
  // UI ของหน้า Sign Up
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
            <span>Sign up</span> for an account
          </h1>

          {/* คำอธิบาย */}
          <p>
            Start building your wardrobe today.
          </p>
        </div>


        {/* ==========================================
           Form (component แยก)
        ========================================== */}

        {/* component นี้จะ handle:
            - รับข้อมูล user (email, password ฯลฯ)
            - validate
            - เรียก API สมัครสมาชิก */}
        <SignUpForm />


        {/* ==========================================
           Bottom link
        ========================================== */}

        {/* ถ้ามี account แล้ว → ไปหน้า login */}
        <Link to="/login" className="login-bottom">
          Already have an account?
        </Link>

      </div>
    </div>
  )
}