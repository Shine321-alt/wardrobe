import { ChevronLeft, ChevronRight, Heart } from 'lucide-react'
import { useEffect, useState } from 'react'
import '../../styles/ProductGallery.css'

export default function ProductGallery({ gallery }) {
    const [current, setCurrent] = useState(0)

    // reset กลับรูปแรกเมื่อเปลี่ยนสี
    useEffect(() => {
        setCurrent(0)
    }, [gallery])

    if (!gallery || gallery.length === 0) return <p>Loading...</p>

    const prev = () => setCurrent(i => (i - 1 + gallery.length) % gallery.length)
    const next = () => setCurrent(i => (i + 1) % gallery.length)

    return (
        <div className="gallery-sticky">
            <div className='gallery-product'>

                <div className='photo'>
                    <img src={gallery[current]} alt="product" />
                </div>

                <div className='gallery-wishlist'>
                    <Heart size={13} />
                </div>

                <div className="gallery-btns">
                    <button className='gallery-btn--prev' onClick={prev}>
                        <ChevronLeft size={18} />
                    </button>
                    <button className='gallery-btn--next' onClick={next}>
                        <ChevronRight size={18} />
                    </button>
                </div>

            </div>
        </div>
    )
}