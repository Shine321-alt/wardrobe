import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import axios from 'axios'
import '../../styles/CollectionGrid.css'

const collections = [
  { id: 1, label: 'T-SHIRTS', to: '/category/t-shirts',
    imageUrl: 'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1772900779/T-SHIRTS_nfe0rm.png' },
  { id: 2, label: 'SHIRTS', to: '/category/shirts',
    imageUrl: 'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1772900779/SHIRTS_uraghg.png' },
  { id: 3, label: 'TROUSERS', to: '/category/trousers',
    imageUrl: 'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1772900372/TROUSERS_C_zl20ym.png' },
  { id: 4, label: 'HOODIES & SWEATSHIRTS', to: '/category/hoodies',
    imageUrl: 'https://res.cloudinary.com/dpxu8zgzv/image/upload/v1772900779/HOODIES_SWEATSHIRTS_pkwyj7.png' },
]

export default function CollectionGrid() {
  return (
    <section className="collection-section">

      <h2 className="collection-title">Collections</h2>

      <div className="collection-grid">
        {collections.map(col => (
          <Link key={col.id} to={col.to} className="collection-card">

            <img src={col.imageUrl} alt={col.label} />

            <div className="collection-overlay" />

            <div className="collection-label">
              <span>{col.label}</span>
              <ArrowRight size={18} className="collection-arrow" />
            </div>

          </Link>
        ))}
      </div>

    </section>
  )
}