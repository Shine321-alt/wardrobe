import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import axios from 'axios'                        
import '../styles/ProductGrid.css'



export default function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("https://fakestoreapi.com/products/category/men's clothing")
      .then(res => {
        setProducts(res.data)                    
        setLoading(false)
      })
  }, []);

  if (loading) return <p>Loading...</p>

  return (
    <section className="product-section">

      <div className="product-header">
        <h2 className="product-title">New Arrivals</h2>
        <Link to="/new" className="product-viewall">VIEW ALL</Link>
      </div>

      <div className="product-grid">
        {products.map(product => (
          <Link
            to={`/product/${product.id}`}
            key={product.id}
            className="product-card"
          >
            <div className="product-card-image">
              <img src={product.image} alt={product.title} />
              <button className="product-wishlist">
                <Heart size={13} />
              </button>
            </div>

            <div className="product-info">
              <p className="product-name">{product.title}</p>
              <p className="product-price">${product.price}</p>
            </div>
          </Link>
        ))}
      </div>

    </section>
  )
}