// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// Link = ใช้เปลี่ยนหน้าแบบไม่ reload
// useNavigate = ใช้ redirect ไปหน้าอื่น
import { Link, useNavigate } from 'react-router-dom'

// useAuth = context สำหรับจัดการสถานะ login/logout
import { useAuth } from '../../context/AuthContext'

// import CSS ของ dropdown
import '../../styles/Userdropdown.css'


// ===============================
// Component: UserDropdown
// ===============================

// รับ props = onClose (ฟังก์ชันไว้ปิด dropdown)
export default function UserDropdown({ onClose }) {

    // ดึง function logout จาก context
    const { logout } = useAuth()

    // ใช้ redirect
    const navigate = useNavigate()


    // ==========================================
    // handleLogout: เมื่อ user กดปุ่ม Logout
    // ==========================================
    const handleLogout = async () => {

        // ===============================
        // 1. ปิด dropdown ก่อน
        // ===============================
        onClose()

        // ===============================
        // 2. เรียก logout (ฝั่ง backend)
        // ===============================

        // ปกติจะ:
        // - ลบ cookie
        // - clear session
        await logout()

        // ===============================
        // 3. redirect ไปหน้า Home
        // ===============================
        navigate('/')
    }


    // ===============================
    // UI (dropdown menu)
    // ===============================
    return (

        // container หลักของ dropdown
        <div className="user-dropdown">

            {/* ==========================================
               เมนู: My Account
            ========================================== */}

            {/* กดแล้วไปหน้า /settings */}
            {/* onClose = ปิด dropdown ตอนกด */}
            <Link 
                to="/settings" 
                className="user-dropdown-item" 
                onClick={onClose}
            >
                My Account
            </Link>


            {/* ==========================================
               เมนู: Logout
            ========================================== */}

            <button 
                className="user-dropdown-item user-dropdown-logout" 
                onClick={handleLogout}
            >
                Logout
            </button>

        </div>
    )
}