import '../../../styles/ProductSize.css'

export default function ProductSize({ size, selectedSizeId, setSelectedSizeId }) {

    const handleSelect = (item) => {

        if(item.Stock === 0) return

        setSelectedSizeId(item.Size_ID)
    }

    return(
        <div className="product-size">

            <p className="product-size-label">Select Size</p>

            <div className="product-size-grid">

                {size.map((item) => (

                    <button
                        key={item.Size_ID}
                        disabled={item.Stock === 0}
                        className={`product-size-btn
                            ${item.Size_ID === selectedSizeId ? 'product-size-btn--active' : ''}
                            ${item.Stock === 0 ? 'product-size-btn--soldout' : ''}
                        `}
                        onClick={() => handleSelect(item)}
                    >
                        {item.Size_Name}

                        {item.Stock === 0 && (
                            <span className="soldout-line" />
                        )}

                    </button>

                ))}

            </div>

        </div>
    )
}