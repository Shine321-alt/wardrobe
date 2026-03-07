import { createContext, useContext, useState, useEffect } from "react";
// import function getMe จาก authService เพื่อตรวจสอบ session เมื่อ App เปิด
import { getMe, logout as logoutApi } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // ← รอ restore ก่อน

  // ===============================
  // Restore Session เมื่อ App เปิด
  // ===============================
  // ตอน App เปิด → เช็ค token ใน cookie
  // ถ้ามี token ที่ยังไม่หมดอายุ จะทำการ restore session
  // ถ้า token หมดอายุหรือไม่มี จะเป็น logout state
  useEffect(() => {
    const restore = async () => {
      try {
        // เรียก getMe เพื่อตรวจสอบ token และดึงข้อมูล user
        const data = await getMe(); // ← เรียก /api/me
        setUser(data.user_id); // ← เก็บ user_id
      } catch {
        setUser(null); // ← ถ้าไม่มี session หรือ token หมดอายุ → logout
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // เรียก API /logout เพื่อให้ backend clear cookie
      await logoutApi();
    } catch {}
    setUser(null);
  };

  // รอ restore เสร็จก่อน render
  if (loading) return <p>Loading...</p>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
