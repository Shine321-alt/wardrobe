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

// import CSS ของหน้า Men
import '../styles/MenPage.css'

// HeroBanner = แบนเนอร์ด้านบน
import HeroBanner from '../components/Home/HeroBanner'


// ===============================
// กำหนด API URL
// ===============================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'


// ===============================
// Sub Categories (เมนูด้านบน)
// ===============================

// ใช้แสดง navigation ย่อย (เช่น T-shirts, Shirts)
const SUB_CATEGORIES = [
  { label: 'T-shirts',              slug: 't-shirts' },
  { label: 'Shirts',                slug: 'shirts' },
  { label: 'Trousers',              slug: 'trousers' },
  { label: 'Hoodies & Sweatshirts', slug: 'hoodies-sweatshirts' },
]


// ===============================
// Sections (แต่ละ section ของหน้า)
// ===============================

// ใช้กำหนดว่าในหน้า Men จะมี section อะไรบ้าง
const SECTIONS = [
  { id: 'new-arrivals',        title: 'New Arrivals',          category: 'new-arrivals',        showInfo: false },
  { id: 'shirts',              title: 'Shirts',                category: 'shirts',              showInfo: true  },
  { id: 't-shirts',            title: 'T-Shirts',              category: 't-shirts',            showInfo: true  },
  { id: 'trousers',            title: 'Trousers',              category: 'trousers',            showInfo: true  },
  { id: 'hoodies-sweatshirts', title: 'Hoodies & Sweatshirts', category: 'hoodies-sweatshirts', showInfo: true  },
]


// ===============================
// แปลง slug → category name
// ===============================

// เช่น "t-shirts" → "T-Shirts"
const slugToCategory = (slug) => {
  const map = {
    'shirts': 'Shirts',
    't-shirts': 'T-Shirts',
    'trousers': 'Trousers',
    'hoodies-sweatshirts': 'Hoodies & Sweatshirts',
  }
  return map[slug] || slug
}


// ===============================
// Component: ProductSection
// ===============================

// ใช้แสดงสินค้าในแต่ละ section
function ProductSection({ title, sectionId, category, showInfo }) {

  // ===============================
  // State
  // ===============================
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)


  // ==========================================
  // useEffect: โหลดสินค้า
  // ==========================================
  useEffect(() => {

    // เช็คว่าเป็น New Arrivals หรือไม่
    const isNewArrivals = category === 'new-arrivals'

    // เลือก endpoint
    const url = isNewArrivals
      ? `${API_URL}/api/products/new-arrivals`
      : `${API_URL}/api/products/filter`

    // query params
    const params = isNewArrivals
      ? { type: 'Men' }
      : { type: 'Men', category: slugToCategory(category) }

    // เรียก API
    axios.get(url, { params })

      .then(res => {
        // เอาแค่ 4 ตัวแรก (โชว์ preview)
        setProducts(res.data.slice(0, 4))
        setLoading(false)
      })

      .catch(() => setLoading(false))

  }, [category])


  // ===============================
  // UI ของ section
  // ===============================
  return (

    <section id={sectionId} className="men-section">

      {/* ===============================
         Header (title + view all)
      =============================== */}
      <div className="men-section-header">

        <h2 className="men-section-title">{title}</h2>

        <Link
          to={`/men/${sectionId}`}
          className="men-section-viewall"
        >
          VIEW ALL
        </Link>
      </div>


      {/* ===============================
         Empty state
      =============================== */}
      {!loading && products.length === 0 && (
        <p className="men-no-products">No products found.</p>
      )}


      {/* ===============================
         Product Grid
      =============================== */}
      <div className={`men-product-grid ${!showInfo ? 'men-product-grid--no-gap' : ''}`}>

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
          : products.map(product => (

              <Link
                to={`/product/${product.Product_ID}`}
                key={product.Product_ID}
                className="men-product-card"
              >

                {/* รูปสินค้า */}
                <div className="men-product-card-image">
                  <img src={product.Image_URL} alt={product.Product_Name} />
                </div>

                {/* ข้อมูลสินค้า */}
                {showInfo && (
                  <div className="men-product-card-info">
                    <p className="men-product-card-name">{product.Product_Name}</p>
                    <p className="men-product-card-cat">{product.Category}</p>
                    <p className="men-product-card-price">${product.Price}</p>
                  </div>
                )}

              </Link>
            ))
        }
      </div>
    </section>
  )
}


// ===============================
// Component: MenPage (หน้าหลัก)
// ===============================
export default function MenPage() {

  return (

    <div className="men-page">


      {/* ==========================================
         Sub Navigation (เมนูด้านบน)
      ========================================== */}
      <div className="men-subnav-wrapper">

        <div className="men-subnav-inner">

          {/* label */}
          <span className="men-subnav-label">Men</span>

          {/* list category */}
          {SUB_CATEGORIES.map(({ label, slug }) => (
            <Link
              key={slug}
              to={`/men/${slug}`}
              className="men-subnav-link"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>


      {/* ==========================================
         Hero Banner
      ========================================== */}
      <HeroBanner imageUrl="https://res.cloudinary.com/dc8cuih9q/image/upload/v1774720327/Group_7_pvrbp5.png" />


      {/* ==========================================
         Sections ต่าง ๆ
      ========================================== */}
      {SECTIONS.map(({ id, title, category, showInfo }) => (

        <ProductSection
          key={id}
          sectionId={id}
          title={title}
          category={category}
          showInfo={showInfo}
        />

      ))}


      {/* spacing ด้านล่าง */}
      <div className="men-page-spacing" />

    </div>
  )
}