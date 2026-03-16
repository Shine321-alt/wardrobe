// หน้า Reset Password
import { Link } from "react-router-dom";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";
import "../styles/LoginPage.css";

export default function ResetPasswordPage() {
  return (
    <div className="login-page">
      <div className="login-card">

        {/* Logo */}
        <Link to="/" className="login-logo">
          WARDROBE<span>+</span>
        </Link>

        {/* Title */}
        <div className="login-header">
          <h1><span>Reset</span> your password</h1>
          <p>Enter your new password below.</p>
        </div>

        {/* Form */}
        <ResetPasswordForm />

        {/* Bottom */}
        <Link to="/login" className="login-bottom">
          Back to login
        </Link>

      </div>
    </div>
  );
}