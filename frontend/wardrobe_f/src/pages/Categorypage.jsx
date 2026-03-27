import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import CategoryCard from '../components/Category/Categorycard'
import '../styles/Categorypage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// แปลง slug กลับเป็นชื่อจริง เช่น "t-shirts" → "T-Shirts"
const slugToLabel = (slug) =>
    slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

export default function CategoryPage() {
    const { type, category } = useParams()
    // type = "men", category = "new-arrivals" หรือ "t-shirts"

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    const typeLabel = slugToLabel(type)         // "Men"
    const categoryLabel = slugToLabel(category) // "New Arrivals" หรือ "T-Shirts"

    // เช็คว่า category พิเศษหรือเปล่า
    const isNewArrivals = category === 'new-arrivals'
    const isBestSellers = category === 'best-sellers'   // ยังไม่ได้ทำ
    const isLatestDrops = category === 'latest-drops'   // ยังไม่ได้ทำ
    const isEssentials = category === 'essentials'
    const isNewSeason = category === 'newseason'
    const isLimited = category === 'limited'

    useEffect(() => {
        setLoading(true)
        setProducts([])

        let url = ''
        let params = {}

        if (isNewArrivals) {
            // ดึง 12 product ล่าสุดของ type นั้น
            url = `${API_URL}/api/products/new-arrivals`
            params = { type: typeLabel }
        } else if (isBestSellers || isLatestDrops || isEssentials || isNewSeason || isLimited) {
            // TODO: ยังไม่ได้ทำ → แสดง empty ไปก่อน
            setProducts([])
            setLoading(false)
            return
        } else {
            // ดึง product ตาม type + category ปกติ
            url = `${API_URL}/api/products/filter`
            params = { type: typeLabel, category: categoryLabel }
        }

        axios.get(url, { params })
            .then(res => setProducts(res.data))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false))

    }, [type, category])

    return (
        <section className="category-section">

            {/* Header */}
            <div className="category-header">
                <p className="category-breadcrumb">{typeLabel} / {categoryLabel}</p>
                <h1 className="category-title">{categoryLabel}</h1>
                <p className="category-count">{products.length} products</p>
            </div>

            {/* Loading */}
            {loading && <div className="category-loading">Loading...</div>}

            {/* Empty */}
            {!loading && products.length === 0 && (
                <div className="category-empty">
                    <p>No products found.</p>
                    <Link to="/" className="category-shop-btn">BACK TO HOME</Link>
                </div>
            )}

            {/* Grid */}
            {!loading && products.length > 0 && (
                <div className="category-grid">
                    {products.map(product => (
                        <CategoryCard key={product.Product_ID} product={product} />
                    ))}
                </div>
            )}

        </section>
    )
}