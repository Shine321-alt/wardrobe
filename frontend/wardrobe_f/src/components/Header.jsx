import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react'
import '../styles/Header.css'

const navLinks = [
  { label: 'MEN', to: '/men' },
  { label: 'WOMEN', to: '/women' },
  { label: 'KID', to: '/kid' },
  { label: 'NEW', to: '/new' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="header">
      <div className="header-inner">

        <Link to="/" className="header-logo">
          WARDROBE<span>+</span>
        </Link>

        <nav className="header-nav">
          {navLinks.map(({ label, to }) => (
            <Link
              key={label}
              to={to}
              className={`nav-link ${location.pathname === to ? 'nav-link--active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <div className="search-wrapper">
            <Search size={14} className="search-icon" />
            <input type="text" placeholder="Search..." className="search-input" />
          </div>
          <button className="icon-btn"><Heart size={17} /></button>
          <button className="icon-btn"><ShoppingBag size={17} /></button>
          <button className="icon-btn"><User size={17} /></button>
        </div>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          {navLinks.map(({ label, to }) => (
            <Link key={label} to={to} className="mobile-link" onClick={() => setMobileOpen(false)}>
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}