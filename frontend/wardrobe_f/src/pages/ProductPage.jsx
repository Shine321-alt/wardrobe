// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// axios = ใช้เรียก API backend
import axios from "axios"

// Announcement_Bar = แถบโปรโมชั่นด้านบน
import Announcement_Bar from '../components/Announcement_Bar'

// ProductGallery = แสดงรูปสินค้า (หลายมุม)
import ProductGallery from '../components/Product/ProductGallery'

// ProductInfo = แสดงรายละเอียดสินค้า + ปุ่มเลือกสี/ไซส์
import ProductInfo from '../components/Product/ProductInfo'

// import CSS
import '../styles/ProductPage.css'

// React hooks
import { useState, useEffect } from "react"

// useParams = ดึง id จาก URL (/product/:id)
// useNavigate = redirect ไปหน้าอื่น
import { useParams, useNavigate } from "react-router-dom"

// context
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"


// ===============================
// API URL
// ===============================
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"


// ===============================
// Component: ProductPage
// ===============================
export default function ProductPage() {

    // ===============================
    // ดึง product id จาก URL
    // ===============================
    const { id } = useParams()


    // ===============================
    // State
    // ===============================

    // product = ข้อมูลทั้งหมดของสินค้า
    const [product, setProduct] = useState(null)

    // gallery = รูปภาพของสินค้า
    const [gallery, setGallery] = useState([])

    // สีที่เลือก
    const [selectedColorId, setSelectedColorId] = useState(null)

    // ไซส์ที่เลือก
    const [selectedSizeId, setSelectedSizeId] = useState(null)


    // ===============================
    // Context + Navigation
    // ===============================
    const navigate = useNavigate()

    // user (เช็ค login)
    const { user } = useAuth()

    // addToCart function
    const { addToCart } = useCart()


    // ==========================================
    // useEffect: โหลดข้อมูลสินค้า
    // ==========================================
    useEffect(() => {

        axios.get(`${API_URL}/api/products/${id}`)

            .then(res => {

                const data = res.data

                // เก็บข้อมูลสินค้า
                setProduct(data)


                // ===============================
                // auto เลือก "สีแรกที่มีของ"
                // ===============================
                const firstColor = data.colors.find(c =>
                    c.sizes.some(s => s.Stock > 0)
                ) || data.colors[0]

                setSelectedColorId(firstColor.Color_ID)


                // ===============================
                // auto เลือก "ไซส์แรกที่มีของ"
                // ===============================
                const firstSize = firstColor.sizes.find(s => s.Stock > 0)

                if (firstSize) {
                    setSelectedSizeId(firstSize.Size_ID)
                }
            })

    }, [id])


    // ==========================================
    // useEffect: โหลดรูป gallery เมื่อเปลี่ยนสี
    // ==========================================
    useEffect(() => {

        // ถ้ายังไม่เลือกสี → ไม่ทำ
        if (!selectedColorId) return

        // เรียก API เพื่อดึงรูปของสีนั้น
        axios.get(`${API_URL}/api/products/${id}/images/${selectedColorId}`)
            .then(res => setGallery(res.data))

    }, [id, selectedColorId])


    // ===============================
    // Loading state
    // ===============================
    if (!product) {
        return <p className="product-loading">Loading...</p>
    }


    // ===============================
    // เตรียมข้อมูลสำหรับ UI
    // ===============================

    // list สีทั้งหมด
    const colors = product.colors

    // สีที่เลือกอยู่
    const selectedColor = colors.find(c => c.Color_ID === selectedColorId)

    // list ไซส์ของสีนั้น
    const sizes = selectedColor?.sizes || []

    // ไซส์ที่เลือก
    const selectedSize = sizes.find(s => s.Size_ID === selectedSizeId)


    // ==========================================
    // handle เปลี่ยนสี
    // ==========================================
    const handleColorChange = (colorId) => {

        // เปลี่ยนสี
        setSelectedColorId(colorId)

        // reset size
        setSelectedSizeId(null)


        // auto เลือกไซส์แรกของสีใหม่
        const newColor = colors.find(c => c.Color_ID === colorId)

        const firstSize = newColor?.sizes.find(s => s.Stock > 0)

        if (firstSize) {
            setSelectedSizeId(firstSize.Size_ID)
        }
    }


    // ==========================================
    // หา Variant ที่เลือก (color + size)
    // ==========================================
    const selectedVariant = selectedColor?.sizes.find(
        s => s.Size_ID === selectedSizeId
    )


    // ==========================================
    // handle Add To Cart
    // ==========================================
    const handleAddToCart = async () => {

        // ถ้ายังไม่ login → ไปหน้า login
        if (!user) {
            navigate('/login')
            return
        }

        // ถ้ายังไม่มี variant → ไม่ทำ
        if (!selectedVariant?.Variant_ID) return

        // ===============================
        // เพิ่มสินค้าเข้า cart
        // ===============================
        await addToCart(selectedVariant.Variant_ID, 1)

        // ===============================
        // ไปหน้า cart
        // ===============================
        navigate('/cart')
    }


    // ===============================
    // UI
    // ===============================
    return (
        <div>

            {/* ==========================================
               Announcement Bar
            ========================================== */}
            <Announcement_Bar />


            {/* ==========================================
               Product Layout
            ========================================== */}
            <div className="product">

                {/* ===============================
                   รูปสินค้า
                =============================== */}
                <ProductGallery
                    gallery={gallery}
                    productId={Number(id)}
                />


                {/* ===============================
                   ข้อมูลสินค้า
                =============================== */}
                <ProductInfo
                    product={product}
                    colors={colors}
                    sizes={sizes}
                    selectedColorId={selectedColorId}
                    selectedSizeId={selectedSizeId}
                    selectedSize={selectedSize}

                    // ส่ง function ไปให้ component ลูก
                    setSelectedColorId={handleColorChange}
                    setSelectedSizeId={setSelectedSizeId}

                    // ปุ่ม Add to Cart
                    onAddToCart={handleAddToCart}
                />
            </div>
        </div>
    )
}