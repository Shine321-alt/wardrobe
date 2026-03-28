// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// useState = ใช้เก็บ state ภายใน component
import { useState } from "react";

// icon สำหรับ UI (ตกแต่ง input)
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react";

// import CSS สำหรับ style ของฟอร์มสมัคร
import "../../styles/SignUpForm.css";

// ฟังก์ชัน register (เรียก API ไป backend)
import { register } from "../../services/authService";

// ใช้ redirect ไปหน้าอื่นหลังสมัครเสร็จ
import { useNavigate } from "react-router-dom";


// ===============================
// Component: SignUpForm
// ===============================
export default function SignUpForm() {

  // ===============================
  // State สำหรับ toggle แสดง/ซ่อน password
  // ===============================

  const [showPassword, setShowPassword] = useState(false); // password หลัก
  const [showConfirm, setShowConfirm] = useState(false);   // confirm password

  // ใช้ redirect
  const navigate = useNavigate();

  // ===============================
  // State สำหรับเก็บค่าจาก form
  // ===============================

  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  // state สำหรับเก็บ error message
  const [errors, setErrors] = useState({});


  // ==========================================
  // handleChange: อัปเดตค่า input
  // ==========================================
  const handleChange = (e) => {

    // ใช้ name ของ input เป็น key
    // เช่น email, username, password
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  // ==========================================
  // validate: ตรวจสอบข้อมูลก่อนส่ง
  // ==========================================
  const validate = () => {

    const newErrors = {};

    // ===============================
    // ตรวจสอบ Email
    // ===============================

    // regex ตรวจสอบรูปแบบ email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email) {
      newErrors.email = "Please enter your email";

    } else if (/\s/.test(form.email)) {
      // ห้ามมี space
      newErrors.email = "Email must not contain spaces";

    } else if (!emailRegex.test(form.email)) {
      // ต้องเป็น email format
      newErrors.email = "Please enter a valid email address";
    }


    // ===============================
    // ตรวจสอบ Username
    // ===============================

    // regex → อนุญาต a-z A-Z 0-9 และ _
    // ความยาว 3-20 ตัว
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;

    if (!form.username) {
      newErrors.username = "Please enter your username";

    } else if (/\s/.test(form.username)) {
      newErrors.username = "Username must not contain spaces";

    } else if (!usernameRegex.test(form.username)) {
      newErrors.username = "Username must be 3-20 characters";
    }


    // ===============================
    // ตรวจสอบ Password
    // ===============================

    if (!form.password) {
      newErrors.password = "Please enter your password";

    } else if (/\s/.test(form.password)) {
      newErrors.password = "Password must not contain spaces";

    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }


    // ===============================
    // ตรวจสอบ Confirm Password
    // ===============================

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";

    } else if (form.password !== form.confirmPassword) {
      // ต้องตรงกับ password
      newErrors.confirmPassword = "Passwords do not match";
    }

    // return error ทั้งหมด
    return newErrors;
  };


  // ==========================================
  // handleSubmit: เมื่อกด Sign Up
  // ==========================================
  const handleSubmit = async (e) => {

    // ป้องกัน reload หน้า
    e.preventDefault();

    // validate ก่อน
    const newErrors = validate();
    setErrors(newErrors);

    // ===============================
    // ถ้าไม่มี error → เรียก API
    // ===============================
    if (Object.keys(newErrors).length === 0) {
      try {

        // ===============================
        // เรียก backend API register
        // ===============================

        const res = await register({
          email: form.email,
          username: form.username,
          password: form.password,
        });

        console.log("Signup success:", res);

        // แจ้งเตือน user
        alert("Signup successful!");

        // redirect ไปหน้า login
        navigate("/login");

      } catch (error) {

        // ===============================
        // ถ้า signup ไม่สำเร็จ
        // ===============================

        console.error("Signup error:", error);
        alert("Signup failed");
      }
    }
  };


  // ===============================
  // UI (สิ่งที่ user เห็น)
  // ===============================
  return (

    // form หลัก
    <form className="signup-form" onSubmit={handleSubmit}>

      {/* ==========================================
         Email Input
      ========================================== */}
      <div className="signup-form-group">

        <label>Email address</label>

        <div className="signup-input-wrapper">

          {/* icon email */}
          <Mail size={16} className="signup-input-icon" />

          {/* input email */}
          <input
            type="email"
            name="email"
            placeholder="Enter email address"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        {/* แสดง error */}
        {errors.email && <p className="signup-form-error">{errors.email}</p>}
      </div>


      {/* ==========================================
         Username Input
      ========================================== */}
      <div className="signup-form-group">

        <label>Username</label>

        <div className="signup-input-wrapper">

          {/* icon user */}
          <User size={16} className="signup-input-icon" />

          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={form.username}
            onChange={handleChange}
          />
        </div>

        {errors.username && <p className="signup-form-error">{errors.username}</p>}
      </div>


      {/* ==========================================
         Password Input
      ========================================== */}
      <div className="signup-form-group">

        <label>Password</label>

        <div className="signup-input-wrapper">

          {/* icon lock */}
          <Lock size={16} className="signup-input-icon" />

          <input
            type={showPassword ? "text" : "password"} // toggle แสดง/ซ่อน
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
          />

          {/* ปุ่ม toggle */}
          <button
            type="button"
            className="signup-input-eye"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {errors.password && <p className="signup-form-error">{errors.password}</p>}
      </div>


      {/* ==========================================
         Confirm Password Input
      ========================================== */}
      <div className="signup-form-group">

        <label>Confirm Password</label>

        <div className="signup-input-wrapper">

          <Lock size={16} className="signup-input-icon" />

          <input
            type={showConfirm ? "text" : "password"}
            name="confirmPassword"
            placeholder="Enter your password"
            value={form.confirmPassword}
            onChange={handleChange}
          />

          {/* toggle แยกอีกตัว */}
          <button
            type="button"
            className="signup-input-eye"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {errors.confirmPassword && (
          <p className="signup-form-error">{errors.confirmPassword}</p>
        )}
      </div>


      {/* ==========================================
         ปุ่ม Sign Up
      ========================================== */}
      <button type="submit" className="signup-form-submit">
        Sign up
      </button>


      {/* ==========================================
         Divider
      ========================================== */}
      <div className="signup-form-divider">
        <span>Or continue with</span>
      </div>


      {/* ==========================================
         Google Login (UI อย่างเดียว)
      ========================================== */}
      <button type="button" className="signup-form-google">

        <img src="https://www.google.com/favicon.ico" alt="Google" width={16} />

        Google
      </button>

    </form>
  );
}