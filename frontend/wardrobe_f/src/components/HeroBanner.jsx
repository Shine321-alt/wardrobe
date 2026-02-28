import { useState, useEffect } from 'react'
import '../styles/HeroBanner.css'

const slides = [
  { id: 1, imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1600&q=80' },
  { id: 2, imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1600&q=80' },
  { id: 3, imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80' },
]

export default function HeroBanner() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="hero">

      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`hero-slide ${i === current ? 'hero-slide--active' : ''}`}
        >
          <img src={slide.imageUrl} alt="hero" />
        </div>
      ))}

      {/* Overlay */}
      <div className="hero-overlay" />

      {/* Text */}
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