import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import HeroBanner from '../components/Home/HeroBanner'
import '../styles/MenPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const SUB_CATEGORIES = [
  { label: 'T-Shirts',              slug: 't-shirts' },
  { label: 'Shirts',                slug: 'shirts' },
  { label: 'Trousers',              slug: 'trousers' },
  { label: 'Hoodies & Sweatshirts', slug: 'hoodies-sweatshirts' },
]

const SECTIONS = [
  { id: 'best-seller',         title: 'Best Seller',           endpoint: '/api/products/arrivals' },
  { id: 'new-arrivals',        title: 'New Arrivals',          endpoint: '/api/products/arrivals' },
  { id: 'shirts',              title: 'Shirts',                endpoint: '/api/products/arrivals' },
  { id: 't-shirts',            title: 'T-Shirts',              endpoint: '/api/products/arrivals' },
  { id: 'trousers',            title: 'Trousers',              endpoint: '/api/products/arrivals' },
  { id: 'hoodies-sweatshirts', title: 'Hoodies & Sweatshirts', endpoint: '/api/products/arrivals' },
]

function ProductSection({ title, sectionId, endpoint }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_URL}${endpoint}`)
      .then(res => {
        setProducts(res.data.slice(0, 4))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [endpoint])

  if (loading) return (
    <section id={sectionId} className="men-section">
      <div className="men-section-header">
        <h2 className="men-section-title">{title}</h2>
      </div>
      <div className="men-product-grid">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="men-product-card-image" style={{ opacity: 0.4 }} />
        ))}
      </div>
    </section>
  )

  return (
    <section id={sectionId} className="men-section">
      <div className="men-section-header">
        <h2 className="men-section-title">{title}</h2>
        <Link to={`/category/${sectionId}`} className="men-section-viewall">VIEW ALL</Link>
      </div>
      <div className="men-product-grid">
        {products.map(product => (
          <Link
            to={`/product/${product.Product_ID}`}
            key={product.Product_ID}
            className="men-product-card"
          >
            <div className="men-product-card-image">
              <img src={product.Image_URL} alt={product.Product_Name} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default function MenPage() {
  const [activeSlug, setActiveSlug] = useState(null)

  const handleSubNavClick = (slug) => {
    setActiveSlug(slug)
    const el = document.getElementById(slug)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="men-page">
      <nav className="men-subnav">
        <div className="men-subnav-inner">
          {SUB_CATEGORIES.map(({ label, slug }) => (
            <button
              key={slug}
              className={`men-subnav-link ${activeSlug === slug ? 'active' : ''}`}
              onClick={() => handleSubNavClick(slug)}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <HeroBanner />

      {SECTIONS.map(({ id, title, endpoint }) => (
        <ProductSection
          key={id}
          sectionId={id}
          title={title}
          endpoint={endpoint}
        />
      ))}

      <div className="men-page-spacing" />
    </div>
  )
}