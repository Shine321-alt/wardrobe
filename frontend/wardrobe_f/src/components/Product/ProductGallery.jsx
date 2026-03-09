import { useParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import '../../styles/ProductGallery.css'

export default function ProductGallery({ product }) {
    const [current, setCurrent] = useState(0);

    if (!product) return <p>Loading...</p>

    const prev = () => setCurrent(i => (i - 1 + product.length) % product.length);
    const next = () => setCurrent(i => (i + 1) % product.length);
    return(
      <div className="gallery-sticky"> 
        <div className='gallery-product'>
            <div className='photo'>
                <img src={product[current].Image_URL} alt={product[current].Product_Name} />
            </div>

            <div className='gallery-wishlist'>
              <Heart size={13}/>
            </div>

            <div className="gallery-btns">
              <button  className='gallery-btn--prev' onClick={prev}>
                <ChevronLeft size={18}/>
              </button>
              <button  className='gallery-btn--next' onClick={next}>
                <ChevronRight size={18}/>
              </button>
            </div>


        </div>
      </div>
    )
    
}