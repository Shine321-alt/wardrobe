// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// useParams = ใช้ดึง parameter จาก URL (เช่น /men/t-shirts)
// Link = ใช้เปลี่ยนหน้าแบบไม่ reload
import { useParams, Link } from 'react-router-dom'

// useEffect = ใช้เรียก API ตอนโหลดหน้า / param เปลี่ยน
// useState = เก็บ state (products, loading)
import { useEffect, useState } from 'react'

// axios = ใช้เรียก backend API
import axios from 'axios'

// component สำหรับแสดงสินค้าแต่ละตัว
import CategoryCard from '../components/Category/Categorycard'

// import CSS
import '../styles/Categorypage.css'


// ===============================
// กำหนด URL ของ backend
// ===============================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'


// ===============================
// แปลง slug → label
// ===============================

// เช่น:
// "t-shirts" → "T-Shirts"
const slugToLabel = (slug) =>
    slug
        .split('-') // แยกคำด้วย -
        .map(w => w.charAt(0).toUpperCase() + w.slice(1)) // ตัวแรกใหญ่
        .join('-') // รวมกลับ


// ===============================
// mapping พิเศษ (กรณีมี &)
// ===============================

// เช่น:
// "hoodies-&-sweatshirts" → "Hoodies & Sweatshirts"
const slugMap = {
    'hoodies-&-sweatshirts': 'Hoodies & Sweatshirts',
}


// ===============================
// Hero Banner mapping
// ===============================

// ใช้กำหนดรูป banner ตาม type/category
// key = "men/t-shirts" เป็นต้น
const heroBannerMap = {
    'men/hoodies-&-sweatshirts': 'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774696753/menHoodieshero-banner_zmgohg.png',
    'men/trousers':              'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774696754/mentrouserherobanner_qeg1qb.png',
    'men/shirts':                'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774696753/MENShirtsherobanner_lbtjut.png',
    'men/t-shirts':              'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774696753/MEN_T-shirtsherobanner_lqm3lj.png',
    'men/new-arrivals':          'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774696753/MEN-Arivalsherobanne_yqcvn8.png',
}


// ===============================
// Component: CategoryPage
// ===============================
export default function CategoryPage() {

    // ===============================
    // ดึง param จาก URL
    // ===============================

    // เช่น /men/t-shirts → type="men", category="t-shirts"
    const { type, category } = useParams()


    // ===============================
    // State
    // ===============================
    const [products, setProducts] = useState([]) // list สินค้า
    const [loading, setLoading] = useState(true) // loading state


    // ===============================
    // แปลง slug → label
    // ===============================
    const typeLabel = slugToLabel(type)

    // ถ้ามีใน slugMap → ใช้ mapping
    // ถ้าไม่มี → ใช้ function ปกติ
    const categoryLabel = slugMap[category] || slugToLabel(category)


    // ===============================
    // หา Hero Banner
    // ===============================
    const heroBanner = heroBannerMap[`${type}/${category}`] || null


    // ===============================
    // ตรวจสอบ category พิเศษ
    // ===============================
    const isNewArrivals = category === 'new-arrivals'
    const isBestSellers = category === 'best-sellers'
    const isLatestDrops = category === 'latest-drops'
    const isEssentials  = category === 'essentials'
    const isNewSeason   = category === 'new-season'
    const isLimited     = category === 'limited'


    // ==========================================
    // useEffect: เรียก API เมื่อ type/category เปลี่ยน
    // ==========================================
    useEffect(() => {

        // reset state ก่อนโหลดใหม่
        setLoading(true)
        setProducts([])

        let url = ''     // endpoint
        let params = {}  // query params

        // ===============================
        // กรณี New Arrivals
        // ===============================
        if (isNewArrivals) {

            url = `${API_URL}/api/products/new-arrivals`

            // ส่ง type เช่น MEN/WOMEN
            params = { type: typeLabel }

        // ===============================
        // กรณี category พิเศษ (ยังไม่ implement)
        // ===============================
        } else if (isBestSellers || isLatestDrops || isEssentials || isNewSeason || isLimited) {

            // ตอนนี้ยังไม่มี API → return เลย
            setProducts([])
            setLoading(false)
            return

        // ===============================
        // กรณีทั่วไป (filter)
        // ===============================
        } else {

            url = `${API_URL}/api/products/filter`

            params = { 
                type: typeLabel, 
                category: categoryLabel 
            }
        }

        // ===============================
        // เรียก API
        // ===============================
        axios.get(url, { params })

            .then(res => setProducts(res.data))

            .catch(() => setProducts([]))

            .finally(() => setLoading(false))

    }, [type, category]) // ทำใหม่เมื่อ URL เปลี่ยน


    // ===============================
    // UI
    // ===============================
    return (
        <div>

            {/* ==========================================
               Hero Banner (เต็มจอ)
            ========================================== */}
            {heroBanner && (
                <div className="category-hero">
                    <img src={heroBanner} alt={categoryLabel} />
                </div>
            )}


            {/* ==========================================
               Content (มี padding + max-width)
            ========================================== */}
            <section className="category-section">

                {/* ===============================
                   Header
                =============================== */}
                <div className="category-header">

                    {/* breadcrumb */}
                    <p className="category-breadcrumb">
                        {typeLabel} / {categoryLabel}
                    </p>

                    {/* title */}
                    <h1 className="category-title">
                        {categoryLabel}
                    </h1>

                    {/* จำนวนสินค้า */}
                    <p className="category-count">
                        {products.length} products
                    </p>
                </div>


                {/* ===============================
                   Loading
                =============================== */}
                {loading && (
                    <div className="category-loading">
                        Loading...
                    </div>
                )}


                {/* ===============================
                   Empty state
                =============================== */}
                {!loading && products.length === 0 && (
                    <div className="category-empty">

                        <p>No products found.</p>

                        <Link to="/" className="category-shop-btn">
                            BACK TO HOME
                        </Link>
                    </div>
                )}


                {/* ===============================
                   Product Grid
                =============================== */}
                {!loading && products.length > 0 && (

                    <div className="category-grid">

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