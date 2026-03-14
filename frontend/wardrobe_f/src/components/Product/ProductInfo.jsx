import '../../styles/ProductInfo.css'
import ProductTitle from './ProductInfo/ProductTitle'
import ProductSize from './ProductInfo/ProductSize'
import ProductColors from './ProductInfo/ProductColors'
import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export default function ProductInfo({ 
    product_id,
    color, 
    size, 
    selectedColorId,
    selectedSizeId,
    setSelectedColorId, 
    setSelectedSizeId 
})  {

    const [info, setInfo] = useState(null)
    const [sizeinfo,setsizeinfo] = useState(null)

    useEffect(() => {

        if(!product_id || !selectedColorId || !selectedSizeId) return

        axios.get(`${API_URL}/api/products/${product_id}/${selectedColorId}/${selectedSizeId}`)
        .then(res => {
            setInfo(res.data)
        })

    }, [product_id, selectedColorId, selectedSizeId])

    useEffect(() => {

        if(!selectedSizeId) return

        axios.get(`${API_URL}/api/sizes/${selectedSizeId}`)
        .then(res => {
            setsizeinfo(res.data)
        })

    }, [selectedSizeId])


    return(
        <div className='product-info'>

            <ProductTitle 
                Name={info?.Product_Name} 
                Category={info?.Category} 
                Price={info?.Price} 
            />

            <ProductColors 
                color={color} 
                selectedColorId={selectedColorId}
                setSelectedColorId={setSelectedColorId}
            />

            <ProductSize 
                size={size} 
                selectedSizeId={selectedSizeId}
                setSelectedSizeId={setSelectedSizeId}
            />
            <button 
                className={`product-add-btn ${!selectedSizeId ? 'product-add-btn--disabled' : ''}`} 
                disabled={!selectedSizeId}
            >
              {selectedSizeId 
                ? `Add to Cart — Size ${sizeinfo?.Size_Name}` 
                : `Select a Size`}
            </button>

            <div className="product-description">
                <p>{info?.Description}</p>
            </div>

        </div>
    )
}