// ===============================
// Import library ที่จำเป็น
// ===============================

// Link = ใช้สำหรับเปลี่ยนหน้าแบบไม่ reload
import { Link } from 'react-router-dom'

// import CSS สำหรับ MegaMenu
import '../../styles/MegaMenu.css'


// ===============================
// ข้อมูลหมวดหมู่ที่ใช้ร่วมกัน (ทุก nav ใช้เหมือนกัน)
// ===============================

const sharedCategories = {

  // หมวดใหม่/แนะนำ
  'New & Featured': [
    'New Arrivals', 
    'Best Sellers', 
    'Latest Drops'
  ],

  // หมวด accessories
  'Accessories': [
    'Jewelry', 
    'Bags'
  ],

  // หมวด collection
  'Collections': [
    'Essentials', 
    'New Season', 
    'Limited'
  ],
}


// ===============================
// หมวด Clothing แยกตาม nav (MEN / WOMEN / KID)
// ===============================

const clothingByNav = {

  // ถ้า hover MEN → ใช้ list นี้
  MEN: [
    'T-Shirts', 
    'Shirts', 
    'Hoodies & Sweatshirts', 
    'Trousers'
  ],

  // ถ้า hover WOMEN → ใช้ list นี้
  WOMEN: [
    'Dresses', 
    'Blouses', 
    'Skirts', 
    'Jackets'
  ],

  // ถ้า hover KID → ใช้ list นี้
  KID: [
    'T-Shirts', 
    'Shorts', 
    'Hoodies', 
    'Joggers'
  ],
}


// ===============================
// ฟังก์ชันแปลงชื่อ item → slug สำหรับ URL
// ===============================

// ตัวอย่าง:
// "Hoodies & Sweatshirts"
// → "hoodies-&-sweatshirts"

// ใช้สำหรับทำ URL เช่น:
// /men/hoodies-&-sweatshirts
const toSlug = (item) =>
    item
      .toLowerCase()     // แปลงเป็นตัวพิมพ์เล็กทั้งหมด
      .replace(/ /g, '-') // แทน space ด้วย -


// ===============================
// Component: MegaMenu
// ===============================

// รับ props = label (เช่น MEN / WOMEN / KID)
export default function MegaMenu({ label }) {

  // ===============================
  // ถ้าเป็น NEW → ไม่แสดง MegaMenu
  // ===============================
  if (label === 'NEW') return null


  // ===============================
  // รวม column ทั้งหมดที่จะใช้แสดง
  // ===============================

  const columns = {

    // ใช้ sharedCategories
    'New & Featured': sharedCategories['New & Featured'],

    // Clothing จะเปลี่ยนตาม label (MEN/WOMEN/KID)
    'Clothing': clothingByNav[label] || [],

    // ใช้ sharedCategories
    'Accessories': sharedCategories['Accessories'],

    // ใช้ sharedCategories
    'Collections': sharedCategories['Collections'],
  }


  // ===============================
  // UI (MegaMenu)
  // ===============================
  return (

    // container หลักของ mega menu
    <div className="mega-menu">

      <div className="mega-inner">

        {/* ===============================
           loop column ทั้งหมด
        =============================== */}

        {Object.entries(columns).map(([title, items]) => (

          // column หนึ่ง (เช่น Clothing, Accessories)
          <div key={title} className="mega-col">

            {/* หัวข้อ column */}
            <p className="mega-title">{title}</p>

            {/* ===============================
               loop item ในแต่ละ column
            =============================== */}
            {items.map(item => (

              <Link
                key={item}

                // สร้าง URL แบบ dynamic
                // เช่น /men/t-shirts
                to={`/${label.toLowerCase()}/${toSlug(item)}`}

                className="mega-link"
              >
                {item}
              </Link>

            ))}
          </div>

        ))}

      </div>
    </div>
  )
}