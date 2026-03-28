// ===============================
// Import React hooks และ library ที่จำเป็น
// ===============================

// useState = เก็บ state (query, results ฯลฯ)
// useEffect = ใช้ทำงานตาม lifecycle (เช่น debounce, event listener)
// useRef = ใช้เก็บ reference ของ DOM (สำหรับ detect click ข้างนอก)
import { useState, useEffect, useRef } from 'react'

// ใช้ redirect ไปหน้าอื่น (search page / product page)
import { useNavigate } from 'react-router-dom'

// icon แว่นขยาย
import { Search } from 'lucide-react'

// axios = ใช้เรียก API
import axios from 'axios'

// import CSS ของ search bar
import '../../styles/SearchBar.css'


// ===============================
// กำหนด URL ของ backend
// ===============================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'


// ===============================
// Component: SearchBar
// ===============================
export default function SearchBar() {

    // ===============================
    // State ต่าง ๆ
    // ===============================

    // query = คำที่ user พิมพ์
    const [query, setQuery] = useState('')

    // results = ผลลัพธ์จาก backend (list ของสินค้า)
    const [results, setResults] = useState([])

    // loading = กำลังค้นหาอยู่หรือไม่
    const [loading, setLoading] = useState(false)

    // open = dropdown เปิดอยู่หรือไม่
    const [open, setOpen] = useState(false)

    // ใช้ redirect ไปหน้าอื่น
    const navigate = useNavigate()

    // reference ของ wrapper (ใช้ตรวจจับ click ข้างนอก)
    const wrapperRef = useRef(null)


    // ==========================================
    // Debounce Search (รอ 400ms หลังพิมพ์)
    // ==========================================
    useEffect(() => {

        // ถ้า query ว่าง → reset ทุกอย่าง
        if (!query.trim()) {
            setResults([])
            setOpen(false)
            return
        }

        // เริ่ม loading
        setLoading(true)

        // setTimeout = delay 400ms (debounce)
        const delay = setTimeout(() => {

            // เรียก API search
            axios.get(`${API_URL}/api/search`, {

                // ส่ง query ไปเป็น parameter ?q=...
                params: { q: query }

            })
            .then(res => {

                // เก็บผลลัพธ์
                setResults(res.data)

                // เปิด dropdown
                setOpen(true)
            })
            .catch(() => {

                // ถ้า error → เคลียร์ results
                setResults([])
            })
            .finally(() => {

                // ปิด loading
                setLoading(false)
            })

        }, 400)

        // cleanup → ยกเลิก timeout ถ้า query เปลี่ยนเร็ว
        return () => clearTimeout(delay)

    }, [query]) // ทำงานทุกครั้งที่ query เปลี่ยน


    // ==========================================
    // ปิด dropdown เมื่อคลิกข้างนอก
    // ==========================================
    useEffect(() => {

        const handleClickOutside = (e) => {

            // ถ้าคลิกนอก search bar
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false)
            }
        }

        // add event listener
        document.addEventListener('mousedown', handleClickOutside)

        // cleanup → ลบ listener ตอน unmount
        return () => document.removeEventListener('mousedown', handleClickOutside)

    }, [])


    // ==========================================
    // กด Enter → ไปหน้า search results
    // ==========================================
    const handleKeyDown = (e) => {

        if (e.key === 'Enter' && query.trim()) {

            // ปิด dropdown
            setOpen(false)

            // redirect ไปหน้า search พร้อม query
            navigate(`/search?q=${encodeURIComponent(query.trim())}`)
        }
    }


    // ==========================================
    // กดเลือกสินค้า → ไปหน้า product
    // ==========================================
    const handleSelect = (productId) => {

        // ปิด dropdown
        setOpen(false)

        // ล้าง input
        setQuery('')

        // ไปหน้า product detail
        navigate(`/product/${productId}`)
    }


    // ===============================
    // UI (Search bar + dropdown)
    // ===============================
    return (

        // wrapper หลัก (ใช้ ref สำหรับ detect click ข้างนอก)
        <div className="searchbar-wrapper" ref={wrapperRef}>

            {/* ===============================
               Input search
            =============================== */}
            <div className="searchbar-input-wrap">

                {/* icon */}
                <Search size={14} className="searchbar-icon" />

                {/* input */}
                <input
                    type="text"
                    className="searchbar-input"
                    placeholder="Search..."
                    value={query}

                    // update query ทุกครั้งที่พิมพ์
                    onChange={e => setQuery(e.target.value)}

                    // handle Enter
                    onKeyDown={handleKeyDown}

                    // ถ้ามี results → เปิด dropdown
                    onFocus={() => results.length > 0 && setOpen(true)}
                />
            </div>


            {/* ===============================
               Dropdown results
            =============================== */}
            {open && (

                <div className="searchbar-dropdown">

                    {/* กำลังโหลด */}
                    {loading ? (

                        <p className="searchbar-loading">
                            Searching...
                        </p>

                    ) : results.length === 0 ? (

                        // ไม่มีผลลัพธ์
                        <p className="searchbar-empty">
                            No results for "{query}"
                        </p>

                    ) : (

                        // มีผลลัพธ์ → loop แสดงสินค้า
                        results.map(product => (

                            <div
                                key={product.Product_ID}
                                className="searchbar-item"

                                // กดแล้วไปหน้า product
                                onClick={() => handleSelect(product.Product_ID)}
                            >

                                {/* ===============================
                                   รูปสินค้า
                                =============================== */}
                                <div className="searchbar-item-img">
                                    <img 
                                        src={product.Image_URL} 
                                        alt={product.Product_Name} 
                                    />
                                </div>


                                {/* ===============================
                                   ข้อมูลสินค้า
                                =============================== */}
                                <div className="searchbar-item-info">

                                    {/* ชื่อสินค้า */}
                                    <p className="searchbar-item-name">
                                        {product.Product_Name}
                                    </p>

                                    {/* หมวดหมู่ */}
                                    <p className="searchbar-item-cat">
                                        {product.Type} — {product.Category}
                                    </p>

                                    {/* ราคา */}
                                    <p className="searchbar-item-price">
                                        ${product.Price}
                                    </p>

                                </div>

                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}