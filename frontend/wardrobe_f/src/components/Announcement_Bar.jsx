import { useState,useEffect } from "react"
import { Link } from "react-router-dom"
import '../styles/AnnouncementBar.css'
const textsales = [
    
        {id: 1, text1: "Shop All New Arrivals",text2: "Shop" },
        {id: 2, text1: "Up to 50% Off",text2: "The End of Season is on. Shop"},

];

export default function Announcement_Bar(){
    const [currentext, settext] = useState(0);
    
    useEffect(() => {
        const timer = setInterval(() =>{
            settext(prev => (prev + 1) % textsales.length)
        }, 4000)
        return () => clearInterval(timer)
    },[])

    return (
        <div className="Announcement-Bar">
            <div className="Announcement-textsale">
                {textsales.map((text, i) => (
                    <div
                        key={text.id}
                        className={`bar-item ${i === currentext ? 'bar-item--active' : ''}`}
                    >
                        
                    <p>{text.text1}</p>
                    
                    <Link to={text.id === 1 ? '/new' : '/sale'}>{text.text2}</Link>
                        
                        
                    </div>
                ))}
            </div>
        </div>
    )
}