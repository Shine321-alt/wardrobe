import '../../styles/ProductInfo.css'  
import ProductTitle from './ProductInfo/ProductTitle';
import ProductSize from './ProductInfo/ProductSize';
import ProductColors from './ProductInfo/ProductColors'
import { useState,useEffect } from 'react';




export default function ProductInfo({ product, onColorChange  }){
    const [selectedSize,setSelectedSize] = useState(null);

  
    return(
        <div className='product-info'>
            <ProductTitle product={product}/>
              {/* description */}
            <ProductColors product={product} onColorChange={onColorChange}/>
            <ProductSize product={product} onSizeChange={setSelectedSize}/>

            {/* Add to Cart */}
            <button className={`product-add-btn ${!selectedSize ? 'product-add-btn--disabled' : ''}`} disabled={!selectedSize} >
              {selectedSize ? `Add to Cart — Size ${selectedSize}` :`Select a Size`}
            </button>

            <div className="product-description">
              <p>{product.description}</p>
            </div>
        </div>
    )
}