// ===============================
// Import component และ style ที่จำเป็น
// ===============================

// HeroBanner = แบนเนอร์ด้านบนของหน้า (ภาพใหญ่ / slideshow)
import HeroBanner from '../components/Home/HeroBanner'

// ProductGrid = แสดงสินค้า (เช่น New Arrivals)
import ProductGrid from '../components/Home/ProductGrid'

// CollectionGrid = แสดงหมวดหมู่สินค้า (เช่น T-Shirts, Hoodies)
import CollectionGrid from '../components/Home/CollectionGrid'

// import CSS ของหน้า Home
import '../styles/HomePage.css'


// ===============================
// Component: HomePage
// ===============================

// หน้านี้คือหน้าแรกของเว็บไซต์ (Landing Page)
// มีหน้าที่แสดง content หลักให้ user เห็นทันที
export default function HomePage() {

  // ===============================
  // UI ของหน้า Home
  // ===============================
  return (

    // container หลักของหน้า
    <div className="homepage">

      {/* ==========================================
         Hero Banner (ส่วนบนสุดของเว็บ)
         - ใช้โชว์ภาพใหญ่
         - ดึงดูด attention user
         - อาจเป็น slideshow
      ========================================== */}
      <HeroBanner />


      {/* ==========================================
         Product Grid
         - แสดงสินค้า (เช่น New Arrivals)
         - user สามารถกดเข้าไปดูสินค้าได้
      ========================================== */}
      <ProductGrid />


      {/* ==========================================
         Collection Grid
         - แสดงหมวดหมู่สินค้า
         - ช่วยให้ user navigate ไป category ต่าง ๆ
      ========================================== */}
      <CollectionGrid />


      {/* ==========================================
         Spacing (ช่องว่างด้านล่าง)
         - ใช้เพิ่มระยะห่างท้ายหน้า
         - ป้องกัน UI ชิดขอบเกินไป
      ========================================== */}
      <div className="homepage-spacing" />

    </div>
  )
}