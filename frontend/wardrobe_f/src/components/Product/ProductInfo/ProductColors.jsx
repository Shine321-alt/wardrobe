import '../../../styles/ProductColors.css'
import { useState, useEffect } from 'react'

export default function ProductColors({ product, onColorChange }){
    const [selected, setSelected] = useState(0);
    const colors = product?.colors || [
    {id: 'default',name: 'Default',image: [product?.image]}
    ];

    useEffect(() => {
        onColorChange(colors[0].image)
    },[product.id])

    const handleSelect = (i) =>{
        setSelected(i);
        onColorChange(colors[i].image)
    };

    return(
        <div className="product-color">
            <p className="product-color-label">
                Color - {colors[selected].name}
            </p>
            <div className="product-colors-switch">
                {colors.map((item, i ) => (
                    <button
                        key={item.id || i}
                        type="button" 
                        className={`color-select ${i === selected ? 'color-select--active' : ''}`}
                        onClick={() => handleSelect(i)}
                        aria-label={`Select ${item.name} color`}
                        aria-pressed={i === selected}
                    >
                        <img src={item.image[0]} alt={item.name}/>
                    </button>
                    
                ))}
            </div>

        </div>
    )
    
}