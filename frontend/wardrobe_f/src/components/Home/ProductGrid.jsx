import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import '../../styles/ProductGrid.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ProductGrid() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`${API_URL}/api/products/arrivals`)
      .then(res => {
        setProducts(res.data)
        setLoading(false)
      })
  }, [])

  if (loading) return <p className="product-loading">Loading...</p>

  return (
    <section className="product-section">

      <div className="product-header">
        <h2 className="product-title">New Arrivals</h2>
        <Link to="/new" className="product-viewall">VIEW ALL</Link>
      </div>

      <div className="product-grid">
        {products.map(product => (
          <Link
            to={`/product/${product.Product_ID}`}
            key={product.Product_ID}
            className="product-card"
          >
            <div className="product-card-image">
              <img src={product.Image_URL} alt={product.Product_Name} />
            </div>
          </Link>
        ))}
      </div>

    </section>
  )
}