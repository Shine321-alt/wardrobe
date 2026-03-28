// SearchPage.jsx — หน้าแสดงผลการค้นหา
import { useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import CategoryCard from '../components/Category/Categorycard'
import '../styles/SearchPage.css'
import Announcement_Bar from '../components/Announcement_Bar'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function SearchPage() {
    const [searchParams] = useSearchParams()
    const q = searchParams.get('q') || ''

    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!q.trim()) {
            setProducts([])
            return
        }

        setLoading(true)
        axios.get(`${API_URL}/api/search`, { params: { q } })
            .then(res => setProducts(res.data))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false))

    }, [q])

    return (
         <div>
            <Announcement_Bar />
            <section className="search-section">

                {/* Header */}
                <div className="search-header">
                    <h1 className="search-title">
                        {q ? `Results for "${q}"` : 'Search'}
                    </h1>
                    {!loading && (
                        <p className="search-count">{products.length} products</p>
                    )}
                </div>

                {/* Loading */}
                {loading && <div className="search-loading">Searching...</div>}

                {/* Empty */}
                {!loading && q && products.length === 0 && (
                    <div className="search-empty">
                        <p>No products found for "{q}"</p>
                    </div>
                )}

                {/* Grid */}
                {!loading && products.length > 0 && (
                    <div className="search-grid">
                        {products.map(product => (
                            <CategoryCard key={product.Product_ID} product={product} />
                        ))}
                    </div>
                )}

            </section>
        </div>
    )
}