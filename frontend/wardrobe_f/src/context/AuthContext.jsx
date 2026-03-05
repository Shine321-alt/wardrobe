import { createContext, useContext, useState, useEffect } from "react";
// import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // ← รอ restore ก่อน

  // ตอน App เปิด → เช็ค token ใน cookie
  useEffect(() => {
    const restore = async () => {
      try {
        const data = await authService.getMe(); // ← เรียก /auth/me
        setUser(data.user);
      } catch {
        setUser(null); // ← ถ้าไม่มี session → logout
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
      await authService.logout();
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
