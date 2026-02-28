import { useState, useEffect } from 'react'

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
    <div className="relative w-full overflow-hidden" style={{ height: 'clamp(320px, 55vw, 600px)' }}>

      {/* Slides */}
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img src={slide.imageUrl} alt="hero" className="w-full h-full object-cover" />
        </div>
      ))}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <h1
          className="font-black uppercase"
          style={{ fontSize: 'clamp(2.5rem, 8vw, 7rem)', color: '#FF2D2D', fontFamily: 'monospace' }}
        >
          WARDROBE<span style={{ color: '#FF6B35' }}>+</span>
        </h1>
        <p className="text-white font-bold tracking-[0.3em] uppercase mt-3"
          style={{ fontSize: 'clamp(0.65rem, 1.8vw, 1.1rem)' }}>
          SIMPLICITY. QUALITY. STYLE.
        </p>
      </div>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'bg-white w-6 h-2' : 'bg-white/50 w-2 h-2'
            }`}
          />
        ))}
      </div>

    </div>
  )
}