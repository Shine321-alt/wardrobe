// หน้า Forgot Password
import { Link } from "react-router-dom";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import "../styles/LoginPage.css";

export default function ForgotPasswordPage() {
  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <Link to="/" className="login-logo">
          WARDROBE<span>+</span>
        </Link>

        {/* Title */}
        <div className="login-header">
          <h1><span>Forgot</span> your password?</h1>
          <p>Enter your email to reset your password.</p>
        </div>

        {/* Form */}
        <ForgotPasswordForm />

        {/* Bottom */}
        <Link to="/login" className="login-bottom">
          Back to login
        </Link>

      </div>
    </div>
  );
}