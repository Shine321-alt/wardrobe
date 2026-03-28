// src/pages/CheckoutPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, totalItems, totalPrice, loading: cartLoading } = useCart()

  const [form, setForm] = useState({
    email: '', firstName: '', lastName: '',
    addressLine1: '', town: '', postcode: '',
    country: '', phone: '',
  })
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  // ── ดึงข้อมูล profile มาใส่ฟอร์มอัตโนมัติ ─────────────────────────────
  useEffect(() => {
    axios.get(`${API_URL}/api/user/profile`, { withCredentials: true })
      .then(res => {
        const d = res.data
        setForm({
          email:        d.Email         || '',
          firstName:    d.Firstname     || '',
          lastName:     d.Lastname      || '',
          addressLine1: d.Address_Main  || '',
          town:         d.City          || '',
          postcode:     d.Zip_Code      || '',
          country:      d.State         || '',
          phone:        d.Phonenumber   || '',
        })
        setProfileLoaded(true)
      })
      .catch(() => setProfileLoaded(true))
  }, [])

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const validate = () => {
    const req = ['email', 'firstName', 'lastName', 'addressLine1', 'town', 'postcode', 'country', 'phone']
    const errs = {}
    req.forEach(k => { if (!form[k].trim()) errs[k] = 'Required' })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      // บันทึกที่อยู่ก่อน แล้วส่งข้อมูลไปหน้า Payment
      await axios.put(`${API_URL}/api/user/profile`, {
        firstName:    form.firstName,
        lastName:     form.lastName,
        address:      form.addressLine1,
        city:         form.town,
        zipCode:      form.postcode,
        state:        form.country,
        phone:        form.phone,
      }, { withCredentials: true })

      navigate('/checkout/payment', { state: { deliveryForm: form } })
    } catch {
      alert('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const shippingFee = 0
  const total = Number(totalPrice) + shippingFee

  if (cartLoading || !profileLoaded) {
    return <div style={{ textAlign: 'center', padding: 80, color: '#888' }}>Loading...</div>
  }

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Checkout</h1>

      <div style={styles.layout}>
        {/* ── LEFT: Delivery Form ── */}
        <div style={styles.left}>
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Delivery Options</h2>
            </div>

            {/* Delivery badge */}
            <div style={styles.deliveryBadge}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8">
                <rect x="1" y="3" width="15" height="13" rx="1"/>
                <path d="M16 8h4l3 3v5h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              <span style={styles.deliveryText}>Delivery</span>
            </div>

            {/* Form fields */}
            <div style={styles.formGrid}>
              <Field label="Email*"        name="email"        value={form.email}        onChange={handleChange} error={errors.email}        full />
              <Field label="First Name*"   name="firstName"    value={form.firstName}    onChange={handleChange} error={errors.firstName} />
              <Field label="Last Name*"    name="lastName"     value={form.lastName}     onChange={handleChange} error={errors.lastName} />
              <Field label="Address Line 1*" name="addressLine1" value={form.addressLine1} onChange={handleChange} error={errors.addressLine1} full />
              <Field label="Town/City*"    name="town"         value={form.town}         onChange={handleChange} error={errors.town} />
              <Field label="Postcode*"     name="postcode"     value={form.postcode}     onChange={handleChange} error={errors.postcode} />
              <Field label="Country/Region*" name="country"   value={form.country}      onChange={handleChange} error={errors.country} />
              <Field label="Phone Number*" name="phone"        value={form.phone}        onChange={handleChange} error={errors.phone} type="tel" />
            </div>

            {/* Buttons */}
            <div style={styles.btnRow}>
              <button
                style={{ ...styles.btnPrimary, opacity: saving ? 0.7 : 1 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save & Continue'}
              </button>
              <button style={styles.btnSecondary} onClick={() => navigate('/cart')}>
                Cancel
              </button>
            </div>
          </section>

          {/* Collapsed sections */}
          <CollapsedSection title="Payment" />
          
        </div>

        {/* ── RIGHT: Order Summary ── */}
        <OrderSummary cart={cart} totalItems={totalItems} totalPrice={total} shippingFee={shippingFee} />
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Field({ label, name, value, onChange, error, full, type = 'text' }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'span 1' }}>
      <input
        name={name} type={type} placeholder={label} value={value}
        onChange={onChange}
        style={{
          ...styles.input,
          borderColor: error ? '#ef4444' : '#ddd',
        }}
        onFocus={e => e.target.style.borderColor = '#111'}
        onBlur={e => e.target.style.borderColor = error ? '#ef4444' : '#ddd'}
      />
      {error && <p style={styles.errorMsg}>{error}</p>}
    </div>
  )
}

function CollapsedSection({ title }) {
  return (
    <div style={styles.collapsedSection}>
      <h3 style={styles.collapsedTitle}>{title}</h3>
    </div>
  )
}

export function OrderSummary({ cart, totalItems, totalPrice, shippingFee = 0 }) {
  return (
    <div style={styles.right}>
      <div style={styles.summaryHeader}>
        <h2 style={styles.sectionTitle}>In Your Bag</h2>
      </div>

      <div style={styles.summaryRow}>
        <span>Subtotal</span>
        <span>${Number(totalPrice).toFixed(2)}</span>
      </div>
      <div style={styles.summaryRow}>
        <span>Delivery</span>
        <span style={{ color: '#16a34a' }}>{shippingFee === 0 ? '$0.00' : `$${shippingFee.toFixed(2)}`}</span>
      </div>
      <div style={{ ...styles.summaryRow, ...styles.summaryTotal }}>
        <span>Total</span>
        <span>${Number(totalPrice).toFixed(2)}</span>
      </div>

      {cart && cart.length > 0 && (
        <div style={styles.cartItems}>
          {cart.map(item => (
            <div key={item.Cart_ID} style={styles.cartItem}>
              <div style={styles.cartItemImg}>
                {item.Image_URL
                  ? <img src={item.Image_URL} alt={item.Product_Name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                  : <div style={{ width: '100%', height: '100%', background: '#f0f0f0', borderRadius: 6 }} />
                }
              </div>
              <div style={styles.cartItemInfo}>
                <p style={styles.cartItemName}>{item.Product_Name}</p>
                <p style={styles.cartItemMeta}>{item.Category}</p>
                <p style={styles.cartItemMeta}>{item.Color_Name}</p>
                <p style={styles.cartItemMeta}>Qty: {item.Quantity} | Size: {item.Size_Name}</p>
                <p style={styles.cartItemPrice}>${Number(item.Price).toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = {
  page:           { maxWidth: 1100, margin: '0 auto', padding: '40px 24px' },
  pageTitle:      { textAlign: 'center', fontSize: 28, fontWeight: 600, marginBottom: 36, color: '#111' },
  layout:         { display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' },
  left:           { flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 12 },
  right:          { flex: '0 0 300px', border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, background: '#fff' },
  section:        { border: '1px solid #e5e7eb', borderRadius: 12, padding: 24, background: '#fff' },
  sectionHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle:   { fontSize: 18, fontWeight: 600, margin: 0, color: '#111' },
  deliveryBadge:  { display: 'flex', alignItems: 'center', gap: 10, border: '1.5px solid #e5e7eb', borderRadius: 10, padding: '12px 18px', marginBottom: 20 },
  deliveryText:   { fontSize: 15, fontWeight: 500, color: '#333' },
  formGrid:       { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 },
  input:          { width: '100%', boxSizing: 'border-box', padding: '13px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, outline: 'none', fontFamily: 'inherit', color: '#111', transition: 'border-color .15s' },
  errorMsg:       { color: '#ef4444', fontSize: 12, marginTop: 4, marginBottom: 0 },
  btnRow:         { display: 'flex', gap: 12, justifyContent: 'flex-end' },
  btnPrimary:     { background: '#111', color: '#fff', border: 'none', borderRadius: 50, padding: '13px 32px', fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: '.3px' },
  btnSecondary:   { background: 'transparent', color: '#111', border: '1.5px solid #ddd', borderRadius: 50, padding: '13px 28px', fontSize: 14, cursor: 'pointer' },
  collapsedSection: { border: '1px solid #e5e7eb', borderRadius: 12, padding: '18px 24px', background: '#fff' },
  collapsedTitle: { fontSize: 16, fontWeight: 500, margin: 0, color: '#888' },
  summaryHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  summaryRow:     { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#555', marginBottom: 10 },
  summaryTotal:   { fontWeight: 700, fontSize: 16, color: '#111', borderTop: '1px solid #e5e7eb', paddingTop: 12, marginTop: 4 },
  cartItems:      { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 16 },
  cartItem:       { display: 'flex', gap: 12 },
  cartItemImg:    { width: 64, height: 80, flexShrink: 0, borderRadius: 6, overflow: 'hidden', background: '#f5f5f5' },
  cartItemInfo:   { flex: 1 },
  cartItemName:   { fontSize: 13, fontWeight: 600, color: '#111', margin: '0 0 4px' },
  cartItemMeta:   { fontSize: 12, color: '#888', margin: '0 0 2px' },
  cartItemPrice:  { fontSize: 13, fontWeight: 600, color: '#111', marginTop: 4 },
}