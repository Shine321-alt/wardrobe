import { useState, useEffect } from 'react'
import '../../styles/HeroBanner.css'

// รูป Hero Banner แบบ static ไม่ดึงจาก DB
const slides = [
  'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774688865/HeroBanner1_cocdms.png',
  'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774688865/HeroBanner3_oogykh.png',
  'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774688864/HeroBanner_m9ghku.png',
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)

  // auto slide ทุก 4 วินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="hero">

      {/* Slides */}
      {slides.map((url, i) => (
        <div
          key={i}
          className={`hero-slide ${i === current ? 'hero-slide--active' : ''}`}
        >
          <img src={url} alt={`hero-${i}`} />
        </div>
      ))}

     

      {/* Dots */}
      <div className="hero-dots">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`hero-dot ${i === current ? 'hero-dot--active' : ''}`}
          />
        ))}
      </div>

    </div>
  )
}