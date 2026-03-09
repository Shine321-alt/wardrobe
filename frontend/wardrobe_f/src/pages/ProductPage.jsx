// ไฟล์นี้ใช้สำหรับแสดงรายละเอียดสินค้าแต่ละชิ้น โดยดึงข้อมูลจาก API
import axios from "axios"
import Announcement_Bar from '../components/Announcement_Bar'
import ProductGallery from '../components/Product/ProductGallery'
import ProductInfo from '../components/Product/ProductInfo'

import '../styles/ProductPage.css'
import { useState,useEffect } from "react"
import { useParams } from "react-router-dom"
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export default function Productpage(){
    const { id } = useParams();
    const [product, setProduct] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);

    const onSelectedIndexChange = (idx) => {
        setSelectedIndex(idx);
    }
    
    useEffect(() => { 
        axios.get(`${API_URL}/api/products/details/${id}`)
        .then(res => {
            setProduct(res.data)
            const firstAvailableIndex = res.data.findIndex(item => item.Stock > 0)
            if(firstAvailableIndex !== -1){
                setSelectedIndex(firstAvailableIndex)
            }else{
                setSelectedIndex(null)
            }
            setLoading(false)
        })
    },[id]);
    
    if (loading) return <p>Loading...</p>
    return(
        <div>
            <Announcement_Bar/>
            <div className="product">
                <ProductGallery product={product}/>
                <ProductInfo product={product} selectedIndex={selectedIndex} onSelectedIndexChange={onSelectedIndexChange}/>
            </div>
        </div>
    )
}