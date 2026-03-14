import { useState } from "react";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import "../../styles/LoginForm.css";

export default function LoginForm() {
  
  const navigate = useNavigate();// ใช้สำหรับเปลี่ยนหน้าไปที่ /dashboard หลังจาก login สำเร็จ
  
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  
  // ===============================
  // ใช้ useAuth hook เพื่อ update state ใน AuthContext
  // ===============================
  const { login: contextLogin } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    if (!form.identifier) {
      newErrors.identifier = "Please enter your email or username";
    } else if (/\s/.test(form.identifier)) {
      newErrors.identifier = "Email or username must not contain spaces";
    }

    if (!form.password) {
      newErrors.password = "Please enter your password";
    } else if (/\s/.test(form.password)) {
      newErrors.password = "Password must not contain spaces";
    }

    return newErrors;
  };

  // ทำงานเมื่อผู้ใช้กดปุ่ม Login
const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);

    if(Object.keys(newErrors).length === 0){
      try{
        // ส่งต่อให้ authService จัดการ
        await login(form.identifier, form.password);
        
        contextLogin(form.identifier);
        navigate("/");

      }catch (err){
        // ⚠️ เพิ่มการจับ Error จาก Backend มาแสดงหน้าเว็บ
        console.error("Login Error:", err);
        // สมมติว่า Backend ส่ง error กลับมาในรูปแบบ err.response.data.error (ถ้าใช้ axios)
        setErrors({ 
          submit: err.response?.data?.error || "Login failed. Please check your credentials." 
        });
      }
    }
  };
    

  return (
    <form className="login-form" onSubmit={handleSubmit}>

      {/* identifier */}
      <div className="form-group">
        <label>Username / Email address</label>
        <div className="input-wrapper">
          <User size={16} className="input-icon" />
          <input
            type="text"
            name="identifier"
            placeholder="Enter your username / email address"
            value={form.identifier}
            onChange={handleChange}
          />
        </div>
        {errors.identifier && <p className="form-error">{errors.identifier}</p>}
      </div>

      {/* Password */}
      <div className="form-group">
        <label>Password</label>
        <div className="input-wrapper">
          <Lock size={16} className="input-icon" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
          />
          <button
            type="button"
            className="input-eye"
            onClick={() => setShowPassword(!showPassword)}
          >
            {!showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="form-error">{errors.password}</p>}
      </div>

      {/* Remember + Forgot */}
      <div className="form-options">
        <label className="form-remember">
          <input type="checkbox" />
          <span>Remember me</span>
        </label>
        <Link to="/forgot-password" className="form-forgot">
          Forget password?
        </Link>
      </div>

      {/* แสดง Error กรณีล็อกอินไม่ผ่าน */}
      {errors.submit && (
        <p className="form-error" style={{ textAlign: 'center', marginBottom: '10px' }}>
          {errors.submit}
        </p>
      )}

      {/* Submit */}
      <button type="submit" className="form-submit">
        Login
      </button>

      {/* Divider */}
      <div className="form-divider">
        <span>Or continue with</span>
      </div>

      {/* Google */}
      <button type="button" className="form-google">
        <img src="https://www.google.com/favicon.ico" alt="Google" width={16} />
        Google
      </button>

    </form>
  );
}