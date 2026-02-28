import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import '../styles/CollectionGrid.css'

const collections = [
  { id: 1, label: 'T-SHIRTS', to: '/category/t-shirts',
    imageUrl: 'https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600&q=80' },
  { id: 2, label: 'SHIRTS', to: '/category/shirts',
    imageUrl: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80' },
  { id: 3, label: 'TROUSERS', to: '/category/trousers',
    imageUrl: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80' },
  { id: 4, label: 'HOODIES & SWEATSHIRTS', to: '/category/hoodies',
    imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80' },
]

export default function CollectionGrid() {
  return (
    <section className="collection-section">

      <h2 className="collection-title">Collections</h2>

      <div className="collection-grid">
        {collections.map(col => (
          <Link key={col.id} to={col.to} className="collection-card">

            <img src={col.imageUrl} alt={col.label} />

            <div className="collection-overlay" />

            <div className="collection-label">
              <span>{col.label}</span>
              <ArrowRight size={18} className="collection-arrow" />
            </div>

          </Link>
        ))}
      </div>

    </section>
  )
}