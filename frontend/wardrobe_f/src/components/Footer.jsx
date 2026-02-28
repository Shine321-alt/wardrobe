import { Globe, Instagram, Twitter, Facebook, Youtube } from 'lucide-react'
import '../styles/Footer.css'

const footerSections = [
  {
    title: 'RESOURCES',
    links: ['Size Guide', 'Materials', 'Care Instructions', 'Style Tips', 'Lookbook'],
  },
  {
    title: 'HELP',
    links: ['FAQ', 'Shipping & Returns', 'Track Your Order', 'Contact Us'],
  },
  {
    title: 'COMPANY',
    links: ['About Us', 'Careers', 'Press', 'Sustainability', 'Affiliate'],
  },
]

const socialIcons = [
  { Icon: Instagram, label: 'Instagram' },
  { Icon: Twitter, label: 'Twitter' },
  { Icon: Facebook, label: 'Facebook' },
  { Icon: Youtube, label: 'YouTube' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        {/* Top */}
        <div className="footer-top">

          {/* Columns */}
          <div className="footer-columns">

            {/* RESOURCES, HELP, COMPANY */}
            {footerSections.map(({ title, links }) => (
              <div key={title} className="footer-col">
                <h4 className="footer-col-title">{title}</h4>
                <ul>
                  {links.map(link => (
                    <li key={link}>
                      <a href="#">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* FOLLOW US */}
            <div className="footer-col">
              <h4 className="footer-col-title">FOLLOW US</h4>
              <div className="footer-social">
                {socialIcons.map(({ Icon, label }) => (
                  <a key={label} href="#" aria-label={label}>
                    <Icon size={16} />
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Country */}
          <button className="footer-country">
            <Globe size={13} />
            <span>United States</span>
          </button>

        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <span className="footer-logo">
            WARDROBE<span>+</span>
          </span>
          <p className="footer-copy">
            © {new Date().getFullYear()} Wardrobe+. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  )
}
