// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// useState = ใช้เก็บ state ภายใน component
import { useState } from "react";

// icon ต่าง ๆ สำหรับ UI
import { User, Lock, Eye, EyeOff } from "lucide-react";

// Link = ใช้เปลี่ยนหน้าแบบไม่ reload
// useNavigate = ใช้ redirect ไปหน้าอื่น
import { Link, useNavigate } from "react-router-dom";

// ฟังก์ชัน login (เรียก API ไป backend)
import { login } from "../../services/authService";

// context สำหรับเก็บสถานะ login ของทั้งแอป
import { useAuth } from "../../context/AuthContext";

// import CSS
import "../../styles/LoginForm.css";


// ===============================
// Component: LoginForm
// ===============================
export default function LoginForm() {
  
  // ใช้ navigate สำหรับ redirect หลัง login สำเร็จ
  const navigate = useNavigate();
  
  // state สำหรับ toggle แสดง/ซ่อน password
  const [showPassword, setShowPassword] = useState(false);

  // state สำหรับเก็บข้อมูลใน form
  const [form, setForm] = useState({
    identifier: "",  // email หรือ username
    password: "",    // password
  });

  // state สำหรับเก็บ error ต่าง ๆ
  const [errors, setErrors] = useState({});
  
  // ดึง function login จาก context (ใช้ update global state)
  const { login: contextLogin } = useAuth();


  // ==========================================
  // handleChange: อัปเดตค่า input
  // ==========================================
  const handleChange = (e) => {

    // e.target.name = identifier หรือ password
    // e.target.value = ค่าที่ user พิมพ์

    // ใช้ spread (...) เพื่อ copy state เดิม
    // แล้ว update เฉพาะ field ที่เปลี่ยน
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  // ==========================================
  // validate: ตรวจสอบ input
  // ==========================================
  const validate = () => {
    const newErrors = {};

    // ===============================
    // ตรวจสอบ identifier
    // ===============================

    if (!form.identifier) {
      newErrors.identifier = "Please enter your email or username";

    } else if (/\s/.test(form.identifier)) {
      // ห้ามมี space
      newErrors.identifier = "Email or username must not contain spaces";
    }

    // ===============================
    // ตรวจสอบ password
    // ===============================

    if (!form.password) {
      newErrors.password = "Please enter your password";

    } else if (/\s/.test(form.password)) {
      newErrors.password = "Password must not contain spaces";
    }

    // return error ทั้งหมด
    return newErrors;
  };


  // ==========================================
  // handleSubmit: เมื่อกด Login
  // ==========================================
  const handleSubmit = async (e) => {

    // ป้องกัน reload หน้า
    e.preventDefault();

    // validate ก่อนส่งข้อมูล
    const newErrors = validate();
    setErrors(newErrors);

    // ถ้าไม่มี error → เรียก API login
    if (Object.keys(newErrors).length === 0) {
      try {

        // ===============================
        // เรียก backend API (login)
        // ===============================

        await login(form.identifier, form.password);

        // update global state ว่า login แล้ว
        contextLogin(form.identifier);

        // redirect ไปหน้า home
        navigate("/");

      } catch (err) {

        // ===============================
        // กรณี login ไม่สำเร็จ
        // ===============================

        console.error("Login Error:", err);

        // เอา error จาก backend มาแสดง
        setErrors({ 
          submit: err.response?.data?.error || 
          "Login failed. Please check your credentials." 
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

      {/* ==========================================
         Identifier (Username / Email)
      ========================================== */}
      <div className="form-group">

        <label>Username / Email address</label>

        <div className="input-wrapper">

          {/* icon user */}
          <User size={16} className="input-icon" />

          {/* input */}
          <input
            type="text"
            name="identifier"  // สำคัญ → ใช้กับ handleChange
            placeholder="Enter your username / email address"
            value={form.identifier}   // bind กับ state
            onChange={handleChange}   // update state
          />
        </div>

        {/* แสดง error */}
        {errors.identifier && <p className="form-error">{errors.identifier}</p>}
      </div>


      {/* ==========================================
         Password
      ========================================== */}
      <div className="form-group">

        <label>Password</label>

        <div className="input-wrapper">

          {/* icon lock */}
          <Lock size={16} className="input-icon" />

          {/* input password */}
          <input
            type={showPassword ? "text" : "password"} // toggle แสดง/ซ่อน
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
          />

          {/* ปุ่ม toggle password */}
          <button
            type="button" // สำคัญ → ไม่ให้ submit form
            className="input-eye"
            onClick={() => setShowPassword(!showPassword)}
          >
            {/* ถ้ายังไม่โชว์ → แสดง EyeOff */}
            {!showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {/* แสดง error */}
        {errors.password && <p className="form-error">{errors.password}</p>}
      </div>


      {/* ==========================================
         Remember me + Forgot password
      ========================================== */}
      <div className="form-options">

        {/* checkbox */}
        <label className="form-remember">
          <input type="checkbox" />
          <span>Remember me</span>
        </label>

        {/* link ไปหน้า forgot password */}
        <Link to="/forgot-password" className="form-forgot">
          Forgot password?
        </Link>
      </div>


      {/* ==========================================
         Error จาก backend
      ========================================== */}
      {errors.submit && (
        <p className="form-error" style={{ textAlign: 'center', marginBottom: '10px' }}>
          {errors.submit}
        </p>
      )}


      {/* ==========================================
         ปุ่ม Login
      ========================================== */}
      <button type="submit" className="form-submit">
        Login
      </button>


      {/* ==========================================
         Divider (เส้นคั่น)
      ========================================== */}
      <div className="form-divider">
        <span>Or continue with</span>
      </div>


      {/* ==========================================
         ปุ่ม Google login (UI อย่างเดียว)
      ========================================== */}
      <button type="button" className="form-google">

        {/* icon Google */}
        <img src="https://www.google.com/favicon.ico" alt="Google" width={16} />

        Google
      </button>

    </form>
  );
}