// ===============================
// Import React hooks และ library ที่จำเป็น
// ===============================

// useState = เก็บ state (products, loading)
// useEffect = ใช้เรียก API ตอน component mount
import { useState, useEffect } from 'react'

// Link = ใช้เปลี่ยนหน้าแบบไม่ reload
import { Link } from 'react-router-dom'

// axios = ใช้เรียก API จาก backend
import axios from 'axios'

// import CSS สำหรับ product grid
import '../../styles/ProductGrid.css'


// ===============================
// กำหนด URL ของ backend
// ===============================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'


// ===============================
// Component: ProductGrid
// ===============================
export default function ProductGrid() {

  // ===============================
  // State ต่าง ๆ
  // ===============================

  // เก็บ list ของสินค้า
  const [products, setProducts] = useState([])

  // ใช้เช็คว่ากำลังโหลดข้อมูลอยู่หรือไม่
  const [loading, setLoading] = useState(true)


  // ==========================================
  // useEffect: เรียก API ตอน component โหลด
  // ==========================================
  useEffect(() => {

    // เรียก API → /api/products/arrivals (สินค้าใหม่)
    axios.get(`${API_URL}/api/products/arrivals`)

      .then(res => {

        // เก็บข้อมูลสินค้าที่ได้จาก backend
        setProducts(res.data)

        // เปลี่ยน loading = false (โหลดเสร็จแล้ว)
        setLoading(false)
      })

    // [] = ทำครั้งเดียวตอน mount
  }, [])


  // ==========================================
  // ถ้ายังโหลด → แสดง Loading...
  // ==========================================
  if (loading) {
    return (
      <p className="product-loading">
        Loading...
      </p>
    )
  }


  // ==========================================
  // UI (แสดงสินค้า)
  // ==========================================
  return (

    // section หลักของ product grid
    <section className="product-section">

      {/* ===============================
         Header (ชื่อ + ปุ่ม VIEW ALL)
      =============================== */}
      <div className="product-header">

        {/* หัวข้อ */}
        <h2 className="product-title">
          New Arrivals
        </h2>

        {/* link ไปหน้า /new */}
        <Link to="/new" className="product-viewall">
          VIEW ALL
        </Link>
      </div>


      {/* ===============================
         Grid ของสินค้า
      =============================== */}
      <div className="product-grid">

        {/* loop สินค้าทั้งหมด */}
        {products.map(product => (

          // แต่ละ card เป็น link ไปหน้า product detail
          <Link
            to={`/product/${product.Product_ID}`} // dynamic route
            key={product.Product_ID}              // key สำหรับ React
            className="product-card"
          >

            {/* ===============================
               รูปสินค้า
            =============================== */}
            <div className="product-card-image">

              <img 
                src={product.Image_URL}        // URL รูป
                alt={product.Product_Name}     // alt สำหรับ SEO/accessibility
              />

            </div>

          </Link>
        ))}
      </div>

    </section>
  )
}