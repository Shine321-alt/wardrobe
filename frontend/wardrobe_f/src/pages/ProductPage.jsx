import axios from "axios"
import Announcement_Bar from '../components/Announcement_Bar'
import ProductGallery from '../components/Product/ProductGallery'
import ProductInfo from '../components/Product/ProductInfo'

import '../styles/ProductPage.css'
import { useState,useEffect } from "react"
import { useParams } from "react-router-dom"

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export default function Productpage(){

    const { id } = useParams()

    const [color, setColor] = useState([])
    const [size, setSize] = useState([])
    const [Gallery, setGallery] = useState(null)

    const [selectedColorId, setSelectedColorId] = useState(null)
    const [selectedSizeId, setSelectedSizeId] = useState(null)

    // โหลด gallery
    useEffect(() => { 

        axios.get(`${API_URL}/api/products/${id}/images`)
        .then(res => {
            setGallery(res.data)
        })
    },[id])

    // โหลด colors
    useEffect(() => { 

        axios.get(`${API_URL}/api/products/${id}`)
        .then(res => {

            setColor(res.data)

            if(res.data.length > 0){
                setSelectedColorId(res.data[0].Color_ID)
                const availableColor = res.data.find(s => s.Stock > 0)

                if(availableColor){
                    setSelectedColorId(availableColor.Color_ID)
                }
            }
        })

    },[id])


    // โหลด sizes ตาม color
    useEffect(() => { 

        if(!selectedColorId) return

        setSize([])
        setSelectedSizeId(null)

        axios.get(`${API_URL}/api/products/${id}/${selectedColorId}`)
        .then(res => {

            setSize(res.data)

            if(res.data.length > 0){
                const availableSize = res.data.find(s => s.Stock > 0)

                if(availableSize){
                    setSelectedSizeId(availableSize.Size_ID)
                }
            }

        })

    },[selectedColorId,id])


    return(
        <div>
            <Announcement_Bar/>

            <div className="product">
                <ProductGallery Gallery={Gallery}/>
                <ProductInfo 
                    product_id={id}
                    color={color}
                    size={size}
                    selectedColorId={selectedColorId}
                    selectedSizeId={selectedSizeId}
                    setSelectedColorId={setSelectedColorId}
                    setSelectedSizeId={setSelectedSizeId}
                />

            </div>
        </div>
    )
}