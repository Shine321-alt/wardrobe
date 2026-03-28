//Dropdown
import { Link } from 'react-router-dom'
import '../../styles/MegaMenu.css'

const sharedCategories = {
  'New & Featured': ['New Arrivals', 'Best Sellers', 'Latest Drops'],
  'Accessories': ['Jewelry', 'Bags'],
  'Collections': ['Essentials', 'New Season', 'Limited'],
}

const clothingByNav = {
  MEN:   ['T-Shirts', 'Shirts', 'Hoodies & Sweatshirts', 'Trousers'],
  WOMEN: ['Dresses', 'Blouses', 'Skirts', 'Jackets'],
  KID:   ['T-Shirts', 'Shorts', 'Hoodies', 'Joggers'],
}

// แปลงชื่อ item เป็น slug สำหรับ URL
// เช่น "Hoodies & Sweatshirts" → "hoodies-&-sweatshirts"
const toSlug = (item) =>
    item.toLowerCase().replace(/ /g, '-')

export default function MegaMenu({ label }) {
  if (label === 'NEW') return null
  const columns = {
    'New & Featured': sharedCategories['New & Featured'],
    'Clothing': clothingByNav[label] || [],
    'Accessories': sharedCategories['Accessories'],
    'Collections': sharedCategories['Collections'],
  }

  return (
    <div className="mega-menu">
      <div className="mega-inner">
        {Object.entries(columns).map(([title, items]) => (
          <div key={title} className="mega-col">
            <p className="mega-title">{title}</p>
            {items.map(item => (
              <Link
                key={item}
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