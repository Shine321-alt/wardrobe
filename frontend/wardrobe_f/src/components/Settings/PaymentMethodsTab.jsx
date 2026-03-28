// PaymentMethodsTab.jsx
import { useState, useEffect } from 'react'
import { getCards, addCard } from '../../services/api'
 
const IconCreditCard = ({ color = '#757575', size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <path d="M2 10h20"/>
  </svg>
)
 
// chip icon บนการ์ด
const IconChip = () => (
  <svg width="22" height="18" viewBox="0 0 22 18" fill="none">
    <rect x="1" y="1" width="20" height="16" rx="3" fill="#fff" fillOpacity="0.15" stroke="#fff" strokeOpacity="0.4" strokeWidth="1"/>
    <rect x="7" y="1" width="8" height="16" fill="#fff" fillOpacity="0.08"/>
    <line x1="1" y1="6" x2="21" y2="6" stroke="#fff" strokeOpacity="0.4" strokeWidth="1"/>
    <line x1="1" y1="12" x2="21" y2="12" stroke="#fff" strokeOpacity="0.4" strokeWidth="1"/>
    <line x1="7" y1="1" x2="7" y2="17" stroke="#fff" strokeOpacity="0.4" strokeWidth="1"/>
    <line x1="15" y1="1" x2="15" y2="17" stroke="#fff" strokeOpacity="0.4" strokeWidth="1"/>
  </svg>
)
 
export default function PaymentMethodsTab() {
 
  const [form, setForm] = useState({
    fullName: '', cardNumber: '', expiry: '', cvv: '', isDefault: false,
  })
  const [cards, setCards] = useState([])
  const [cardError, setCardError] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [duplicateError, setDuplicateError] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
 
  useEffect(() => { loadCards() }, [])
 
  const loadCards = async () => {
    try {
      const data = await getCards()
      setCards(data)
    } catch (err) {
      console.error('loadCards error:', err.response?.status, err.response?.data)
    }
  }
 
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (name === 'cardNumber') { setCardError(false); setDuplicateError(false) }
    setSuccessMsg(''); setServerError('')
  }
 
  const handleSave = async (e) => {
    e.preventDefault()
    setSuccessMsg(''); setDuplicateError(false); setServerError('')
 
    const clean = form.cardNumber.replace(/\s/g, '')
    if (clean.length < 13 || clean.length > 19 || isNaN(clean)) {
      setCardError(true); return
    }
 
    setLoading(true)
    try {
      await addCard(form)
      await loadCards()
      setForm({ fullName: '', cardNumber: '', expiry: '', cvv: '', isDefault: false })
      setCardError(false)
      setSuccessMsg('Card added successfully!')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.error
      if (status === 409) setDuplicateError(true)
      else if (status === 401) setServerError('Session expired. Please log in again.')
      else setServerError(`Error: ${msg || 'Something went wrong.'}`)
    } finally {
      setLoading(false)
    }
  }
 
  return (
    <main className="settings-content">
 
      <h2 className="settings-content-title">Add Card</h2>
      <p className="settings-info-note">Add a new card to your profile.</p>
 
      {successMsg && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '0.9rem', fontWeight: 600, color: '#16a34a', marginBottom: '1rem' }}>
          ✓ {successMsg}
        </p>
      )}
      {serverError && (
        <p className="settings-error-text" style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
          ✕ {serverError}
        </p>
      )}
 
      <form className="settings-form" onSubmit={handleSave}>
        <div className="settings-input-wrap">
          <input className="settings-input" type="text" name="fullName"
            placeholder="Full Name*" value={form.fullName} onChange={handleChange} />
        </div>
 
        <div className="settings-input-wrap">
          <input
            className={`settings-input${cardError || duplicateError ? ' error' : ''}`}
            type="text" name="cardNumber" placeholder="Card Number*"
            value={form.cardNumber} onChange={handleChange} maxLength={19} />
          <span className="settings-input-icon"><IconCreditCard /></span>
          {cardError && <p className="settings-error-text">Invalid card number*</p>}
          {duplicateError && <p className="settings-error-text">This card has already been added*</p>}
        </div>
 
        <div className="settings-input-row">
          <div className="settings-input-wrap">
            <input className="settings-input" type="text" name="expiry"
              placeholder="MM/YY*" value={form.expiry} onChange={handleChange} maxLength={5} />
          </div>
          <div className="settings-input-wrap">
            <input className="settings-input" type="text" name="cvv"
              placeholder="CVV*" value={form.cvv} onChange={handleChange} maxLength={4} />
          </div>
        </div>
 
        <div className="settings-checkbox-row">
          <input type="checkbox" name="isDefault" id="isDefault"
            checked={form.isDefault} onChange={handleChange} />
          <label htmlFor="isDefault">Default</label>
        </div>
 
        <button className="settings-save-btn full" type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Card'}
        </button>
      </form>
 
      <div className="settings-divider" />
 
      <h3 className="settings-content-title" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
        Saved Cards
      </h3>
 
      {cards.length === 0 ? (
        <p className="settings-info-note">No cards</p>
      ) : (
        <div className="saved-card-list">
          {cards.map((card, i) => (
            <div key={i} className="saved-card-item">
 
              {/* icon กล่องดำ */}
              <div className="saved-card-icon">
                <IconChip />
              </div>
 
              {/* ข้อมูล */}
              <div className="saved-card-info">
                <p className="saved-card-name">{card.Fullname}</p>
                <p className="saved-card-number">•••• •••• •••• {card.Cardnumber?.slice(-4)}</p>
                <p className="saved-card-expiry">Expires {card.Expiry_date}</p>
              </div>
 
              {/* badge + icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                {card.isDefault && <span className="saved-card-badge">Default</span>}
                <IconCreditCard color="#bbb" size={18} />
              </div>
 
            </div>
          ))}
        </div>
      )}
 
    </main>
  )
}