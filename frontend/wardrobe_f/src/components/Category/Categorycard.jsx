// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// useState = ใช้เก็บ state ภายใน component
// useEffect = ใช้ทำงานเมื่อ component ถูก render (เช่น ตอน mount)
import { useState, useEffect } from 'react'

// Link = ใช้เปลี่ยนหน้าแบบไม่ reload
// useNavigate = ใช้ redirect ไปหน้าอื่น
import { Link, useNavigate } from 'react-router-dom'

// icon รูปหัวใจ (wishlist)
import { Heart } from 'lucide-react'

// axios = ใช้เรียก API ไป backend
import axios from 'axios'

// context สำหรับข้อมูล user (login หรือยัง)
import { useAuth } from '../../context/AuthContext'


// ===============================
// กำหนด URL ของ backend
// ===============================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'


// ===============================
// Component: CategoryCard
// ===============================
// รับ props = product (ข้อมูลสินค้าแต่ละตัว)
export default function CategoryCard({ product }) {

    // ดึงข้อมูล user จาก context
    const { user } = useAuth()

    // ใช้ redirect
    const navigate = useNavigate()

    // state สำหรับเก็บสถานะว่า like หรือยัง
    const [liked, setLiked] = useState(false)


    // ==========================================
    // โหลดสถานะ wishlist ตอน component mount
    // ==========================================
    useEffect(() => {

        // ถ้ายังไม่ login → ไม่ต้องเรียก API
        if (!user) return

        // เรียก backend เพื่อตรวจสอบว่า product นี้ถูก like ไหม
        axios.get(`${API_URL}/api/wishlist/${product.Product_ID}`, {

            // ส่ง cookie (สำคัญสำหรับ auth)
            withCredentials: true

        })
        .then(res => {
            // set ค่า liked ตาม backend
            setLiked(res.data.liked)
        })
        .catch(() => {
            // ถ้า error ไม่ต้องทำอะไร (fail silently)
        })

    // dependency → ถ้า product หรือ user เปลี่ยน จะเรียกใหม่
    }, [product.Product_ID, user])


    // ==========================================
    // handleWishlist: กดหัวใจ (like/unlike)
    // ==========================================
    const handleWishlist = (e) => {

        // ป้องกันไม่ให้ click ไป trigger Link (ไม่ให้เปลี่ยนหน้า)
        e.preventDefault()

        // ป้องกัน event bubbling
        e.stopPropagation()

        // ถ้ายังไม่ login → redirect ไป login
        if (!user) { 
            navigate('/login'); 
            return 
        }

        // ===============================
        // Optimistic UI
        // ===============================

        // เปลี่ยน UI ทันที (ไม่ต้องรอ backend)
        setLiked(prev => !prev)

        // ===============================
        // เรียก backend เพื่อ toggle wishlist
        // ===============================
        axios.post(
            `${API_URL}/api/wishlist/${product.Product_ID}`, 
            {}, // ไม่มี body
            { withCredentials: true } // ส่ง cookie
        )
        .then(res => {
            // sync ค่า liked กับ backend
            setLiked(res.data.liked)
        })
        .catch(() => {
            // ถ้า error → revert UI กลับค่าเดิม
            setLiked(prev => !prev)
        })
    }


    // ===============================
    // UI (สิ่งที่ user เห็น)
    // ===============================
    return (

        // card ของสินค้าแต่ละตัว
        <div className="category-card">

            {/* ==========================================
               ปุ่มหัวใจ (wishlist)
            ========================================== */}
            <button 
                className="category-heart" 
                onClick={handleWishlist}
            >
                <Heart
                    size={16}

                    // ถ้า liked → เติมสีแดง
                    fill={liked ? '#ef4444' : 'none'}

                    // เปลี่ยนสีเส้น
                    color={liked ? '#ef4444' : 'currentColor'}
                />
            </button>


            {/* ==========================================
               กด card → ไปหน้า product detail
            ========================================== */}
            <Link 
                to={`/product/${product.Product_ID}`} 
                className="category-card-link"
            >

                {/* ===============================
                   รูปสินค้า
                =============================== */}
                <div className="category-card-image">

                    {/* src = URL ของรูป */}
                    {/* alt = ชื่อสินค้า (SEO + accessibility) */}
                    <img 
                        src={product.Image_URL} 
                        alt={product.Product_Name} 
                    />
                </div>


                {/* ===============================
                   ข้อมูลสินค้า
                =============================== */}
                <div className="category-card-info">

                    {/* ชื่อสินค้า */}
                    <p className="category-card-name">
                        {product.Product_Name}
                    </p>

                    {/* หมวดหมู่ */}
                    <p className="category-card-category">
                        {product.Category}
                    </p>

                    {/* ราคา */}
                    <p className="category-card-price">
                        ${product.Price}
                    </p>
                </div>

            </Link>
        </div>
    )
}