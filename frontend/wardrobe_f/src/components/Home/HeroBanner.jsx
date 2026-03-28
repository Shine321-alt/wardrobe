import { useState, useEffect } from 'react'
import '../../styles/HeroBanner.css'

const slides = [
  'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774688865/HeroBanner1_cocdms.png',
  'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774688865/HeroBanner3_oogykh.png',
  'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774688864/HeroBanner_m9ghku.png',
]

export default function HeroBanner({ imageUrl }) {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (imageUrl) return
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [imageUrl])

  // Static mode — หน้า MEN, NEW
  if (imageUrl) {
    return (
      <div className="hero hero--static">
        <div className="hero-slide hero-slide--active">
          <img src={imageUrl} alt="Hero Banner" />
        </div>
      </div>
    )
  }

  // Slideshow mode — HomePage
  return (
    <div className="hero">
      {slides.map((url, i) => (
        <div key={i} className={`hero-slide ${i === current ? 'hero-slide--active' : ''}`}>
          <img src={url} alt={`hero-${i}`} />
        </div>
      ))}
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} className={`hero-dot ${i === current ? 'hero-dot--active' : ''}`} />
        ))}
      </div>
    </div>
  )
}