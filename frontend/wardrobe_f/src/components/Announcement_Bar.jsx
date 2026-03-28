// ===============================
// Import React hooks และ component ที่จำเป็น
// ===============================

// useState = เก็บ state (index ข้อความปัจจุบัน)
// useEffect = ใช้ทำงานตอน component mount (เช่น setInterval)
import { useState, useEffect } from "react"

// Link = ใช้เปลี่ยนหน้าแบบไม่ reload
import { Link } from "react-router-dom"

// import CSS ของ Announcement Bar
import '../styles/AnnouncementBar.css'


// ===============================
// ข้อความโปรโมชั่น (slider)
// ===============================

// array ของข้อความที่จะวนแสดง
const textsales = [
    {
        id: 1,
        text1: "Shop All New Arrivals",   // ข้อความหลัก
        text2: "Shop"                    // ปุ่ม/link
    },
    {
        id: 2,
        text1: "Up to 50% Off",
        text2: "The End of Season is on. Shop"
    },
];


// ===============================
// Component: Announcement_Bar
// ===============================
export default function Announcement_Bar(){

    // ===============================
    // state สำหรับ index ข้อความปัจจุบัน
    // ===============================

    // currentext = index ของข้อความที่กำลังแสดง
    const [currentext, settext] = useState(0);
    

    // ==========================================
    // useEffect: เปลี่ยนข้อความอัตโนมัติทุก 4 วินาที
    // ==========================================
    useEffect(() => {

        // setInterval → ทำงานซ้ำทุก 4000 ms
        const timer = setInterval(() =>{

            // เพิ่ม index ทีละ 1
            // % textsales.length = วนกลับไป 0 เมื่อถึงตัวสุดท้าย
            settext(prev => (prev + 1) % textsales.length)

        }, 4000)

        // cleanup → ล้าง timer ตอน component ถูกลบ
        return () => clearInterval(timer)

    },[]) // [] = ทำครั้งเดียวตอน mount


    // ===============================
    // UI (Announcement Bar)
    // ===============================
    return (

        // container หลัก (แถบด้านบนของเว็บ)
        <div className="Announcement-Bar">

            <div className="Announcement-textsale">

                {/* ===============================
                   loop ข้อความทั้งหมด
                =============================== */}
                {textsales.map((text, i) => (

                    <div
                        key={text.id}

                        // ถ้า index ตรงกับ currentext → active (แสดง)
                        className={`bar-item ${i === currentext ? 'bar-item--active' : ''}`}
                    >
                        
                        {/* ===============================
                           ข้อความหลัก
                        =============================== */}
                        <p>{text.text1}</p>
                        

                        {/* ===============================
                           ปุ่ม link
                           - id = 1 → ไปหน้า /new
                           - id = 2 → ไปหน้า /sale
                        =============================== */}
                        <Link to={text.id === 1 ? '/new' : '/sale'}>
                            {text.text2}
                        </Link>
                        
                    </div>
                ))}
            </div>
        </div>
    )
}