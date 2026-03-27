import '../../styles/ProductInfo.css'
import ProductSize from './ProductInfo/ProductSize'
import ProductColors from './ProductInfo/ProductColors'

export default function ProductInfo({
    product,
    colors,
    sizes,
    selectedColorId,
    selectedSizeId,
    selectedSize,
    setSelectedColorId,
    setSelectedSizeId,
    onAddToCart 
}) {
    return (
        <div className='product-info'>

            <div className="Title">
                <h1>{product.Product_Name}</h1>
                <p>{product.Type} — {product.Category}</p>
                <p>${selectedSize?.Price}</p>
            </div>

            <ProductColors
                color={colors}
                selectedColorId={selectedColorId}
                setSelectedColorId={setSelectedColorId}
            />

            <ProductSize
                size={sizes}
                selectedSizeId={selectedSizeId}
                setSelectedSizeId={setSelectedSizeId}
            />

            <button
                className={`product-add-btn ${!selectedSizeId ? 'product-add-btn--disabled' : ''}`}
                disabled={!selectedSizeId}
                onClick={onAddToCart}
            >
                {selectedSizeId
                    ? `Add to Cart — Size ${selectedSize?.Size_Name}`
                    : `Select a Size`}
            </button>

            <div className="product-description">
                <p>{product.Description}</p>
            </div>

        </div>
    )
}