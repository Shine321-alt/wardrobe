// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// useState = ใช้เก็บ state ใน component
import { useState } from "react";

// icon สำหรับ UI
import { Lock, Eye, EyeOff } from "lucide-react";

// useParams = ใช้ดึง parameter จาก URL (เช่น token)
// useNavigate = ใช้ redirect ไปหน้าอื่น
import { useParams, useNavigate } from "react-router-dom";

// import CSS สำหรับ style ฟอร์ม
import "../../styles/LoginForm.css";

// ===============================
// กำหนด URL ของ backend API
// ===============================

// ถ้ามีค่าใน .env → ใช้ค่า env
// ถ้าไม่มี → ใช้ localhost
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"


// ===============================
// Component: ResetPasswordForm
// ===============================
export default function ResetPasswordForm() {

  // ===============================
  // ดึง token จาก URL
  // ===============================

  // เช่น URL: /reset-password/abc123 → token = "abc123"
  const { token } = useParams();

  // ใช้ redirect หลัง reset สำเร็จ
  const navigate = useNavigate();

  // ===============================
  // State ต่าง ๆ
  // ===============================

  // toggle แสดง/ซ่อน password
  const [showPassword, setShowPassword] = useState(false);

  // เก็บค่าที่ user กรอก
  const [form, setForm] = useState({
    password: "",         // password ใหม่
    confirmPassword: ""   // ยืนยัน password
  });

  // เก็บ error ต่าง ๆ
  const [errors, setErrors] = useState({});


  // ==========================================
  // handleChange: update ค่า input
  // ==========================================
  const handleChange = (e) => {

    // ใช้ name ของ input เป็น key
    // เช่น password / confirmPassword
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  // ==========================================
  // Validate form input
  // ==========================================
  const validate = () => {

    const newErrors = {};

    // ===============================
    // ตรวจสอบ password
    // ===============================

    // ถ้ายังไม่ได้กรอก password
    if (!form.password) {
      newErrors.password = "Please enter your password";
    }

    // ===============================
    // ตรวจสอบ confirm password
    // ===============================

    // ถ้า password ไม่ตรงกัน
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };


  // ==========================================
  // Handle form submit
  // ==========================================
  const handleSubmit = async (e) => {

    // ป้องกัน reload หน้า
    e.preventDefault();

    // validate ก่อนส่ง
    const newErrors = validate();
    setErrors(newErrors);

    // ===============================
    // ถ้าไม่มี error → เรียก API
    // ===============================
    if (Object.keys(newErrors).length === 0) {
      try {

        // ==========================================
        // เรียก backend API reset password
        // ==========================================

        const res = await fetch(`${API_URL}/api/reset-password`, {

          // ใช้ POST เพราะมีการส่งข้อมูล
          method: "POST",

          // บอก backend ว่าเป็น JSON
          headers: {
            "Content-Type": "application/json"
          },

          // ส่ง token + password ใหม่
          body: JSON.stringify({
            token: token,           // token จาก URL (ใช้ยืนยันตัวตน)
            password: form.password // password ใหม่
          })
        });

        // ===============================
        // รับ response จาก backend
        // ===============================
        const data = await res.json();

        // ===============================
        // ถ้า response ไม่ OK → error
        // ===============================
        if (!res.ok) {
          throw new Error(data.message);
        }

        // ===============================
        // ถ้าสำเร็จ
        // ===============================

        // แจ้งเตือน user
        alert("Password reset successful");

        // redirect ไปหน้า login
        navigate("/login");

      } catch (err) {

        // ===============================
        // ถ้าเกิด error
        // ===============================

        setErrors({
          submit: err.message || "Reset password failed"
        });

      }
    }
  };


  // ===============================
  // UI (สิ่งที่ user เห็น)
  // ===============================
  return (

    // form หลัก
    <form className="login-form" onSubmit={handleSubmit}>

      {/* ==============================
          New Password Input
      ============================== */}
      <div className="form-group">

        <label>New Password</label>

        <div className="input-wrapper">

          {/* icon lock */}
          <Lock size={16} className="input-icon" />

          {/* input password */}
          <input
            type={showPassword ? "text" : "password"} // toggle แสดง/ซ่อน
            name="password"
            placeholder="Enter new password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        {/* แสดง error ของ password */}
        {errors.password && <p className="form-error">{errors.password}</p>}
      </div>


      {/* ==============================
          Confirm Password Input
      ============================== */}
      <div className="form-group">

        <label>Confirm Password</label>

        <div className="input-wrapper">

          {/* icon lock */}
          <Lock size={16} className="input-icon" />

          {/* input confirm password */}
          <input
            type={showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm new password"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          {/* ปุ่ม toggle แสดง/ซ่อน password */}
          <button
            type="button"
            className="input-eye"
            onClick={() => setShowPassword(!showPassword)}
          >
            {!showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* แสดง error ถ้า password ไม่ตรงกัน */}
        {errors.confirmPassword && (
          <p className="form-error">{errors.confirmPassword}</p>
        )}
      </div>


      {/* ==============================
          Error จาก backend
      ============================== */}
      {errors.submit && (
        <p className="form-error">{errors.submit}</p>
      )}


      {/* ==============================
          ปุ่ม Reset Password
      ============================== */}
      <button type="submit" className="form-submit">
        Reset Password
      </button>

    </form>
  );
}