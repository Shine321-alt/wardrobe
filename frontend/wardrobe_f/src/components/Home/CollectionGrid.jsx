// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// Link = ใช้เปลี่ยนหน้าแบบไม่ reload (SPA)
import { Link } from 'react-router-dom'

// icon ลูกศร (ใช้ตกแต่ง UI)
import { ArrowRight } from 'lucide-react'

// (ตอนนี้ไม่ได้ใช้ แต่ import ไว้)
// useState, useEffect = ปกติใช้กับ state และ lifecycle
import { useState, useEffect } from 'react'

// axios = ใช้เรียก API (แต่ในไฟล์นี้ยังไม่ได้ใช้)
import axios from 'axios'

// import CSS สำหรับ layout ของ collection grid
import '../../styles/CollectionGrid.css'


// ===============================
// ข้อมูล collection (static data)
// ===============================

// แต่ละ object = 1 หมวดสินค้า
// id = key
// label = ชื่อที่แสดง
// to = path ที่จะไปเมื่อกด
// imageUrl = รูปภาพ
const collections = [
  {
    id: 1,
    label: 'T-SHIRTS',
    to: '/category/t-shirts',
    imageUrl: 'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1772900779/T-SHIRTS_nfe0rm.png'
  },
  {
    id: 2,
    label: 'SHIRTS',
    to: '/category/shirts',
    imageUrl: 'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1772900779/SHIRTS_uraghg.png'
  },
  {
    id: 3,
    label: 'TROUSERS',
    to: '/category/trousers',
    imageUrl: 'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1772900372/TROUSERS_C_zl20ym.png'
  },
  {
    id: 4,
    label: 'HOODIES & SWEATSHIRTS',
    to: '/category/hoodies',
    imageUrl: 'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1772900779/HOODIES_SWEATSHIRTS_pkwyj7.png'
  },
]


// ===============================
// Component: CollectionGrid
// ===============================
export default function CollectionGrid() {

  // ===============================
  // UI (สิ่งที่ user เห็น)
  // ===============================
  return (

    // section หลักของ collections
    <section className="collection-section">

      {/* ===============================
         Title (หัวข้อ)
      =============================== */}
      <h2 className="collection-title">
        Collections
      </h2>


      {/* ===============================
         Grid ของ collection
      =============================== */}
      <div className="collection-grid">

        {/* loop collections เพื่อสร้าง card */}
        {collections.map(col => (

          // แต่ละ card เป็น link
          <Link
            key={col.id}              // key สำหรับ React
            to={col.to}               // path ที่จะไป
            className="collection-card"
          >

            {/* ===============================
               รูปภาพ
            =============================== */}
            <img 
              src={col.imageUrl}      // URL รูป
              alt={col.label}         // alt สำหรับ accessibility
            />


            {/* ===============================
               overlay (layer ดำโปร่ง)
               ใช้ทำ effect hover ให้ตัวหนังสือเด่นขึ้น
            =============================== */}
            <div className="collection-overlay" />


            {/* ===============================
               label + icon
            =============================== */}
            <div className="collection-label">

              {/* ชื่อหมวด */}
              <span>{col.label}</span>

              {/* icon ลูกศร */}
              <ArrowRight 
                size={18} 
                className="collection-arrow" 
              />
            </div>

          </Link>
        ))}
      </div>

    </section>
  )
}