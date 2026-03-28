// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// useState = hook สำหรับจัดการ state ใน React
import { useState } from "react";

// icon รูปซองจดหมาย (ใช้ตกแต่ง UI)
import { Mail } from "lucide-react";

// import CSS สำหรับ style ของฟอร์ม
import "../../styles/LoginForm.css";

// ===============================
// กำหนด URL ของ backend API
// ===============================

// ถ้ามีค่าใน .env → ใช้ค่านั้น
// ถ้าไม่มี → ใช้ localhost (ตอนพัฒนา)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"


// ===============================
// Component: ForgotPasswordForm
// ===============================
export default function ForgotPasswordForm() {

    // ===============================
    // State ต่าง ๆ ที่ใช้ใน component
    // ===============================

    // เก็บ email ที่ user พิมพ์ใน input
    const [email, setEmail] = useState("");

    // เก็บข้อความ response จาก backend (เช่น "ส่งลิงก์แล้ว")
    const [message, setMessage] = useState("");

    // เก็บ error ของ form (เช่น email ไม่ถูกต้อง)
    const [errors, setErrors] = useState({});

    // เก็บลิงก์ reset password ที่ได้จาก backend
    const [resetLink, setResetLink] = useState("");


    // ==========================================
    // ฟังก์ชัน validate input (ตรวจสอบความถูกต้อง)
    // ==========================================
    const validate = () => {

        // object สำหรับเก็บ error ใหม่
        const newErrors = {};

        // ===============================
        // ตรวจสอบ email
        // ===============================

        // ถ้ายังไม่ได้กรอก email
        if (!email) {
            newErrors.email = "Please enter your email";

        // ถ้ามี space ใน email (ซึ่งไม่ควรมี)
        } else if (/\s/.test(email)) {
            newErrors.email = "Email must not contain spaces";
        }

        // return error กลับไป
        return newErrors;
    };


    // ==========================================
    // ฟังก์ชัน handle submit (ตอนกดปุ่ม)
    // ==========================================
    const handleSubmit = async (e) => {

        // ป้องกันไม่ให้ form reload หน้าเว็บ
        e.preventDefault();

        // ===============================
        // validate input ก่อน
        // ===============================
        const newErrors = validate();
        setErrors(newErrors);

        // ===============================
        // ถ้าไม่มี error → เรียก API
        // ===============================
        if (Object.keys(newErrors).length === 0) {
            try {

                // ==========================================
                // เรียก backend API เพื่อสร้าง reset token
                // ==========================================

                // ส่ง request ไปที่ /api/forgot-password
                const res = await fetch(`${API_URL}/api/forgot-password`, {

                    // ใช้ method POST เพราะเราส่งข้อมูลไป backend
                    method: "POST",

                    // บอก backend ว่าเราส่ง JSON
                    headers: {
                        "Content-Type": "application/json"
                    },

                    // แปลง email เป็น JSON string แล้วส่งไป
                    body: JSON.stringify({ email })
                });

                // ===============================
                // รับ response จาก backend
                // ===============================

                const data = await res.json();

                // แสดง message ที่ backend ส่งกลับมา
                setMessage(data.message);

                // เก็บ reset link (ถ้ามี)
                setResetLink(data.reset_link);

            } catch (err) {

                // ===============================
                // ถ้าเกิด error เช่น network ล่ม
                // ===============================

                setErrors({
                    submit: "Something went wrong. Please try again."
                });

            }
        }
    };


    // ===============================
    // UI (สิ่งที่ user เห็นบนหน้าจอ)
    // ===============================
    return (

        // form หลัก (เมื่อ submit จะเรียก handleSubmit)
        <form className="login-form" onSubmit={handleSubmit}>

            {/* ==========================================
               Email Input (ช่องกรอก email)
            ========================================== */}
            <div className="form-group">

                {/* label บอกว่า input นี้คืออะไร */}
                <label>Email address</label>

                {/* wrapper สำหรับจัด layout + icon */}
                <div className="input-wrapper">

                    {/* icon ซองจดหมาย */}
                    <Mail size={16} className="input-icon" />

                    {/* input สำหรับกรอก email */}
                    <input
                        type="email"                         // กำหนดชนิด input
                        placeholder="Enter your email"      // ข้อความตัวอย่าง
                        value={email}                       // bind กับ state
                        onChange={(e) => setEmail(e.target.value)} // update state ทุกครั้งที่พิมพ์
                    />
                </div>

                {/* ถ้ามี error email → แสดงข้อความ */}
                {errors.email && <p className="form-error">{errors.email}</p>}
            </div>


            {/* ==========================================
               Error จาก backend / submit
            ========================================== */}

            {errors.submit && (
                <p className="form-error">{errors.submit}</p>
            )}


            {/* ==========================================
               Message จาก backend (เช่น ส่งลิงก์แล้ว)
            ========================================== */}

            {message && (
                <p style={{ textAlign: "center", marginBottom: "10px" }}>
                    {message}
                </p>
            )}


            {/* ==========================================
               แสดงลิงก์ reset password
            ========================================== */}

            {resetLink && (
                <p style={{ textAlign: "center" }}>
                    <a href={resetLink} target="_blank">
                        Open Reset Password
                    </a>
                </p>
            )}


            {/* ==========================================
               ปุ่ม submit
            ========================================== */}

            <button type="submit" className="form-submit">
                Send Reset Link
            </button>

        </form>
    );
}