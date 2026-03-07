// ไฟล์นี้ใช้สำหรับแสดงหน้าแรกของเว็บไซต์ ประกอบด้วยแบนเนอร์ รายการสินค้า และคอลเลคชั่น
import HeroBanner from '../components/Home/HeroBanner'
import ProductGrid from '../components/Home/ProductGrid'
import CollectionGrid from '../components/Home/CollectionGrid'
import '../styles/HomePage.css'

export default function HomePage() {
  return (
    <div className="homepage">
      <HeroBanner />
      <ProductGrid />
      <CollectionGrid />
      <div className="homepage-spacing" />
    </div>
  )
}