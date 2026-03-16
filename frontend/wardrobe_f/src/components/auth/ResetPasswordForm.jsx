import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import "../../styles/LoginForm.css";
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"

export default function ResetPasswordForm() {

  // รับ token จาก URL เช่น /reset-password/:token
  const { token } = useParams();

  // ใช้สำหรับ redirect ไปหน้าอื่น เช่น login
  const navigate = useNavigate();

  // state สำหรับแสดง/ซ่อน password
  const [showPassword, setShowPassword] = useState(false);

  // state สำหรับเก็บค่าที่ user กรอกใน form
  const [form, setForm] = useState({
    password: "",
    confirmPassword: ""
  });

  // state สำหรับเก็บ error message
  const [errors, setErrors] = useState({});

  // ฟังก์ชัน update ค่า input เมื่อ user พิมพ์
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ==========================================
  // Validate form input
  // ==========================================
  const validate = () => {

    const newErrors = {};

    // ตรวจสอบว่ากรอก password หรือไม่
    if (!form.password) {
      newErrors.password = "Please enter your password";
    }

    // ตรวจสอบว่า password กับ confirm password ตรงกันไหม
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  // ==========================================
  // Handle form submit
  // ==========================================
  const handleSubmit = async (e) => {

    e.preventDefault(); // ป้องกัน page reload

    // เรียก validate
    const newErrors = validate();
    setErrors(newErrors);

    // ถ้าไม่มี error
    if (Object.keys(newErrors).length === 0) {
      try {

        // ==========================================
        // ส่ง request ไป backend เพื่อ reset password
        // =======================$===================
        const res = await fetch(`${API_URL}/api/reset-password`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            token: token,           // token จาก reset link
            password: form.password // password ใหม่
          })
        });

        // รับ response จาก backend
        const data = await res.json();

        // ถ้า backend ส่ง error
        if (!res.ok) {
          throw new Error(data.message);
        }

        // แจ้งเตือน reset สำเร็จ
        alert("Password reset successful");

        // redirect ไปหน้า login
        navigate("/login");

      } catch (err) {

        // แสดง error ถ้า reset ไม่สำเร็จ
        setErrors({
          submit: err.message || "Reset password failed"
        });

      }
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>

      {/* ==============================
          New Password Input
      ============================== */}
      <div className="form-group">
        <label>New Password</label>

        <div className="input-wrapper">
          <Lock size={16} className="input-icon" />

          <input
            type={showPassword ? "text" : "password"} // toggle show password
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
          <Lock size={16} className="input-icon" />

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

      {/* แสดง error จาก backend */}
      {errors.submit && (
        <p className="form-error">{errors.submit}</p>
      )}

      {/* ปุ่ม reset password */}
      <button type="submit" className="form-submit">
        Reset Password
      </button>

    </form>
  );
}