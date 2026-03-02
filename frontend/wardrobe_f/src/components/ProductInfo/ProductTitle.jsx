import '../../styles/ProductTitle.css'


export default function ProductTitle({ product }){
    if (!product) return <p>Not found...</p>

    return(
        <div className="Title">
            <h1>{product.title}</h1>
            <p>{product.category}</p>
            <p>${product.price}</p>
        </div>
    )
}