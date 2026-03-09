import '../../../styles/ProductTitle.css'


export default function ProductTitle({ product }){
    if (!product) return <p>Not found...</p>

    return(
        <div className="Title">
            <h1>{product.Product_Name}</h1>
            <p>{product.Category}</p>
            <p>${product.Price.toFixed(2)}</p>
        </div>
    )
}