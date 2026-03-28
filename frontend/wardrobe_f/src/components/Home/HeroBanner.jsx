// ===============================
// Import React hooks
// ===============================

// useState = ใช้เก็บ state (slide ปัจจุบัน)
// useEffect = ใช้ทำงานตาม lifecycle (เช่น setInterval)
import { useState, useEffect } from 'react'

// import CSS สำหรับ Hero Banner
import '../../styles/HeroBanner.css'


// ===============================
// รูปภาพสำหรับ slideshow (หน้า Home)
// ===============================

// array ของ URL รูป banner
const slides = [
  'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774688865/HeroBanner1_cocdms.png',
  'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774688865/HeroBanner3_oogykh.png',
  'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1774688864/HeroBanner_m9ghku.png',
]


// ===============================
// Component: HeroBanner
// ===============================

// รับ prop = imageUrl (ใช้สำหรับ static banner เช่นหน้า MEN / NEW)
export default function HeroBanner({ imageUrl }) {

  // ===============================
  // state สำหรับ slide ปัจจุบัน
  // ===============================
  const [current, setCurrent] = useState(0)


  // ==========================================
  // useEffect: เปลี่ยน slide อัตโนมัติ (slideshow mode)
  // ==========================================
  useEffect(() => {

    // ถ้ามี imageUrl → แสดงแบบ static → ไม่ต้อง slide
    if (imageUrl) return

    // setInterval → เปลี่ยน slide ทุก 4 วินาที (4000 ms)
    const timer = setInterval(() => {

      // เพิ่ม index ทีละ 1
      // % slides.length = loop กลับไป 0 เมื่อถึงสุดท้าย
      setCurrent(prev => (prev + 1) % slides.length)

    }, 4000)

    // cleanup function → ล้าง timer ตอน component unmount
    return () => clearInterval(timer)

  }, [imageUrl]) // ถ้า imageUrl เปลี่ยน → effect ทำงานใหม่


  // ==========================================
  // Static mode (ใช้ในหน้า MEN, NEW)
  // ==========================================
  if (imageUrl) {

    return (

      // hero แบบ static (ไม่มี animation)
      <div className="hero hero--static">

        <div className="hero-slide hero-slide--active">

          {/* แสดงรูปเดียว */}
          <img src={imageUrl} alt="Hero Banner" />

        </div>

      </div>
    )
  }


  // ==========================================
  // Slideshow mode (ใช้ใน HomePage)
  // ==========================================
  return (

    // container หลัก
    <div className="hero">

      {/* ===============================
         loop รูปทั้งหมด
      =============================== */}
      {slides.map((url, i) => (

        <div
          key={i}

          // ถ้า index ตรงกับ current → แสดง (active)
          className={`hero-slide ${i === current ? 'hero-slide--active' : ''}`}
        >

          {/* รูป banner */}
          <img src={url} alt={`hero-${i}`} />

        </div>
      ))}


      {/* ===============================
         จุด (dots) สำหรับเลือก slide
      =============================== */}
      <div className="hero-dots">

        {slides.map((_, i) => (

          <button
            key={i}

            // กด → เปลี่ยน slide ไป index นั้น
            onClick={() => setCurrent(i)}

            // ถ้า active → เปลี่ยน style
            className={`hero-dot ${i === current ? 'hero-dot--active' : ''}`}
          />

        ))}

      </div>

    </div>
  )
}