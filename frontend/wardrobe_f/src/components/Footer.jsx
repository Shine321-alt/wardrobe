// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// icon ต่าง ๆ สำหรับ social และ country selector
import { Globe, Instagram, Twitter, Facebook, Youtube } from 'lucide-react'

// Link = ใช้เปลี่ยนหน้าแบบ SPA (ไม่ reload)
import { Link } from 'react-router-dom' 

// import CSS สำหรับ footer
import '../styles/Footer.css'


// ===============================
// ข้อมูล section ของ footer (ฝั่งซ้าย)
// ===============================

// แต่ละ object = 1 column ใน footer
// title = หัวข้อ
// links = รายการ link ภายใน column
const footerSections = [
  {
    title: 'RESOURCES',
    links: [
      { label: 'Size Guide', to: '/size-guide' },
      { label: 'Materials', to: '/materials' },
      { label: 'Care Instructions', to: '/care' },
      { label: 'Style Tips', to: '/style-tips' },
      { label: 'Lookbook', to: '/lookbook' },
    ],
  },
  {
    title: 'HELP',
    links: [
      { label: 'FAQ', to: '/faq' },
      { label: 'Shipping & Returns', to: '/shipping' },
      { label: 'Track Your Order', to: '/track' },
      { label: 'Contact Us', to: '/contact' },
    ],
  },
  {
    title: 'COMPANY',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Careers', to: '/careers' },
      { label: 'Press', to: '/press' },
      { label: 'Sustainability', to: '/sustainability' },
      { label: 'Affiliate', to: '/affiliate' },
    ],
  },
]


// ===============================
// ข้อมูล social media (ฝั่งขวา)
// ===============================

// Icon = component icon
// label = ชื่อ (ใช้กับ aria-label)
// to = URL ปลายทาง
const socialIcons = [
  { Icon: Instagram, label: 'Instagram', to: 'https://instagram.com' },
  { Icon: Twitter, label: 'Twitter', to: 'https://twitter.com' },
  { Icon: Facebook, label: 'Facebook', to: 'https://facebook.com' },
  { Icon: Youtube, label: 'YouTube', to: 'https://youtube.com' },
]


// ===============================
// Component: Footer
// ===============================
export default function Footer() {

  // ===============================
  // UI (Footer ทั้งหมด)
  // ===============================
  return (

    // container หลักของ footer
    <footer className="footer">

      <div className="footer-inner">


        {/* ==========================================
           ส่วนบนของ footer (columns + social)
        ========================================== */}
        <div className="footer-top">

          <div className="footer-columns">

            {/* ===============================
               loop แต่ละ section (RESOURCES, HELP, COMPANY)
            =============================== */}
            {footerSections.map(({ title, links }) => (

              <div key={title} className="footer-col">

                {/* หัวข้อ column */}
                <h4 className="footer-col-title">{title}</h4>

                <ul>

                  {/* loop link ภายใน column */}
                  {links.map(({ label, to }) => (

                    <li key={label}>

                      {/* Link ภายในเว็บไซต์ */}
                      <Link to={to}>
                        {label}
                      </Link>   

                    </li>
                  ))}
                </ul>
              </div>
            ))}


            {/* ===============================
               Column: Social media
            =============================== */}
            <div className="footer-col">

              <h4 className="footer-col-title">FOLLOW US</h4>

              <div className="footer-social">

                {/* loop icon social */}
                {socialIcons.map(({ Icon, label, to }) => (

                  <a
                    key={label}
                    href={to}             // external link
                    target="_blank"       // เปิด tab ใหม่
                    rel="noreferrer"      // ป้องกัน security issue
                    aria-label={label}    // accessibility
                  >

                    {/* แสดง icon */}
                    <Icon size={16} />   

                  </a>
                ))}
              </div>
            </div>

          </div>


          {/* ===============================
             ปุ่มเลือกประเทศ (UI เฉย ๆ)
          =============================== */}
          <button className="footer-country">

            {/* icon โลก */}
            <Globe size={13} />

            {/* ชื่อประเทศ */}
            <span>United States</span>
          </button>

        </div>


        {/* ==========================================
           ส่วนล่างของ footer (logo + copyright)
        ========================================== */}
        <div className="footer-bottom">

          {/* logo (กดแล้วกลับหน้า home) */}
          <Link to="/" className="footer-logo">   
            WARDROBE<span>+</span>
          </Link>

          {/* copyright */}
          <p className="footer-copy">

            {/* new Date().getFullYear() = ปีปัจจุบันอัตโนมัติ */}
            © {new Date().getFullYear()} Wardrobe+. All rights reserved.

          </p>
        </div>

      </div>
    </footer>
  )
}