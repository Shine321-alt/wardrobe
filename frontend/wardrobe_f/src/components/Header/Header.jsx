import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Heart, ShoppingBag, User } from 'lucide-react'
import MegaMenu from './MegaMenu'
import '../../styles/Header.css'

const navLinks = [
  { label: 'MEN',   to: '/men' },
  { label: 'WOMEN', to: '/women' },
  { label: 'KID',   to: '/kid' },
  { label: 'NEW',   to: '/new' },
]

export default function Header() {
  const [activeMenu, setActiveMenu] = useState(null)
  const location = useLocation()

  return (
    <header className="header">
      <div className="header-inner">

        <Link to="/" className="header-logo">
          WARDROBE<span>+</span>
        </Link>

        <nav className="header-nav">
          {navLinks.map(({ label, to }) => (
            <div
              key={label}
              className="nav-item"
              onMouseEnter={() => setActiveMenu(label)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                to={to}
                className={`nav-link ${location.pathname === to ? 'nav-link--active' : ''} ${activeMenu === label ? 'nav-link--open' : ''}`}
              >
                {label}
              </Link>

              {activeMenu === label && <MegaMenu label={label} />}
            </div>
          ))}
        </nav>

        <div className="header-actions">
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input type="text" placeholder="Search..." className="search-input" />
          </div>
          <button className="icon-btn"><Heart size={17} /></button>
          <Link to="/cart" className="icon-btn"><ShoppingBag size={17} /></Link>
          <button className="icon-btn"><User size={17} /></button>
        </div>

      </div>
    </header>
  )
}