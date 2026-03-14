import '../../../styles/ProductColors.css'

export default function ProductColors({ color, selectedColorId, setSelectedColorId }) {

    const selectedColor = color.find(c => c.Color_ID === selectedColorId)

    return (
        <div className="product-color">

            <p className="product-color-label">
                Color - {selectedColor?.Color_Name}
            </p>

            <div className="product-colors-switch">

                {color.map((item) => (
                    <button
                        key={item.Color_ID}
                        type="button"
                        className={`color-select ${item.Color_ID === selectedColorId ? 'color-select--active' : ''}`}
                        onClick={() => setSelectedColorId(item.Color_ID)}
                    >
                        <img src={item.Image_URL} alt={item.Color_Name} />
                    </button>
                ))}

            </div>

        </div>
    )
}