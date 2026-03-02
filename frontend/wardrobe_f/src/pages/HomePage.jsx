import HeroBanner from '../components/HeroBanner'
import ProductGrid from '../components/ProductGrid'
import CollectionGrid from '../components/CollectionGrid'
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