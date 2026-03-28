// ===============================
// Import React hooks และ service ที่จำเป็น
// ===============================

// createContext = สร้าง context สำหรับแชร์ state ทั้งแอป
// useContext = ใช้เรียกใช้งาน context
// useState = เก็บ state (user, loading)
// useEffect = ใช้ทำงานตอน app เปิด (restore session)
import { createContext, useContext, useState, useEffect } from "react";

// import function จาก authService
// getMe = ใช้เช็ค session (token ยัง valid ไหม)
// logoutApi = เรียก backend เพื่อลบ cookie/session
import { getMe, logout as logoutApi } from "../services/authService";


// ===============================
// สร้าง AuthContext
// ===============================

// ใช้เป็น global state สำหรับ auth (login/logout)
const AuthContext = createContext(null);


// ===============================
// Component: AuthProvider
// ===============================

// ใช้ครอบ App เพื่อให้ทุก component เข้าถึง auth ได้
export function AuthProvider({ children }) {

  // ===============================
  // State ต่าง ๆ
  // ===============================

  // user = เก็บ user ที่ login อยู่ (เช่น user_id)
  const [user, setUser] = useState(null);

  // token (ตอนนี้ยังไม่ได้ใช้ แต่เตรียมไว้)
  const [token, setToken] = useState(null);

  // loading = ใช้รอ restore session ตอนเปิดแอป
  const [loading, setLoading] = useState(true);


  // ==========================================
  // Restore Session เมื่อ App เปิด
  // ==========================================
  useEffect(() => {

    // ฟังก์ชัน async สำหรับเช็ค session
    const restore = async () => {
      try {

        // ===============================
        // เรียก backend เพื่อตรวจสอบ token
        // ===============================

        // ปกติ endpoint นี้จะ:
        // - ตรวจ cookie
        // - validate token
        // - ส่งข้อมูล user กลับมา
        const data = await getMe(); // → /api/me

        // ===============================
        // ถ้า token valid → login อัตโนมัติ
        // ===============================

        // เก็บ user_id ลง state
        setUser(data.user_id);

      } catch {

        // ===============================
        // ถ้า token หมดอายุ / ไม่มี → logout state
        // ===============================
        setUser(null);

      } finally {

        // ===============================
        // ไม่ว่าจะ success หรือ fail → stop loading
        // ===============================
        setLoading(false);
      }
    };

    // เรียก restore ตอน component mount
    restore();

  }, []);


  // ==========================================
  // ฟังก์ชัน login
  // ==========================================
  const login = (userData) => {

    // set user เมื่อ login สำเร็จ
    setUser(userData);
  };


  // ==========================================
  // ฟังก์ชัน logout
  // ==========================================
  const logout = async () => {

    try {

      // ===============================
      // เรียก backend เพื่อ clear session/cookie
      // ===============================
      await logoutApi();

    } catch {
      // ถ้า error ก็ไม่เป็นไร (ยัง logout ฝั่ง frontend ได้)
    }

    // ===============================
    // ล้าง user → กลายเป็น logout state
    // ===============================
    setUser(null);
  };


  // ==========================================
  // Loading state (ตอน restore session)
  // ==========================================

  // ถ้ายังโหลดอยู่ → ยังไม่ render children
  if (loading) return <p>Loading...</p>;


  // ==========================================
  // Provider (แชร์ข้อมูลให้ทั้งแอป)
  // ==========================================
  return (

    // value = สิ่งที่ component อื่นสามารถใช้ได้
    <AuthContext.Provider value={{ user, login, logout }}>

      {/* children = component ทั้งหมดในแอป */}
      {children}

    </AuthContext.Provider>
  );
}


// ===============================
// Hook: useAuth
// ===============================

// ใช้เรียก context ได้ง่าย เช่น:
// const { user, login, logout } = useAuth()
export function useAuth() {

  return useContext(AuthContext);
}