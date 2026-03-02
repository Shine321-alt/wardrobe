import { Globe, Instagram, Twitter, Facebook, Youtube } from 'lucide-react'
import { Link } from 'react-router-dom' 
import '../styles/Footer.css'

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

const socialIcons = [
  { Icon: Instagram, label: 'Instagram', to: 'https://instagram.com' },
  { Icon: Twitter, label: 'Twitter', to: 'https://twitter.com' },
  { Icon: Facebook, label: 'Facebook', to: 'https://facebook.com' },
  { Icon: Youtube, label: 'YouTube', to: 'https://youtube.com' },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">

        <div className="footer-top">
          <div className="footer-columns">

            {footerSections.map(({ title, links }) => (
              <div key={title} className="footer-col">
                <h4 className="footer-col-title">{title}</h4>
                <ul>
                  {links.map(({ label, to }) => (
                    <li key={label}>
                      <Link to={to}>{label}</Link>   
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="footer-col">
              <h4 className="footer-col-title">FOLLOW US</h4>
              <div className="footer-social">
                {socialIcons.map(({ Icon, label, to }) => (
                  <a key={label} href={to} target="_blank" rel="noreferrer" aria-label={label}>
                    <Icon size={16} />   
                  </a>
                ))}
              </div>
            </div>

          </div>

          <button className="footer-country">
            <Globe size={13} />
            <span>United States</span>
          </button>
        </div>

        <div className="footer-bottom">
          <Link to="/" className="footer-logo">   
            WARDROBE<span>+</span>
          </Link>
          <p className="footer-copy">
            © {new Date().getFullYear()} Wardrobe+. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  )
}