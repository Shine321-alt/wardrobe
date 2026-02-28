import HeroBanner from '../components/HeroBanner'
import ProductGrid from '../components/ProductGrid'
import CollectionGrid from '../components/CollectionGrid'

export default function HomePage() {
  return (
    <div>
      <HeroBanner />
      <ProductGrid />
      <CollectionGrid />

      {/* bottom spacing */}
      <div className="h-8" />
    </div>
  )
}
