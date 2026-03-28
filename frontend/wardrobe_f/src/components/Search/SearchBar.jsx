// SearchBar.jsx — search input พร้อม dropdown results
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import axios from 'axios'
import '../../styles/SearchBar.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function SearchBar() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const navigate = useNavigate()
    const wrapperRef = useRef(null)

    // debounce — รอ 400ms หลังพิมพ์ค่อย search
    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            setOpen(false)
            return
        }

        setLoading(true)
        const delay = setTimeout(() => {
            axios.get(`${API_URL}/api/search`, { params: { q: query } })
                .then(res => {
                    setResults(res.data)
                    setOpen(true)
                })
                .catch(() => setResults([]))
                .finally(() => setLoading(false))
        }, 400)

        return () => clearTimeout(delay)
    }, [query])

    // ปิด dropdown เมื่อคลิกข้างนอก
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // กด Enter → ไปหน้า search results
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            setOpen(false)
            navigate(`/search?q=${encodeURIComponent(query.trim())}`)
        }
    }

    // กดเลือก product → ไปหน้า product
    const handleSelect = (productId) => {
        setOpen(false)
        setQuery('')
        navigate(`/product/${productId}`)
    }

    return (
        <div className="searchbar-wrapper" ref={wrapperRef}>

            {/* Input */}
            <div className="searchbar-input-wrap">
                <Search size={14} className="searchbar-icon" />
                <input
                    type="text"
                    className="searchbar-input"
                    placeholder="Search..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => results.length > 0 && setOpen(true)}
                />
            </div>

            {/* Dropdown results */}
            {open && (
                <div className="searchbar-dropdown">
                    {loading ? (
                        <p className="searchbar-loading">Searching...</p>
                    ) : results.length === 0 ? (
                        <p className="searchbar-empty">No results for "{query}"</p>
                    ) : (
                        results.map(product => (
                            <div
                                key={product.Product_ID}
                                className="searchbar-item"
                                onClick={() => handleSelect(product.Product_ID)}
                            >
                                {/* รูปสินค้า */}
                                <div className="searchbar-item-img">
                                    <img src={product.Image_URL} alt={product.Product_Name} />
                                </div>
                                {/* ข้อมูลสินค้า */}
                                <div className="searchbar-item-info">
                                    <p className="searchbar-item-name">{product.Product_Name}</p>
                                    <p className="searchbar-item-cat">{product.Type} — {product.Category}</p>
                                    <p className="searchbar-item-price">${product.Price}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}