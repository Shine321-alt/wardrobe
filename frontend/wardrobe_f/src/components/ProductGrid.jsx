import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import '../styles/ProductGrid.css'

const newArrivals = [
  { id: 1, name: 'Baggy Cargo Pants', price: 1290, tag: 'NEW',
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80' },
  { id: 2, name: 'Wide Leg Jeans', price: 1590, tag: 'NEW',
    imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80' },
  { id: 3, name: 'Overdyed Trousers', price: 1190, tag: 'HOT',
    imageUrl: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=400&q=80' },
  { id: 4, name: 'Washed Flare Pants', price: 1390, tag: 'NEW',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4f6a?w=400&q=80' },
  { id: 5, name: 'Cuban Collar Shirt', price: 990, tag: 'NEW',
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&q=80' },
  { id: 6, name: 'Polo Knit Top', price: 890, tag: 'HOT',
    imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80' },
  { id: 7, name: 'Vintage Varsity Jacket', price: 2490, tag: 'LIMITED',
    imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80' },
  { id: 8, name: 'Patchwork Hoodie', price: 1890, tag: 'NEW',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80' },
]

const tagClass = {
  NEW: 'product-tag--new',
  HOT: 'product-tag--hot',
  LIMITED: 'product-tag--limited',
}

export default function ProductGrid() {
  return (
    <section className="product-section">

      {/* Header */}
      <div className="product-header">
        <h2 className="product-title">New Arrivals</h2>
        <Link to="/new" className="product-viewall">VIEW ALL</Link>
      </div>

      {/* Grid */}
      <div className="product-grid">
        {newArrivals.map(product => (
          <div key={product.id} className="product-card">

            <div className="product-card-image">
              <img src={product.imageUrl} alt={product.name} />

              <span className={`product-tag ${tagClass[product.tag]}`}>
                {product.tag}
              </span>

              <button className="product-wishlist">
                <Heart size={13} />
              </button>
            </div>

            <div className="product-info">
              <p className="product-name">{product.name}</p>
              <p className="product-price">฿{product.price.toLocaleString()}</p>
            </div>

          </div>
        ))}
      </div>

    </section>
  )
}