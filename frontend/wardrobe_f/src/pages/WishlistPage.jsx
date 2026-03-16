import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { Heart } from 'lucide-react'
import '../styles/Wishlistpage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function WishlistPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // ถ้ายังไม่ login → พาไป /login
        if (!user) {
            navigate('/login')
            return
        }

        // ดึง wishlist ทั้งหมดของ user
        axios.get(`${API_URL}/api/wishlist`, { withCredentials: true })
            .then(res => setProducts(res.data))
            .catch(() => setProducts([]))
            .finally(() => setLoading(false))
    }, [user])

    // unlike แล้วเอาออกจาก list ทันที (optimistic)
    const handleUnlike = async (e, productId) => {
        e.preventDefault()
        e.stopPropagation()
        setProducts(prev => prev.filter(p => p.Product_ID !== productId))
        await axios.post(`${API_URL}/api/wishlist/${productId}`, {}, {
            withCredentials: true
        }).catch(() => {})
    }

    // TODO: เพิ่ม add to cart logic ตรงนี้
    const handleAddToCart = (e, product) => {
        e.preventDefault()
        e.stopPropagation()
    }

    if (loading) return <div className="wishlist-loading">Loading...</div>

    return (
        <section className="wishlist-section">

            <div className="wishlist-header">
                <h1 className="wishlist-title">Wishlist</h1>
                <span className="wishlist-count">{products.length} items</span>
            </div>

            {products.length === 0 ? (
                <div className="wishlist-empty">
                    <p>No items in your wishlist.</p>
                    <Link to="/" className="wishlist-shop-btn">SHOP NOW</Link>
                </div>
            ) : (
                <div className="wishlist-grid">
                    {products.map(product => (
                        // wrapper div — position: relative สำหรับหัวใจ
                        <div key={product.Product_ID} className="wishlist-card">

                            {/* ปุ่มหัวใจ — กดเพื่อ unlike */}
                            <button
                                className="wishlist-heart"
                                onClick={(e) => handleUnlike(e, product.Product_ID)}
                            >
                                <Heart size={18} fill="#ef4444" color="#ef4444" />
                            </button>

                            {/* กดรูปหรือชื่อ → ไปหน้า product */}
                            <Link to={`/product/${product.Product_ID}`} className="wishlist-card-link">

                                {/* รูปสินค้า */}
                                <div className="wishlist-card-image">
                                    <img src={product.Image_URL} alt={product.Product_Name} />
                                </div>

                                {/* ข้อมูลสินค้า */}
                                <div className="wishlist-card-info">
                                    {/* ชื่อ + ราคา อยู่แถวเดียวกัน */}
                                    <div className="wishlist-card-row">
                                        <p className="wishlist-card-name">{product.Product_Name}</p>
                                        <p className="wishlist-card-price">${product.Price}</p>
                                    </div>
                                    <p className="wishlist-card-category">{product.Category}</p>
                                </div>

                            </Link>

                            {/* Add to Cart — อยู่นอก Link */}
                            <div className="wishlist-card-action">
                                <button
                                    className="wishlist-add-btn"
                                    onClick={(e) => handleAddToCart(e, product)}
                                >
                                    Add to Cart
                                </button>
                            </div>

                        </div>
                    ))}
                </div>
            )}

        </section>
    )
}