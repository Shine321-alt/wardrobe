import { useState } from "react";
import { Mail } from "lucide-react";
import "../../styles/LoginForm.css";

export default function ForgotPasswordForm() {

    // state สำหรับเก็บ email ที่ user พิมพ์
    const [email, setEmail] = useState("");

    // state สำหรับข้อความ response จาก backend
    const [message, setMessage] = useState("");

    // state สำหรับเก็บ error ของ form
    const [errors, setErrors] = useState({});

    // สำหรับเก็บ link reset password
    const [resetLink, setResetLink] = useState("");

    // ==========================================
    // Validate form input
    // ==========================================
    const validate = () => {
        const newErrors = {};

        // ตรวจสอบว่ามีการกรอก email หรือไม่
        if (!email) {
            newErrors.email = "Please enter your email";

        // ตรวจสอบว่า email มี space หรือไม่
        } else if (/\s/.test(email)) {
            newErrors.email = "Email must not contain spaces";
        }

        return newErrors;
    };

    // ==========================================
    // Handle form submit
    // ==========================================
    const handleSubmit = async (e) => {
        e.preventDefault(); // ป้องกัน page reload

        // validate input
        const newErrors = validate();
        setErrors(newErrors);

        // ถ้าไม่มี error
        if (Object.keys(newErrors).length === 0) {
            try {

                // ==========================================
                // เรียก API ไปที่ backend เพื่อสร้าง reset token
                // ==========================================
                const res = await fetch("http://localhost:5000/api/forgot-password", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ email }) // ส่ง email ไป backend
                });

                // รับ response จาก backend
                const data = await res.json();

                // แสดงข้อความตอบกลับ
                setMessage(data.message);
                setResetLink(data.reset_link);

            } catch (err) {

                // ถ้าเกิด error ระหว่างเรียก API
                setErrors({
                    submit: "Something went wrong. Please try again."
                });

            }
        }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>

            {/* ==========================================
               Email Input
            ========================================== */}
            <div className="form-group">
                <label>Email address</label>

                <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} // update state
                    />
                </div>

                {/* แสดง error ของ email */}
                {errors.email && <p className="form-error">{errors.email}</p>}
            </div>

            {/* แสดง error จาก backend */}
            {errors.submit && (
                <p className="form-error">{errors.submit}</p>
            )}

            {/* แสดง message จาก backend */}
            {message && (
                <p style={{ textAlign: "center", marginBottom: "10px" }}>
                    {message}
                </p>
            )}

            {/* แสดง link สำหรับ reset password*/}
            {resetLink && (
                <p style={{ textAlign: "center" }}>
                    <a href={resetLink} target="_blank">
                    Open Reset Password
                    </a>
                </p>
            )}

            {/* ปุ่มส่ง request reset password */}
            <button type="submit" className="form-submit">
                Send Reset Link
            </button>

        </form>
    );
}