// src/pages/PaymentPage.jsx
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import axios from 'axios'
import { OrderSummary } from './CheckoutPage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const PAYMENT_METHODS = [
  { id: 'card',    label: 'Credit or Debit Card', icon: '💳' },
  { id: 'paypal',  label: 'PayPal',               icon: '🅿️' },
  { id: 'master',  label: 'Master Card',           icon: '🔴' },
  { id: 'googlepay', label: 'Google Pay',          icon: 'G' },
]

export default function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cart, totalItems, totalPrice, fetchCart } = useCart()

  const deliveryForm = location.state?.deliveryForm || {}

  const [payMethod, setPayMethod] = useState('card')
  const [cardForm, setCardForm] = useState({ number: '', expiry: '', cvv: '' })
  const [saveCard, setSaveCard] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [errors, setErrors] = useState({})

  const handleCardChange = e => {
    let { name, value } = e.target
    if (name === 'number') value = value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
    if (name === 'expiry') value = value.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(\d)/, '$1/$2')
    if (name === 'cvv')    value = value.replace(/\D/g, '').slice(0, 3)
    setCardForm(prev => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    if (payMethod !== 'card') return true
    const errs = {}
    if (!cardForm.number || cardForm.number.replace(/\s/g, '').length < 16) errs.number = 'Enter a valid 16-digit card number'
    if (!cardForm.expiry || cardForm.expiry.length < 5) errs.expiry = 'Enter a valid expiry date'
    if (!cardForm.cvv   || cardForm.cvv.length < 3)    errs.cvv    = 'Enter a valid CVV'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handlePlaceOrder = async () => {
    if (!validate()) return
    setPlacing(true)
    try {
      // ── ส่งข้อมูลไปสร้าง order ใน BuyOrder + orders ──
      await axios.post(`${API_URL}/api/checkout`, {
        // ข้อมูลที่อยู่จัดส่ง
        firstname:    deliveryForm.firstName  || '',
        lastname:     deliveryForm.lastName   || '',
        address_desc: deliveryForm.addressLine1 || '',
        town:         deliveryForm.town       || '',
        postcode:     deliveryForm.postcode   || '',
        country:      deliveryForm.country    || '',
        phonenumber:  deliveryForm.phone      || '',
        // ข้อมูลชำระเงิน
        cardnumber:   payMethod === 'card' ? cardForm.number.replace(/\s/g, '') : '',
        expired:      payMethod === 'card' ? cardForm.expiry : '',
        cvv:          payMethod === 'card' ? cardForm.cvv    : '',
        payment_method: payMethod,
        save_card:    saveCard,
      }, { withCredentials: true })

      // รีเซ็ต cart แล้วไป MyPurchasesTab
      await fetchCart()
      navigate('/settings', { state: { tab: 'purchases', orderSuccess: true } })

    } catch (err) {
      alert(err.response?.data?.message || 'Order failed. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Checkout</h1>

      <div style={styles.layout}>
        {/* ── LEFT ── */}
        <div style={styles.left}>

          {/* Delivery summary (collapsed/readonly) */}
          <section style={styles.sectionCollapsed}>
            <div style={styles.sectionRow}>
              <h2 style={styles.sectionTitle}>Delivery Options</h2>
              <button style={styles.editBtn} onClick={() => navigate('/checkout')}>Edit</button>
            </div>
            <div style={styles.badge}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8">
                <rect x="1" y="3" width="15" height="13" rx="1"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Delivery</span>
            </div>
            {deliveryForm.firstName && (
              <div style={styles.addressSummary}>
                <p style={styles.addressLine}><strong>Delivery Address</strong></p>
                <p style={styles.addressLine}>{deliveryForm.firstName} {deliveryForm.lastName}</p>
                <p style={styles.addressLine}>{deliveryForm.addressLine1}</p>
                <p style={styles.addressLine}>{deliveryForm.town} {deliveryForm.postcode} {deliveryForm.country}</p>
                <p style={styles.addressLine}>{deliveryForm.phone}</p>
                <p style={{ ...styles.addressLine, marginTop: 8, color: '#16a34a', fontWeight: 500 }}>Delivery Address Free</p>
              </div>
            )}
          </section>

          {/* Payment section */}
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Payment</h2>
            <p style={styles.subLabel}>Billing Country/Region</p>
            <p style={{ fontSize: 14, color: '#555', marginBottom: 16 }}>{deliveryForm.country || 'Country/Region'}</p>

            <p style={styles.subLabel}>Select payment method</p>

            {PAYMENT_METHODS.map(m => (
              <label key={m.id} style={styles.radioRow}>
                <input
                  type="radio" name="pay" value={m.id}
                  checked={payMethod === m.id}
                  onChange={() => setPayMethod(m.id)}
                  style={{ accentColor: '#111' }}
                />
                <span style={{ fontSize: 14 }}>{m.icon} {m.label}</span>
              </label>
            ))}

            {/* Card form */}
            {payMethod === 'card' && (
              <div style={styles.cardBox}>
                <p style={{ fontSize: 14, fontWeight: 600, margin: '0 0 14px', color: '#111' }}>Add Card</p>
                <div style={styles.cardGrid}>
                  <CardField name="number" placeholder="Card Number" value={cardForm.number} onChange={handleCardChange} error={errors.number} full />
                  <CardField name="expiry" placeholder="MM/YY"       value={cardForm.expiry} onChange={handleCardChange} error={errors.expiry} />
                  <CardField name="cvv"    placeholder="CVV"          value={cardForm.cvv}    onChange={handleCardChange} error={errors.cvv} />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555', marginTop: 10 }}>
                  <input type="checkbox" checked={saveCard} onChange={e => setSaveCard(e.target.checked)} style={{ accentColor: '#111' }} />
                  Save credit card for later use
                </label>
              </div>
            )}

            <button
              style={{ ...styles.placeBtn, opacity: placing ? 0.7 : 1, marginTop: 24 }}
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? 'Processing...' : 'Confirm & Place Order'}
            </button>
          </section>

          {/* Order Review collapsed */}
          <section style={styles.sectionCollapsed}>
            <h3 style={{ ...styles.sectionTitle, color: '#888', fontSize: 15 }}>Order Review</h3>
          </section>
        </div>

        {/* ── RIGHT: Summary ── */}
        <OrderSummary cart={cart} totalItems={totalItems} totalPrice={totalPrice} shippingFee={0} />
      </div>
    </div>
  )
}

function CardField({ name, placeholder, value, onChange, error, full }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'span 1' }}>
      <input
        name={name} placeholder={placeholder} value={value} onChange={onChange}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '12px 14px', border: `1.5px solid ${error ? '#ef4444' : '#ddd'}`,
          borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit',
        }}
        onFocus={e => e.target.style.borderColor = '#111'}
        onBlur={e => e.target.style.borderColor = error ? '#ef4444' : '#ddd'}
      />
      {error && <p style={{ color: '#ef4444', fontSize: 12, marginTop: 3 }}>{error}</p>}
    </div>
  )
}

const styles = {
  page:           { maxWidth: 1100, margin: '0 auto', padding: '40px 24px' },
  pageTitle:      { textAlign: 'center', fontSize: 28, fontWeight: 600, marginBottom: 36, color: '#111' },
  layout:         { display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' },
  left:           { flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 12 },
  section:        { border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, background: '#fff' },
  sectionCollapsed: { border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 24px', background: '#fff' },
  sectionRow:     { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle:   { fontSize: 18, fontWeight: 600, margin: 0, color: '#111' },
  editBtn:        { background: 'none', border: 'none', fontSize: 14, color: '#111', cursor: 'pointer', textDecoration: 'underline' },
  badge:          { display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '10px 16px', marginBottom: 14 },
  addressSummary: { paddingTop: 8 },
  addressLine:    { fontSize: 13, color: '#555', margin: '2px 0' },
  subLabel:       { fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 10 },
  radioRow:       { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' },
  cardBox:        { border: '1px solid #e5e7eb', borderRadius: 10, padding: 18, marginTop: 16, background: '#fafafa' },
  cardGrid:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  placeBtn:       { width: '100%', padding: '14px 0', background: '#111', color: '#fff', border: 'none', borderRadius: 50, fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: '.3px' },
}