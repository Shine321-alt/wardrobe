import { useState, useEffect } from "react";
import '../../../styles/ProductSize.css'

export default function ProductSize({ product, onIndexChange, Index }) {

    const [selected, setSelected] = useState("");

    useEffect(() => {
        if(product[Index]){
            setSelected(product[Index].Size_Name);
        }
    }, [Index, product]);

    const handleSelect = (index) => {

        if(product[index].Stock === 0) return;

        setSelected(product[index].Size_Name);    
        onIndexChange(index);
    }

    return(
        <div className="product-size">
            <p className="product-size-label">Select Size</p>

            <div className="product-size-grid">
                {product.map((item, index) => (
                    <button
                        key={`${item.Size_Name}-${index}`}
                        disabled={item.Stock === 0}
                        className={`product-size-btn
                            ${selected === item.Size_Name ? 'product-size-btn--active' : ''}
                            ${item.Stock === 0 ? 'product-size-btn--soldout' : ''}
                        `}
                        onClick={() => handleSelect(index)}
                    >
                        {item.Size_Name}
                        {item.Stock === 0 && <span className="soldout-line" />}
                    </button>
                ))}
            </div>

        </div>
    )
}