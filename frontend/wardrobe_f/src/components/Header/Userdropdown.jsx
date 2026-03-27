import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/Userdropdown.css'

export default function UserDropdown({ onClose }) {
    const { logout } = useAuth()
    const navigate = useNavigate()

    // กด Logout → เรียก logout จาก context แล้วพาไปหน้าแรก
    const handleLogout = async () => {
        onClose()          // ปิด dropdown ก่อน
        await logout()     // เรียก API /logout เพื่อ clear cookie
        navigate('/')      // พาไปหน้าแรก
    }

    return (
        <div className="user-dropdown">

            {/* ไปหน้า My Account */}
            <Link to="/settings" className="user-dropdown-item" onClick={onClose}>
                My Account
            </Link>


            {/* Logout */}
            <button className="user-dropdown-item user-dropdown-logout" onClick={handleLogout}>
                Logout
            </button>

        </div>
    )
}