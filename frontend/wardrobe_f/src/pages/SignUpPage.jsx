// ไฟล์นี้ใช้สำหรับแสดงหน้าสมัครสมาชิกใหม่ของเว็บไซต์
import { Link } from 'react-router-dom'    
import SignUpForm from '../components/auth/SignUpForm'  
import '../styles/SignUpPage.css'

export default function SignUpPage() {
  return (
    <div className="signup-page">

      {/* Top Banner */}
      <div className="signup-banner">
        <Link to="/" className="signup-logo">
          WARDROBE<span>+</span>   
        </Link>
        <h1>New here? Create an account</h1>  
      </div>

      {/* Card */}
      <div className="signup-card">
        <SignUpForm />  
        <Link to="/login" className="signup-bottom">
          Already have an account?
        </Link>
      </div>

    </div>
  )
}