import { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/HeroBanner.css'
const API_URL = import.meta.env.VITE_API_URL|| 'http://localhost:5000'

export default function HeroBanner() {

  const [slides, setSlides] = useState([])
  const [current, setCurrent] = useState(0)

  // ดึงข้อมูลจาก backend
  useEffect(() => {
    axios.get(`${API_URL}/api/products/hero`)
      .then(res => {

        // แปลงชื่อ field จาก backend
        const formattedSlides = res.data.map(product => ({
          id: product.Product_ID,
          name: product.Product_Name,
          imageUrl: product.Image_URL
        }))

        setSlides(formattedSlides)

      })
      .catch(err => {
        console.error(err)
      })
  }, [])

  // auto slide
  useEffect(() => {
    if (slides.length === 0) return

    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 4000)

    return () => clearInterval(timer)
  }, [slides])

  return (
    <div className="hero">

      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`hero-slide ${i === current ? 'hero-slide--active' : ''}`}
        >
          <img src={slide.imageUrl} alt={slide.name} />
        </div>
      ))}

      <div className="hero-overlay" />

      <div className="hero-text">
        <h1 className="hero-title">
          WARDROBE<span>+</span>
        </h1>
        <p className="hero-subtitle">
          SIMPLICITY. QUALITY. STYLE.
        </p>
      </div>

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