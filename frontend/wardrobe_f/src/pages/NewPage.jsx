// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// useState = เก็บ state (products, loading)
// useEffect = ใช้เรียก API ตอนโหลด section
import { useState, useEffect } from 'react'

// Link = ใช้เปลี่ยนหน้าแบบไม่ reload
import { Link } from 'react-router-dom'

// axios = ใช้เรียก backend API
import axios from 'axios'

// HeroBanner = แสดง banner ด้านบน
import HeroBanner from '../components/Home/HeroBanner'

// import CSS (ใช้ style เดียวกับ MenPage)
import '../styles/MenPage.css'


// ===============================
// กำหนด API URL
// ===============================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'


// ===============================
// Banner ของหน้า New
// ===============================

// ใช้เป็นภาพหลักด้านบนสุดของหน้า
const NEW_BANNER = 'https://res.cloudinary.com/dc8cuih9q/image/upload/v1774713988/Hero-Banner_NEW_s_Page_lplko3.png'


// ===============================
// Types (แบ่งตาม Men / Women / Kid)
// ===============================

// ใช้สร้าง section แยกตามประเภทสินค้า
const TYPES = [
  { label: 'Men',   type: 'Men' },
  { label: 'Women', type: 'Women' },
  { label: 'Kid',   type: 'Kid' },
]


// ===============================
// Component: NewSection
// ===============================

// ใช้แสดงสินค้า New Arrivals ของแต่ละ type
function NewSection({ title, type }) {

  // ===============================
  // State
  // ===============================
  const [products, setProducts] = useState([]) // list สินค้า
  const [loading, setLoading]   = useState(true) // loading state


  // ==========================================
  // useEffect: โหลดสินค้า New Arrivals
  // ==========================================
  useEffect(() => {

    // เรียก API new-arrivals โดยส่ง type เช่น Men/Women/Kid
    axios.get(`${API_URL}/api/products/new-arrivals`, { params: { type } })

      .then(res => {

        // เอาแค่ 8 ตัวแรก (preview)
        setProducts(res.data.slice(0, 8))

        setLoading(false)
      })

      .catch(() => setLoading(false))

  }, [type])


  // ===============================
  // ถ้าไม่มีสินค้า → ไม่ render section นี้
  // ===============================
  if (!loading && products.length === 0) return null


  // ===============================
  // UI ของ section
  // ===============================
  return (

    <section className="men-section">

      {/* ===============================
         Header (title)
      =============================== */}
      <div className="men-section-header">
        <h2 className="men-section-title">{title}</h2>
      </div>


      {/* ===============================
         Product Grid
      =============================== */}
      <div className="men-product-grid">

        {loading

          // ===============================
          // Loading Skeleton
          // ===============================
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="men-product-card-skeleton" />
            ))

          // ===============================
          // แสดงสินค้า
          // ===============================
          : products.map(p => (

              <Link
                to={`/product/${p.Product_ID}`}
                key={p.Product_ID}
                className="men-product-card"
              >

                {/* รูปสินค้า */}
                <div className="men-product-card-image">
                  <img src={p.Image_URL} alt={p.Product_Name} />
                </div>

                {/* ข้อมูลสินค้า */}
                <div className="men-product-card-info">
                  <p className="men-product-card-name">{p.Product_Name}</p>
                  <p className="men-product-card-cat">{p.Category}</p>
                  <p className="men-product-card-price">${p.Price}</p>
                </div>

              </Link>
            ))
        }
      </div>
    </section>
  )
}


// ===============================
// Component: NewPage
// ===============================

// หน้า "New Arrivals"
// แสดงสินค้าล่าสุดแยกตามประเภท (Men / Women / Kid)
export default function NewPage() {

  return (

    <div className="men-page">

      {/* ==========================================
         Hero Banner
         - แสดงภาพหลักของหน้า New
      ========================================== */}
      <HeroBanner imageUrl={NEW_BANNER} />  


      {/* ==========================================
         Sections (วนตาม TYPES)
      ========================================== */}
      {TYPES.map(({ label, type }) => (

        <NewSection
          key={type}
          title={label}
          type={type}
        />

      ))}


      {/* spacing ด้านล่าง */}
      <div className="men-page-spacing" />

    </div>
  )
}