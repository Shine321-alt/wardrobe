// NewPage.jsx — New Arrivals across all types
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import '../styles/MenPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const TYPES = [
  { label: 'Men',   type: 'Men' },
  { label: 'Women', type: 'Women' },
  { label: 'Kid',   type: 'Kid' },
]

function NewSection({ title, type }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    axios.get(`${API_URL}/api/products/new-arrivals`, { params: { type } })
      .then(res => { setProducts(res.data.slice(0, 4)); setLoading(false) })
      .catch(() => setLoading(false))
  }, [type])

  if (!loading && products.length === 0) return null

  return (
    <section className="men-section">
      <div className="men-section-header">
        <h2 className="men-section-title">{title}</h2>
      </div>
      <div className="men-product-grid">
        {loading
          ? [...Array(4)].map((_, i) => <div key={i} className="men-product-card-skeleton" />)
          : products.map(p => (
              <Link to={`/product/${p.Product_ID}`} key={p.Product_ID} className="men-product-card">
                <div className="men-product-card-image">
                  <img src={p.Image_URL} alt={p.Product_Name} />
                </div>
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

export default function NewPage() {
  return (
    <div className="men-page">
      {/* Hero */}
      <div className="men-hero">
        <div className="men-hero-overlay" />
        <div className="men-hero-text">
          <p className="men-hero-logo">WARDROBE+</p>
          <p className="men-hero-sub">NEW ARRIVALS</p>
        </div>
      </div>

      {TYPES.map(({ label, type }) => (
        <NewSection key={type} title={label} type={type} />
      ))}

      <div className="men-page-spacing" />
    </div>
  )
}