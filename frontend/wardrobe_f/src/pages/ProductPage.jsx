import axios from "axios"
import Announcement_Bar from '../components/Announcement_Bar'
import ProductGallery from '../components/Product/ProductGallery'
import ProductInfo from '../components/Product/ProductInfo'
import '../styles/ProductPage.css'
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useCart } from "../context/CartContext"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"

export default function ProductPage() {
    const { id } = useParams()

    const [product, setProduct] = useState(null)       // ข้อมูลทั้งหมด
    const [gallery, setGallery] = useState([])         // รูป gallery

    const [selectedColorId, setSelectedColorId] = useState(null)
    const [selectedSizeId, setSelectedSizeId] = useState(null)

    const navigate = useNavigate()
    const { user } = useAuth()
    const { addToCart } = useCart()

    // ✅ fetch ครั้งเดียวได้ทุกอย่าง
    useEffect(() => {
        axios.get(`${API_URL}/api/products/${id}`)
            .then(res => {
                const data = res.data
                setProduct(data)

                // auto เลือกสีแรกที่มีของ
                const firstColor = data.colors.find(c =>
                    c.sizes.some(s => s.Stock > 0)
                ) || data.colors[0]

                setSelectedColorId(firstColor.Color_ID)

                // auto เลือกไซส์แรกที่มีของ
                const firstSize = firstColor.sizes.find(s => s.Stock > 0)
                if (firstSize) setSelectedSizeId(firstSize.Size_ID)
            })
    }, [id])

    // โหลดรูป gallery เมื่อเปลี่ยนสี
    useEffect(() => {
        if (!selectedColorId) return

        
        axios.get(`${API_URL}/api/products/${id}/images/${selectedColorId}`)
            .then(res => setGallery(res.data))
    }, [id, selectedColorId])

    if (!product) return <p>Loading...</p>

    // หา colors และ sizes จาก product ที่โหลดมาแล้ว (ไม่ fetch ใหม่)
    const colors = product.colors
    const selectedColor = colors.find(c => c.Color_ID === selectedColorId)
    const sizes = selectedColor?.sizes || []
    const selectedSize = sizes.find(s => s.Size_ID === selectedSizeId)

    const handleColorChange = (colorId) => {
        setSelectedColorId(colorId)
        setSelectedSizeId(null)

        // auto เลือกไซส์แรกของสีใหม่
        const newColor = colors.find(c => c.Color_ID === colorId)
        const firstSize = newColor?.sizes.find(s => s.Stock > 0)
        if (firstSize) setSelectedSizeId(firstSize.Size_ID)
    }

    // หา Variant_ID ที่ตรง color + size ที่เลือก
    const selectedVariant = selectedColor?.sizes.find(s => s.Size_ID === selectedSizeId)
 
    const handleAddToCart = () => {
        if (!user) {
            navigate('/login')
            return
        }
        if (!selectedVariant?.Variant_ID) return
        addToCart(selectedVariant.Variant_ID, 1)
    }

    return (
        <div>
            <Announcement_Bar />
            <div className="product">
                <ProductGallery gallery={gallery} productId={Number(id)} />
                <ProductInfo
                    product={product}
                    colors={colors}
                    sizes={sizes}
                    selectedColorId={selectedColorId}
                    selectedSizeId={selectedSizeId}
                    selectedSize={selectedSize}
                    setSelectedColorId={handleColorChange}
                    setSelectedSizeId={setSelectedSizeId}
                    onAddToCart={handleAddToCart}
                />
            </div>
        </div>
    )
}