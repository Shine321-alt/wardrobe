// ===============================
// Import library และ hook ที่จำเป็น
// ===============================

// Navigate = ใช้ redirect ไปหน้าอื่น
// Outlet = ใช้ render child routes (route ลูก)
import { Navigate, Outlet } from 'react-router-dom'

// useAuth = context สำหรับเช็คสถานะ login
import { useAuth } from '../context/AuthContext'


// ===============================
// Component: ProtectedRoute
// ===============================

// ใช้สำหรับ "ป้องกัน route"
// เช่น หน้า /cart, /wishlist, /settings
// ถ้า user ยังไม่ login → จะถูก redirect ไป /login
export default function ProtectedRoute() {

  // ===============================
  // ดึงข้อมูล user จาก context
  // ===============================
  const { user } = useAuth()


  // ===============================
  // Logic การป้องกัน route
  // ===============================

  return (

    // ถ้ามี user (login แล้ว)
    user 

      // → ให้แสดง route ลูก (ผ่าน Outlet)
      ? <Outlet /> 

      // ถ้ายังไม่ login
      // → redirect ไปหน้า login
      : <Navigate to="/login" replace />
  )
}