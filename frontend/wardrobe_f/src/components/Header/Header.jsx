import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Heart, ShoppingBag, User } from 'lucide-react'
import MegaMenu from './MegaMenu'
import UserDropdown from './Userdropdown'
import { useAuth } from '../../context/AuthContext'
import '../../styles/Header.css'
import SearchBar from '../Search/SearchBar'

const navLinks = [
  { label: 'MEN',   to: '/men' },
  { label: 'WOMEN', to: '/women' },
  { label: 'KID',   to: '/kid' },
  { label: 'NEW',   to: '/new' },
]

export default function Header() {
  const [activeMenu, setActiveMenu] = useState(null)      // nav ไหนที่ hover อยู่
  const [showUserMenu, setShowUserMenu] = useState(false) // แสดง dropdown user ไหม
  const location = useLocation()
  const { user } = useAuth()  // ดึงสถานะ login จาก context

  return (
    <header className="header">
      <div className="header-inner">

        {/* Logo */}
        <Link to="/" className="header-logo">
          WARDROBE<span>+</span>
        </Link>

        {/* Nav links + MegaMenu */}
        <nav className="header-nav">
          {navLinks.map(({ label, to }) => (
            <div
              key={label}
              className="nav-item"
              onMouseEnter={() => setActiveMenu(label)}  // hover → เปิด MegaMenu
              onMouseLeave={() => setActiveMenu(null)}   // ออก → ปิด MegaMenu
            >
              <Link
                to={to}
                className={`nav-link 
                  ${location.pathname === to ? 'nav-link--active' : ''} 
                  ${activeMenu === label ? 'nav-link--open' : ''}`}
              >
                {label}
              </Link>
              {/* แสดง MegaMenu เฉพาะ nav ที่ hover */}
              {activeMenu === label && <MegaMenu label={label} />}
            </div>
          ))}
        </nav>

        {/* Action icons ขวา */}
        <div className="header-actions">

          {/* Search bar */}
          <SearchBar />

          {/* Wishlist icon → ถ้า login พาไป /wishlist, ถ้าไม่ login พาไป /login */}
          <Link to={user ? '/wishlist' : '/login'} className="icon-btn">
            <Heart size={17} />
          </Link>

          {/* Cart icon */}
          <Link to="/cart" className="icon-btn">
            <ShoppingBag size={17} />
          </Link>

          {/* User icon — ถ้า login แสดง dropdown, ถ้าไม่ login พาไป /login */}
          {user ? (
            <div
              className="user-menu-wrapper"
              onMouseEnter={() => setShowUserMenu(true)}  // hover → เปิด dropdown
              onMouseLeave={() => setShowUserMenu(false)} // ออก → ปิด dropdown
            >
              <Link to="/settings" className="icon-btn">
                <User size={17} />
              </Link>
              {showUserMenu && (
                <UserDropdown onClose={() => setShowUserMenu(false)} />
              )}
            </div>
          ) : (
            <Link to="/login" className="icon-btn">
              <User size={17} />
            </Link>
          )}

        </div>

      </div>
    </header>
  )
}