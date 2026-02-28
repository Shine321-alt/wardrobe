import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react'

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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          {/* Logo */}
          <Link to="/">
            <span className="font-black text-xl font-mono">
              WARDROBE<span className="text-red-500">+</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                className={`text-xs font-bold tracking-widest hover:text-red-500 transition-colors ${
                  location.pathname === to
                    ? 'text-red-500 border-b-2 border-red-500'
                    : 'text-gray-800'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Search + Icons */}
          <div className="hidden md:flex items-center gap-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-8 pr-4 py-1.5 text-xs bg-gray-100 rounded-full focus:outline-none w-36 focus:w-48 transition-all"
              />
            </div>
            <button className="p-1.5 hover:text-red-500 transition-colors"><Heart size={17} /></button>
            <button className="p-1.5 hover:text-red-500 transition-colors"><ShoppingBag size={17} /></button>
            <button className="p-1.5 hover:text-red-500 transition-colors"><User size={17} /></button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t px-6 py-4 flex flex-col gap-4">
          {navLinks.map(({ label, to }) => (
            <Link key={label} to={to} onClick={() => setMobileOpen(false)}
              className="text-sm font-bold tracking-widest hover:text-red-500">
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}