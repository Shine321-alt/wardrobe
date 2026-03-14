import { useState } from "react";
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react";
import "../../styles/SignUpForm.css";
import { register } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export default function SignUpForm() {

  // state สำหรับ toggle แสดง/ซ่อน password
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  // state เก็บค่าจาก form
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // state เก็บ error message
  const [errors, setErrors] = useState({});

  // อัปเดตค่า input เมื่อ user พิมพ์
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ตรวจสอบข้อมูลก่อน submit
  const validate = () => {
    const newErrors = {};

    // ตรวจสอบ Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      newErrors.email = "Please enter your email";
    } else if (/\s/.test(form.email)) {
      newErrors.email = "Email must not contain spaces";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // ตรวจสอบ Username
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!form.username) {
      newErrors.username = "Please enter your username";
    } else if (/\s/.test(form.username)) {
      newErrors.username = "Username must not contain spaces";
    } else if (!usernameRegex.test(form.username)) {
      newErrors.username = "Username must be 3-20 characters";
    }

    // ตรวจสอบ Password
    if (!form.password) {
      newErrors.password = "Please enter your password";
    } else if (/\s/.test(form.password)) {
      newErrors.password = "Password must not contain spaces";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // ตรวจสอบ Confirm Password
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  // ทำงานเมื่อกด Sign Up
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    setErrors(newErrors);

    // ถ้าไม่มี error → เรียก API register
    if (Object.keys(newErrors).length === 0) {
      try {
        const res = await register({
          email: form.email,
          username: form.username,
          password: form.password,
        });

        console.log("Signup success:", res);
        alert("Signup successful!");

        // redirect ไปหน้า login
        navigate("/login");

      } catch (error) {
        console.error("Signup error:", error);
        alert("Signup failed");
      }
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSubmit}>

      {/* Email */}
      <div className="form-group">
        <label>Email address</label>
        <div className="input-wrapper">
          <Mail size={16} className="input-icon" />
          <input
            type="email"
            name="email"
            placeholder="Enter email address"
            value={form.email}
            onChange={handleChange}
          />
        </div>
        {errors.email && <p className="form-error">{errors.email}</p>}
      </div>

      {/* Username */}
      <div className="form-group">
        <label>Username</label>
        <div className="input-wrapper">
          <User size={16} className="input-icon" />
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={form.username}
            onChange={handleChange}
          />
        </div>
        {errors.username && <p className="form-error">{errors.username}</p>}
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
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password && <p className="form-error">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div className="form-group">
        <label>Confirm Password</label>
        <div className="input-wrapper">
          <Lock size={16} className="input-icon" />
          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            placeholder="Enter your password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
          <button
            type="button"
            className="input-eye"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword && (
          <p className="form-error">{errors.confirmPassword}</p>
        )}
      </div>

      {/* ปุ่มสมัครสมาชิก */}
      <button type="submit" className="form-submit">
        Sign up
      </button>

      {/* Divider */}
      <div className="form-divider">
        <span>Or continue with</span>
      </div>

      {/* Google Login (ยังไม่ได้เชื่อม API) */}
      <button type="button" className="form-google">
        <img src="https://www.google.com/favicon.ico" alt="Google" width={16} />
        Google
      </button>

    </form>
  );
}