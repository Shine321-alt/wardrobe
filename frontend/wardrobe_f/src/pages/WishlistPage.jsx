// ===============================
// Import React hooks และ library ที่จำเป็น
// ===============================

// useState = เก็บ state (products, loading)
// useEffect = ใช้โหลด wishlist ตอนเข้า page
import { useState, useEffect } from 'react'

// Link = ใช้เปลี่ยนหน้าแบบไม่ reload
// useNavigate = ใช้ redirect ไปหน้าอื่น
import { Link, useNavigate } from 'react-router-dom'

// axios = ใช้เรียก API backend
import axios from 'axios'

// useAuth = ใช้เช็คสถานะ login
import { useAuth } from '../context/AuthContext'

// Heart icon (รูปหัวใจ)
import { Heart } from 'lucide-react'

// import CSS
import '../styles/Wishlistpage.css'


// ===============================
// API URL
// ===============================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'


// ===============================
// Component: WishlistPage
// ===============================

// หน้านี้ใช้แสดง "สินค้าที่กดถูกใจ (Wishlist)"
export default function WishlistPage() {

    // ===============================
    // Context + Navigation
    // ===============================
    const { user } = useAuth()     // เช็คว่า login หรือยัง
    const navigate = useNavigate() // ใช้ redirect


    // ===============================
    // State
    // ===============================
    const [products, setProducts] = useState([]) // list wishlist
    const [loading, setLoading] = useState(true) // loading state


    // ==========================================
    // useEffect: โหลด wishlist
    // ==========================================
    useEffect(() => {

        // ===============================
        // ถ้ายังไม่ login → redirect
        // ===============================
        if (!user) {
            navigate('/login')
            return
        }

        // ===============================
        // เรียก API ดึง wishlist
        // ===============================
        axios.get(`${API_URL}/api/wishlist`, {
            withCredentials: true // ส่ง cookie (auth)
        })

            .then(res => setProducts(res.data)) // เก็บสินค้า

            .catch(() => setProducts([])) // error → empty

            .finally(() => setLoading(false)) // ปิด loading

    }, [user])


    // ==========================================
    // handleUnlike (ลบออกจาก wishlist)
    // ==========================================
    const handleUnlike = async (e, productId) => {

        // ป้องกัน event จาก Link
        e.preventDefault()
        e.stopPropagation()

        // ===============================
        // Optimistic UI (ลบก่อนเลย)
        // ===============================
        setProducts(prev =>
            prev.filter(p => p.Product_ID !== productId)
        )

        // ===============================
        // เรียก API เพื่อ unlike จริง
        // ===============================
        await axios.post(
            `${API_URL}/api/wishlist/${productId}`,
            {},
            { withCredentials: true }
        ).catch(() => {})
    }


    // ==========================================
    // handleAddToCart
    // ==========================================
    const handleAddToCart = (e, product) => {

        // ป้องกัน event จาก Link
        e.preventDefault()
        e.stopPropagation()

        // ไปหน้า product เพื่อเลือก size ก่อน add
        navigate(`/product/${product.Product_ID}`)
    }


    // ===============================
    // Loading state
    // ===============================
    if (loading) {
        return <div className="wishlist-loading">Loading...</div>
    }


    // ===============================
    // UI
    // ===============================
    return (

        <section className="wishlist-section">


            {/* ==========================================
               Header
            ========================================== */}
            <div className="wishlist-header">

                <h1 className="wishlist-title">Wishlist</h1>

                {/* จำนวนสินค้า */}
                <span className="wishlist-count">
                    {products.length} items
                </span>
            </div>


            {/* ==========================================
               Empty state
            ========================================== */}
            {products.length === 0 ? (

                <div className="wishlist-empty">

                    <p>No items in your wishlist.</p>

                    {/* ปุ่มไปหน้า home */}
                    <Link to="/" className="wishlist-shop-btn">
                        SHOP NOW
                    </Link>
                </div>

            ) : (

                // ==========================================
                // Grid สินค้า
                // ==========================================
                <div className="wishlist-grid">

                    {products.map(product => (

                        // card สินค้าแต่ละตัว
                        <div
                            key={product.Product_ID}
                            className="wishlist-card"
                        >

                            {/* ===============================
                               ปุ่มหัวใจ (unlike)
                            =============================== */}
                            <button
                                className="wishlist-heart"
                                onClick={(e) => handleUnlike(e, product.Product_ID)}
                            >
                                <Heart
                                    size={18}
                                    fill="#ef4444"
                                    color="#ef4444"
                                />
                            </button>


                            {/* ===============================
                               Link ไปหน้า product
                            =============================== */}
                            <Link
                                to={`/product/${product.Product_ID}`}
                                className="wishlist-card-link"
                            >

                                {/* รูปสินค้า */}
                                <div className="wishlist-card-image">
                                    <img
                                        src={product.Image_URL}
                                        alt={product.Product_Name}
                                    />
                                </div>


                                {/* ข้อมูลสินค้า */}
                                <div className="wishlist-card-info">

                                    {/* ชื่อ + ราคา */}
                                    <div className="wishlist-card-row">

                                        <p className="wishlist-card-name">
                                            {product.Product_Name}
                                        </p>

                                        <p className="wishlist-card-price">
                                            ${product.Price}
                                        </p>
                                    </div>

                                    {/* category */}
                                    <p className="wishlist-card-category">
                                        {product.Category}
                                    </p>
                                </div>

                            </Link>


                            {/* ===============================
                               ปุ่ม Add to Cart
                            =============================== */}
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