// PaymentMethodsTab.jsx
import { useState } from 'react'

const IconCreditCard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="1.8">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <path d="M2 10h20"/>
  </svg>
)

export default function PaymentMethodsTab() {
  const [form, setForm] = useState({
    fullName: '', cardNumber: '', expiry: '', cvv: '', isDefault: false,
  })
  const [cardError, setCardError] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (name === 'cardNumber') setCardError(false)
  }

  const handleSave = (e) => {
    e.preventDefault()
    const clean = form.cardNumber.replace(/\s/g, '')
    if (clean.length < 13 || clean.length > 19 || isNaN(clean)) {
      setCardError(true)
      return
    }
    alert('Card saved!')
  }

  return (
    <main className="settings-content">
      <h2 className="settings-content-title">Add Card</h2>
      <p className="settings-info-note">Add a new card to your profile.</p>

      <form className="settings-form" onSubmit={handleSave}>
        <div className="settings-input-wrap">
          <input
            className="settings-input"
            type="text"
            name="fullName"
            placeholder="Full Name*"
            value={form.fullName}
            onChange={handleChange}
          />
        </div>

        <div className="settings-input-wrap">
          <input
            className={`settings-input ${cardError ? 'error' : ''}`}
            type="text"
            name="cardNumber"
            placeholder="Card Number*"
            value={form.cardNumber}
            onChange={handleChange}
            maxLength={19}
          />
          <span className="settings-input-icon"><IconCreditCard /></span>
          {cardError && (
            <p className="settings-error-text">invalid card number*</p>
          )}
        </div>

        <div className="settings-input-row">
          <div className="settings-input-wrap">
            <input
              className="settings-input"
              type="text"
              name="expiry"
              placeholder="MM/YY*"
              value={form.expiry}
              onChange={handleChange}
              maxLength={5}
            />
          </div>
          <div className="settings-input-wrap">
            <input
              className="settings-input"
              type="text"
              name="cvv"
              placeholder="CVV *"
              value={form.cvv}
              onChange={handleChange}
              maxLength={4}
            />
          </div>
        </div>

        <div className="settings-checkbox-row">
          <input
            type="checkbox"
            id="isDefault"
            name="isDefault"
            checked={form.isDefault}
            onChange={handleChange}
          />
          <label htmlFor="isDefault">Set as Default Card</label>
        </div>

        <button type="submit" className="settings-save-btn full">Save Card</button>
      </form>
    </main>
  )
}