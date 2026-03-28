import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axios from 'axios'
import CategoryCard from '../components/Category/Categorycard'
import '../styles/Categorypage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// แปลง slug → ชื่อจริง เช่น "t-shirts" → "T-Shirts"
const slugToLabel = (slug) =>
    slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-')

// mapping พิเศษสำหรับ slug ที่มีอักขระพิเศษ เช่น &
const slugMap = {
    'hoodies-&-sweatshirts': 'Hoodies & Sweatshirts',
}

// Hero banner รูปตาม type/category
const heroBannerMap = {
    'men/hoodies-&-sweatshirts': 'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774696753/menHoodieshero-banner_zmgohg.png',
    'men/trousers':              'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774696754/mentrouserherobanner_qeg1qb.png',
    'men/shirts':                'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774696753/MENShirtsherobanner_lbtjut.png',
    'men/t-shirts':              'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774696753/MEN_T-shirtsherobanner_lqm3lj.png',
    'men/new-arrivals':          'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774696753/MEN-Arivalsherobanne_yqcvn8.png',
}

export default function CategoryPage() {
    const { type, category } = useParams()

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    const typeLabel = slugToLabel(type)
    const categoryLabel = slugMap[category] || slugToLabel(category)
    const heroBanner = heroBannerMap[`${type}/${category}`] || null

    const isNewArrivals = category === 'new-arrivals'
    const isBestSellers = category === 'best-sellers'
    const isLatestDrops = category === 'latest-drops'
    const isEssentials  = category === 'essentials'
    const isNewSeason   = category === 'new-season'
    const isLimited     = category === 'limited'

    useEffect(() => {
        setLoading(true)
        setProducts([])

        let url = ''
        let params = {}

        if (isNewArrivals) {
            url = `${API_URL}/api/products/new-arrivals`
            params = { type: typeLabel }
        } else if (isBestSellers || isLatestDrops || isEssentials || isNewSeason || isLimited) {
            setProducts([])
            setLoading(false)
            return
        } else {
            url = `${API_URL}/api/products/filter`
            params = { type: typeLabel, category: categoryLabel }
        }

        axios.get(url, { params })
            .then(res => setProducts(res.data))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false))

    }, [type, category])

    return (
        <div>
            {/* Hero Banner — อยู่นอก section เพื่อให้เต็มจอ ไม่ติด max-width */}
            {heroBanner && (
                <div className="category-hero">
                    <img src={heroBanner} alt={categoryLabel} />
                </div>
            )}

            {/* Content — มี max-width และ padding */}
            <section className="category-section">

                <div className="category-header">
                    <p className="category-breadcrumb">{typeLabel} / {categoryLabel}</p>
                    <h1 className="category-title">{categoryLabel}</h1>
                    <p className="category-count">{products.length} products</p>
                </div>

                {loading && <div className="category-loading">Loading...</div>}

                {!loading && products.length === 0 && (
                    <div className="category-empty">
                        <p>No products found.</p>
                        <Link to="/" className="category-shop-btn">BACK TO HOME</Link>
                    </div>
                )}

                {!loading && products.length > 0 && (
                    <div className="category-grid">
                        {products.map(product => (
                            <CategoryCard key={product.Product_ID} product={product} />
                        ))}
                    </div>
                )}

            </section>
        </div>
    )
}