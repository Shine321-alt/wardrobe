// ===============================
// Import component และ library ที่จำเป็น
// ===============================

// LoginForm = form สำหรับ login (กรอก username/email + password)
import LoginForm from '../components/auth/LoginForm'

// import CSS ของหน้า login
import '../styles/LoginPage.css'

// Link = ใช้เปลี่ยนหน้าแบบไม่ reload
import { Link } from 'react-router-dom'


// ===============================
// Component: LoginPage
// ===============================

// หน้านี้ใช้สำหรับ "เข้าสู่ระบบ"
// เป็น entry point สำหรับ user ที่มี account อยู่แล้ว
export default function LoginPage() {

  // ===============================
  // UI ของหน้า Login
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
            <span>Login</span> to your account
          </h1>

          {/* คำอธิบาย */}
          <p>
            Step back into your wardrobe.
          </p>
        </div>


        {/* ==========================================
           Form (component แยก)
        ========================================== */}

        {/* component นี้จะ handle:
            - รับ input username/email + password
            - validate
            - เรียก API login */}
        <LoginForm />


        {/* ==========================================
           Bottom link
        ========================================== */}

        {/* ลิงก์ไปหน้า signup สำหรับ user ใหม่ */}
        <Link to="/signup" className="login-bottom">
          Don't have an account?
        </Link>

      </div>
    </div>
  )
}