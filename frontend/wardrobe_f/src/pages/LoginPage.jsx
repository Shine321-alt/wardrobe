// ไฟล์นี้ใช้สำหรับแสดงหน้าเข้าสู่ระบบของเว็บไซต์
import LoginForm from '../components/auth/LoginForm'
import '../styles/LoginPage.css'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <Link to="/" className="login-logo">
          WARDROBE<span>+</span>
        </Link>

        {/* Title */}
        <div className="login-header">
          <h1><span>Login</span> to your account</h1>
          <p>Step back into your wardrobe.</p>
        </div>

        {/* Form */}
        <LoginForm />

        {/* Bottom */}
        
        <Link to="/signup" className="login-bottom">Don't have an account?</Link>

      </div>
    </div>
  )
}