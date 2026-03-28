// MenPage.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import '../styles/MenPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const SUB_CATEGORIES = [
  { label: 'T-shirts',              slug: 't-shirts' },
  { label: 'Shirts',                slug: 'shirts' },
  { label: 'Trousers',              slug: 'trousers' },
  { label: 'Hoodies & Sweatshirts', slug: 'hoodies-sweatshirts' },
]

const SECTIONS = [
  { id: 'new-arrivals',        title: 'New Arrivals',          category: 'new-arrivals' },
  { id: 'shirts',              title: 'Shirts',                category: 'shirts' },
  { id: 't-shirts',            title: 'T-Shirts',              category: 't-shirts' },
  { id: 'trousers',            title: 'Trousers',              category: 'trousers' },
  { id: 'hoodies-sweatshirts', title: 'Hoodies & Sweatshirts', category: 'hoodies-sweatshirts' },
]

function ProductSection({ title, sectionId, category }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const isNewArrivals = category === 'new-arrivals'
    const url = isNewArrivals
      ? `${API_URL}/api/products/new-arrivals`
      : `${API_URL}/api/products/filter`
    const params = isNewArrivals
      ? { type: 'Men' }
      : { type: 'Men', category: category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') }

    axios.get(url, { params })
      .then(res => { setProducts(res.data.slice(0, 4)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [category])

  return (
    <section id={sectionId} className="men-section">
      <div className="men-section-header">
        <h2 className="men-section-title">{title}</h2>
        <Link to={`/men/${sectionId}`} className="men-section-viewall">VIEW ALL</Link>
      </div>

      {!loading && products.length === 0 && (
        <p className="men-no-products">No products found.</p>
      )}

      <div className="men-product-grid">
        {loading
          ? [...Array(4)].map((_, i) => (
              <div key={i} className="men-product-card-skeleton" />
            ))
          : products.map(product => (
              <Link
                to={`/product/${product.Product_ID}`}
                key={product.Product_ID}
                className="men-product-card"
              >
                <div className="men-product-card-image">
                  <img src={product.Image_URL} alt={product.Product_Name} />
                </div>
                <div className="men-product-card-info">
                  <p className="men-product-card-name">{product.Product_Name}</p>
                  <p className="men-product-card-cat">{product.Category}</p>
                  <p className="men-product-card-price">${product.Price}</p>
                </div>
              </Link>
            ))
        }
      </div>
    </section>
  )
}

export default function MenPage() {
  return (
    <div className="men-page">

      {/* ── Sub-nav ── */}
      <div className="men-subnav-wrapper">
        <div className="men-subnav-inner">
          <span className="men-subnav-label">Men</span>
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

      {/* ── Hero Banner (static) ── */}
      <div className="men-hero">
        <div className="men-hero-overlay" />
        <div className="men-hero-text">
          <p className="men-hero-logo">WARDROBE+</p>
          <p className="men-hero-sub">MEN'S COLLECTIONS</p>
        </div>
      </div>

      {/* ── Sections ── */}
      {SECTIONS.map(({ id, title, category }) => (
        <ProductSection
          key={id}
          sectionId={id}
          title={title}
          category={category}
        />
      ))}

      <div className="men-page-spacing" />
    </div>
  )
}