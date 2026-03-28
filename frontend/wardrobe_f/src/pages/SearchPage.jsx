// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// useSearchParams = ใช้ดึง query string จาก URL เช่น ?q=shirt
import { useSearchParams } from 'react-router-dom'

// useState = เก็บ state (products, loading)
// useEffect = ใช้เรียก API เมื่อ query เปลี่ยน
import { useState, useEffect } from 'react'

// axios = ใช้เรียก backend API
import axios from 'axios'

// CategoryCard = ใช้แสดงสินค้าแต่ละตัว
import CategoryCard from '../components/Category/Categorycard'

// import CSS
import '../styles/Searchpage.css'

// Announcement_Bar = แถบโปรโมชั่นด้านบน
import Announcement_Bar from '../components/Announcement_Bar'


// ===============================
// API URL
// ===============================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'


// ===============================
// Component: SearchPage
// ===============================

// หน้านี้ใช้แสดง "ผลลัพธ์การค้นหา"
// เช่น /search?q=shirt
export default function SearchPage() {

    // ===============================
    // ดึง query parameter
    // ===============================
    const [searchParams] = useSearchParams()

    // q = keyword ที่ user ค้นหา
    const q = searchParams.get('q') || ''


    // ===============================
    // State
    // ===============================
    const [products, setProducts] = useState([]) // ผลลัพธ์สินค้า
    const [loading, setLoading] = useState(false) // loading state


    // ==========================================
    // useEffect: เรียก API เมื่อ q เปลี่ยน
    // ==========================================
    useEffect(() => {

        // ถ้า query ว่าง → reset
        if (!q.trim()) {
            setProducts([])
            return
        }

        // เริ่ม loading
        setLoading(true)

        // เรียก API search
        axios.get(`${API_URL}/api/search`, { params: { q } })

            .then(res => setProducts(res.data)) // เก็บผลลัพธ์

            .catch(() => setProducts([])) // ถ้า error → empty

            .finally(() => setLoading(false)) // ปิด loading

    }, [q])


    // ===============================
    // UI
    // ===============================
    return (

        <div>

            {/* ==========================================
               Announcement Bar
            ========================================== */}
            <Announcement_Bar />


            {/* ==========================================
               Section หลักของหน้า
            ========================================== */}
            <section className="search-section">


                {/* ===============================
                   Header
                =============================== */}
                <div className="search-header">

                    {/* แสดงคำค้น */}
                    <h1 className="search-title">
                        {q ? `Results for "${q}"` : 'Search'}
                    </h1>

                    {/* จำนวนสินค้า */}
                    {!loading && (
                        <p className="search-count">
                            {products.length} products
                        </p>
                    )}
                </div>


                {/* ===============================
                   Loading
                =============================== */}
                {loading && (
                    <div className="search-loading">
                        Searching...
                    </div>
                )}


                {/* ===============================
                   Empty state
                =============================== */}
                {!loading && q && products.length === 0 && (
                    <div className="search-empty">
                        <p>No products found for "{q}"</p>
                    </div>
                )}


                {/* ===============================
                   Product Grid
                =============================== */}
                {!loading && products.length > 0 && (

                    <div className="search-grid">

                        {products.map(product => (

                            <CategoryCard
                                key={product.Product_ID}
                                product={product}
                            />

                        ))}

                    </div>
                )}

            </section>
        </div>
    )
}