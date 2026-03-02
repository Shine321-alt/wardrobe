import { useState, useEffect } from "react";
import '../../styles/ProductSize.css'

const stockData = {
  1: { S: true, M: true, L: false, XL: true },
  2: { S: false, M: true, L: true, XL: true },
  3: { S: true, M: false, L: true, XL: true },
  3: { S: true, M: false, L: true, XL: false },
}


export default function ProductSize({product, onSizeChange}){
    const [selected, setSelected ] = useState(null);

    const sizes = ['S','M','L','XL'];
    const stock = stockData[product?.id] || {S: true,M: true,L: true,XL: true}

    const handleSelect = (size) => {
        if (!stock[size]) return 
        setSelected(size)
        onSizeChange(size)       
    }
    return(
        <div className="product-size">
            <p className="product-size-label">Select Size</p>
            <div className="product-size-grid">
                {sizes.map(size => (
                    <button
                        key = {size}
                        className={`product-size-btn
                            ${selected === size ? 'product-size-btn--active' : ''}
                            ${!stock[size] ? 'product-size-btn--soldout' : ''}
                        `}   
                        onClick={() => handleSelect(size)}
                        disabled={!stock[size]}
                    >
                    {size}
                    {!stock[size] && <span className="soldout-line" />}
                    </button>

                ))}
            </div>

        </div>
    )
}