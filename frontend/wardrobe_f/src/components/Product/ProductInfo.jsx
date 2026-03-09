import '../../styles/ProductInfo.css'  
import ProductTitle from './ProductInfo/ProductTitle';
import ProductSize from './ProductInfo/ProductSize';
import ProductColors from './ProductInfo/ProductColors'
import { useState,useEffect } from 'react';




export default function ProductInfo({ product, selectedIndex, onSelectedIndexChange })  {

  
    return(
        <div className='product-info'>
            <ProductTitle product={product[selectedIndex]}/>
              {/* description */}
            <ProductSize product={product} onIndexChange={onSelectedIndexChange} Index={selectedIndex}/>

            {/* Add to Cart */}
            <button className={`product-add-btn ${selectedIndex === null? 'product-add-btn--disabled' : ''}`} disabled={selectedIndex === null} >
              {selectedIndex !== null? `Add to Cart — Size ${product[selectedIndex].Size_Name}` :`Select a Size`}
            </button>

            <div className="product-description">
              <p>{product[selectedIndex].Description}</p>
            </div>
        </div>
    )
}