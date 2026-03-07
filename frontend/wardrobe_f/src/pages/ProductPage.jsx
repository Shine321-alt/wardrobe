// ไฟล์นี้ใช้สำหรับแสดงรายละเอียดสินค้าแต่ละชิ้น โดยดึงข้อมูลจาก API
import axios from "axios"
import Announcement_Bar from '../components/Announcement_Bar'
import ProductGallery from '../components/Product/ProductGallery'
import ProductInfo from '../components/Product/ProductInfo'

import '../styles/ProductPage.css'
import { useState,useEffect } from "react"
import { useParams } from "react-router-dom"

export default function Productpage(){
    const { id } = useParams();
    const [product, setProduct] = useState(0);
    const [loading, setLoading] = useState(true);
    const [selectedImages,setSelectedImages] = useState([]);
    
    useEffect(() => { 
        axios.get(`https://fakestoreapi.com/products/${id}`)
        .then(res => {
            setProduct(res.data)
            setSelectedImages([res.data.image])
            setLoading(false)
        })
    },[id]);
    
    if (loading) return <p>Loading...</p>
    return(
        <div>
            <Announcement_Bar/>
            <div className="product">
                <ProductGallery product={product} images = {selectedImages} />
                <ProductInfo product={product} onColorChange = {setSelectedImages}/>
                
            </div>
        </div>
    )
}