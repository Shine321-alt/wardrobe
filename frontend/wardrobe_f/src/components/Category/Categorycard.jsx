import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function CategoryCard({ product }) {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [liked, setLiked] = useState(false)

    // โหลดสถานะ like ตอน mount
    useEffect(() => {
        if (!user) return
        axios.get(`${API_URL}/api/wishlist/${product.Product_ID}`, { withCredentials: true })
            .then(res => setLiked(res.data.liked))
            .catch(() => {})
    }, [product.Product_ID, user])

    // กดหัวใจ — toggle like/unlike
    const handleWishlist = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!user) { navigate('/login'); return }

        setLiked(prev => !prev) // optimistic update
        axios.post(`${API_URL}/api/wishlist/${product.Product_ID}`, {}, { withCredentials: true })
            .then(res => setLiked(res.data.liked))
            .catch(() => setLiked(prev => !prev)) // revert ถ้า error
    }

    return (
        <div className="category-card">

            {/* ปุ่มหัวใจ */}
            <button className="category-heart" onClick={handleWishlist}>
                <Heart
                    size={16}
                    fill={liked ? '#ef4444' : 'none'}
                    color={liked ? '#ef4444' : 'currentColor'}
                />
            </button>

            {/* กดรูป → ไปหน้า product */}
            <Link to={`/product/${product.Product_ID}`} className="category-card-link">

                {/* รูปสินค้า */}
                <div className="category-card-image">
                    <img src={product.Image_URL} alt={product.Product_Name} />
                </div>

                {/* ข้อมูลสินค้า */}
                <div className="category-card-info">
                    <p className="category-card-name">{product.Product_Name}</p>
                    <p className="category-card-category">{product.Category}</p>
                    <p className="category-card-price">${product.Price}</p>
                </div>

            </Link>
        </div>
    )
}