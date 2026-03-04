// ไฟล์นี้ใช้สำหรับสร้าง context เพื่อจัดการข้อมูลผู้ใช้และ token ในระบบ
import { Children, createContext, useContext, useState } from 'react'

const AuthContext = createContext(null);

export default function AuthProvider({children}){

    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    const login = (userData, tokenData) => {
        setUser(userData)
        setToken(tokenData)
        localStorage.setItem('token', tokenData)   // เก็บ token ไว้
    };

    const logout = () => {
        setUser(null)
        setToken(null)
        localStorage.removeItem('token')           // ลบ token ออก
    };
    return(
         <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )

}

// hook สำหรับเรียกใช้งาน
export function useAuth() {
  return useContext(AuthContext)
}