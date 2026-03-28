// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// useState = ใช้เก็บ state ภายใน component
import { useState } from 'react'

// Link = ใช้เปลี่ยนหน้าแบบ SPA (ไม่ reload)
// useLocation = ใช้ดู path ปัจจุบัน (เช่น /men /women)
import { Link, useLocation } from 'react-router-dom'

// icon ต่าง ๆ สำหรับ UI
import { Heart, ShoppingBag, User } from 'lucide-react'

// MegaMenu = เมนู dropdown ใหญ่ (เช่น hover MEN แล้วมีหมวดสินค้า)
import MegaMenu from './MegaMenu'

// UserDropdown = dropdown ของ user (profile, logout ฯลฯ)
import UserDropdown from './Userdropdown'

// context สำหรับดูว่า user login อยู่หรือไม่
import { useAuth } from '../../context/AuthContext'

// import CSS ของ header
import '../../styles/Header.css'

// component search bar
import SearchBar from '../Search/SearchBar'


// ===============================
// รายการ navigation menu ด้านบน
// ===============================

// label = ข้อความที่แสดง
// to = path ที่จะไปเมื่อกด
const navLinks = [
  { label: 'MEN',   to: '/men' },
  { label: 'WOMEN', to: '/women' },
  { label: 'KID',   to: '/kid' },
  { label: 'NEW',   to: '/new' },
]


// ===============================
// Component: Header
// ===============================
export default function Header() {

  // ===============================
  // State ต่าง ๆ
  // ===============================

  // เก็บว่า nav ไหนกำลัง hover อยู่ (เพื่อเปิด MegaMenu)
  const [activeMenu, setActiveMenu] = useState(null)

  // เก็บสถานะว่าจะแสดง dropdown user หรือไม่
  const [showUserMenu, setShowUserMenu] = useState(false)

  // ใช้ดู path ปัจจุบัน (เช่น /men)
  const location = useLocation()

  // ดึงข้อมูล user จาก context (เช็คว่า login หรือยัง)
  const { user } = useAuth()


  // ===============================
  // UI (Header ทั้งหมด)
  // ===============================
  return (
    <header className="header">

      <div className="header-inner">

        {/* ==========================================
           Logo (กดแล้วกลับหน้า Home)
        ========================================== */}
        <Link to="/" className="header-logo">
          WARDROBE<span>+</span>
        </Link>


        {/* ==========================================
           Navigation Menu + MegaMenu
        ========================================== */}
        <nav className="header-nav">

          {/* loop navLinks เพื่อสร้าง menu */}
          {navLinks.map(({ label, to }) => (

            <div
              key={label}
              className="nav-item"

              // hover → เปิด MegaMenu
              onMouseEnter={() => setActiveMenu(label)}

              // เอาเมาส์ออก → ปิด MegaMenu
              onMouseLeave={() => setActiveMenu(null)}
            >

              {/* link ของ menu */}
              <Link
                to={to}

                // className dynamic:
                // - active = ถ้า path ตรง
                // - open = ถ้า hover อยู่
                className={`nav-link 
                  ${location.pathname === to ? 'nav-link--active' : ''} 
                  ${activeMenu === label ? 'nav-link--open' : ''}`}
              >
                {label}
              </Link>

              {/* ===============================
                 MegaMenu (แสดงเฉพาะตอน hover)
              =============================== */}
              {activeMenu === label && <MegaMenu label={label} />}

            </div>
          ))}
        </nav>


        {/* ==========================================
           Action icons ด้านขวา (Search, Wishlist, Cart, User)
        ========================================== */}
        <div className="header-actions">

          {/* ===============================
             Search bar
          =============================== */}
          <SearchBar />


          {/* ===============================
             Wishlist icon
          =============================== */}

          {/* ถ้า login → ไป /wishlist
              ถ้าไม่ login → ไป /login */}
          <Link 
            to={user ? '/wishlist' : '/login'} 
            className="icon-btn"
          >
            <Heart size={17} />
          </Link>


          {/* ===============================
             Cart icon
          =============================== */}
          <Link to="/cart" className="icon-btn">
            <ShoppingBag size={17} />
          </Link>


          {/* ===============================
             User icon + dropdown
          =============================== */}

          {user ? (

            // ถ้า login → แสดง dropdown
            <div
              className="user-menu-wrapper"

              // hover → เปิด dropdown
              onMouseEnter={() => setShowUserMenu(true)}

              // ออก → ปิด dropdown
              onMouseLeave={() => setShowUserMenu(false)}
            >

              {/* icon user (กดไปหน้า settings) */}
              <Link to="/settings" className="icon-btn">
                <User size={17} />
              </Link>

              {/* แสดง dropdown menu */}
              {showUserMenu && (
                <UserDropdown onClose={() => setShowUserMenu(false)} />
              )}
            </div>

          ) : (

            // ถ้ายังไม่ login → กดแล้วไปหน้า login
            <Link to="/login" className="icon-btn">
              <User size={17} />
            </Link>
          )}

        </div>

      </div>
    </header>
  )
}