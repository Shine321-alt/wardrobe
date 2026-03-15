import { Link } from 'react-router-dom'
import SignUpForm from '../components/auth/SignUpForm'
import '../styles/LoginPage.css'
import '../styles/SignUpPage.css'

export default function SignUpPage() {
  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <Link to="/" className="login-logo">
          WARDROBE<span>+</span>
        </Link>

        {/* Title */}
        <div className="login-header">
          <h1><span>Sign up</span> for an account</h1>
          <p>Start building your wardrobe today.</p>
        </div>

        {/* Form */}
        <SignUpForm />

        {/* Bottom */}
        <Link to="/login" className="login-bottom">
          Already have an account?
        </Link>

      </div>
    </div>
  )
}