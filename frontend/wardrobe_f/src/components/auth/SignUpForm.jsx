import { useState } from "react";
import { Mail, User, Lock, Eye, EyeOff } from "lucide-react";
import "../../styles/SignUpForm.css";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    const newErrors = {};

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      newErrors.email = "Please enter your email";
    } else if (/\s/.test(form.email)) {
      newErrors.email = "Email must not contain spaces";
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Username
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!form.username) {
      newErrors.username = "Please enter your username";
    } else if (/\s/.test(form.username)) {
      newErrors.username = "Username must not contain spaces";
    } else if (!usernameRegex.test(form.username)) {
      newErrors.username = "Username must be 3-20 characters, letters, numbers and _ only";
    }

    // Password
    if (!form.password) {
      newErrors.password = "Please enter your password";
    } else if (/\s/.test(form.password)) {
      newErrors.password = "Password must not contain spaces";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    // Confirm Password
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      console.log(form); // ← เชื่อม API ใน Step ถัดไป
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

      {/* Submit */}
      <button type="submit" className="form-submit">
        Sign up
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