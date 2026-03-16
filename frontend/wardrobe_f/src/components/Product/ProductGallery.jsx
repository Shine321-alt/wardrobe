import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import '../../styles/ProductGallery.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ProductGallery({ gallery, productId }) {
    const [current, setCurrent] = useState(0) //ตอนนี้รูปที่เท่าไหร่
    const [liked, setLiked] = useState(false)  //สถานะหัวใจ
    const { user } = useAuth()
    const navigate = useNavigate()

    // reset กลับรูปแรกเมื่อเปลี่ยนสี
    useEffect(() => {
        setCurrent(0)
    }, [gallery])

    // โหลดสถานะ like เมื่อเปิดProductPageหน้า
    useEffect(() => {
    if (!productId || !Number(productId)) return  // ← guard
    axios.get(`${API_URL}/api/wishlist/${productId}`, { withCredentials: true })
        .then(res => setLiked(res.data.liked))
        .catch(() => setLiked(false))
}, [productId])

const handleWishlist = () => {
    if (!user) { navigate('/login'); return }
    if (!productId || !Number(productId)) return  // ← guard

    setLiked(prev => !prev)
    axios.post(`${API_URL}/api/wishlist/${productId}`, {}, { withCredentials: true })
        .then(res => setLiked(res.data.liked))
        .catch(err => console.log('wishlist error:', err.response))
}




    if (!gallery || gallery.length === 0) return <p>Loading...</p>

    const prev = () => setCurrent(i => (i - 1 + gallery.length) % gallery.length)
    const next = () => setCurrent(i => (i + 1) % gallery.length)


    return (
        <div className="gallery-sticky">
            <div className='gallery-product'>

                <div className='photo'>
                    <img src={gallery[current]} alt="product" />
                </div>

                {/* ปุ่มหัวใจ — filled ถ้า liked */}
                <button 
                    className={`gallery-wishlist ${liked ? 'gallery-wishlist--active' : ''}`}
                    onClick={handleWishlist}
                >
                    <Heart 
                        size={13} 
                        fill={liked ? '#ef4444' : 'none'}       
                        color={liked ? '#ef4444' : 'currentColor'} 
                    />

                </button>

                <div className="gallery-btns">
                    <button className='gallery-btn--prev' onClick={prev}>
                        <ChevronLeft size={18} />
                    </button>
                    <button className='gallery-btn--next' onClick={next}>
                        <ChevronRight size={18} />
                    </button>
                </div>

            </div>
        </div>
    )
}