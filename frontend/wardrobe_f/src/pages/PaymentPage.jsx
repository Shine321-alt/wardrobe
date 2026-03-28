// ===============================
// Import React hooks และ library ที่จำเป็น
// ===============================

// useState = เก็บ state (payment method, card form, loading)
// useNavigate = ใช้ redirect ไปหน้าอื่น
// useLocation = ใช้รับข้อมูลที่ส่งมาจากหน้า Checkout
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// useCart = context สำหรับข้อมูล cart
import { useCart } from '../context/CartContext'

// axios = ใช้เรียก API backend
import axios from 'axios'

// OrderSummary = component สรุป order (reuse จาก CheckoutPage)
import { OrderSummary } from './CheckoutPage'


// ===============================
// กำหนด API URL
// ===============================
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'


// ===============================
// Payment Methods
// ===============================

// ใช้แสดงตัวเลือกช่องทางชำระเงิน
const PAYMENT_METHODS = [
  { id: 'card',      label: 'Credit or Debit Card', icon: '💳' },
  { id: 'paypal',    label: 'PayPal',               icon: '🅿️' },
  { id: 'master',    label: 'Master Card',          icon: '🔴' },
  { id: 'googlepay', label: 'Google Pay',           icon: 'G' },
]


// ===============================
// Component: PaymentPage
// ===============================
export default function PaymentPage() {

  // navigation
  const navigate = useNavigate()

  // รับข้อมูลจากหน้า Checkout (deliveryForm)
  const location = useLocation()

  // ดึง cart จาก context
  const { cart, totalItems, totalPrice, fetchCart } = useCart()


  // ===============================
  // ข้อมูลที่ส่งมาจาก CheckoutPage
  // ===============================
  const deliveryForm = location.state?.deliveryForm || {}


  // ===============================
  // State
  // ===============================

  // payment method (default = card)
  const [payMethod, setPayMethod] = useState('card')

  // ข้อมูลบัตร
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvv: ''
  })

  // save card หรือไม่
  const [saveCard, setSaveCard] = useState(false)

  // loading ตอนกด place order
  const [placing, setPlacing] = useState(false)

  // error ของ form
  const [errors, setErrors] = useState({})


  // ==========================================
  // handleCardChange (format input)
  // ==========================================
  const handleCardChange = e => {

    let { name, value } = e.target

    // format card number → 1234 5678 9012 3456
    if (name === 'number') {
      value = value
        .replace(/\D/g, '')         // เอาเฉพาะตัวเลข
        .slice(0, 16)               // จำกัด 16 digit
        .replace(/(.{4})/g, '$1 ')  // เว้นทุก 4 ตัว
        .trim()
    }

    // format expiry → MM/YY
    if (name === 'expiry') {
      value = value
        .replace(/\D/g, '')
        .slice(0, 4)
        .replace(/(\d{2})(\d)/, '$1/$2')
    }

    // format CVV → 3 หลัก
    if (name === 'cvv') {
      value = value.replace(/\D/g, '').slice(0, 3)
    }

    // update state
    setCardForm(prev => ({ ...prev, [name]: value }))
  }


  // ==========================================
  // validate form
  // ==========================================
  const validate = () => {

    // ถ้าไม่ใช่ card → ไม่ต้อง validate
    if (payMethod !== 'card') return true

    const errs = {}

    // เช็ค card number
    if (!cardForm.number || cardForm.number.replace(/\s/g, '').length < 16) {
      errs.number = 'Enter a valid 16-digit card number'
    }

    // เช็ค expiry
    if (!cardForm.expiry || cardForm.expiry.length < 5) {
      errs.expiry = 'Enter a valid expiry date'
    }

    // เช็ค cvv
    if (!cardForm.cvv || cardForm.cvv.length < 3) {
      errs.cvv = 'Enter a valid CVV'
    }

    setErrors(errs)

    return Object.keys(errs).length === 0
  }


  // ==========================================
  // handlePlaceOrder
  // ==========================================
  const handlePlaceOrder = async () => {

    // validate ก่อน
    if (!validate()) return

    setPlacing(true)

    try {

      // ===============================
      // ส่งข้อมูลไป backend เพื่อสร้าง order
      // ===============================
      await axios.post(`${API_URL}/api/checkout`, {

        // ===============================
        // ข้อมูล delivery
        // ===============================
        firstname:    deliveryForm.firstName  || '',
        lastname:     deliveryForm.lastName   || '',
        address_desc: deliveryForm.addressLine1 || '',
        town:         deliveryForm.town       || '',
        postcode:     deliveryForm.postcode   || '',
        country:      deliveryForm.country    || '',
        phonenumber:  deliveryForm.phone      || '',

        // ===============================
        // ข้อมูล payment
        // ===============================
        cardnumber:   payMethod === 'card' ? cardForm.number.replace(/\s/g, '') : '',
        expired:      payMethod === 'card' ? cardForm.expiry : '',
        cvv:          payMethod === 'card' ? cardForm.cvv    : '',
        payment_method: payMethod,
        save_card:    saveCard,

      }, { withCredentials: true })


      // ===============================
      // หลังสั่งซื้อสำเร็จ
      // ===============================

      // refresh cart (จะกลายเป็นว่าง)
      await fetchCart()

      // ไปหน้า settings → purchases tab
      navigate('/settings', {
        state: { tab: 'purchases', orderSuccess: true }
      })

    } catch (err) {

      alert(err.response?.data?.message || 'Order failed. Please try again.')

    } finally {

      setPlacing(false)
    }
  }


  // ===============================
  // UI
  // ===============================
  return (

    <div style={styles.page}>

      <h1 style={styles.pageTitle}>Checkout</h1>

      <div style={styles.layout}>

        {/* ===============================
           LEFT
        =============================== */}
        <div style={styles.left}>


          {/* ==========================================
             Delivery Summary (readonly)
          ========================================== */}
          <section style={styles.sectionCollapsed}>

            <div style={styles.sectionRow}>
              <h2 style={styles.sectionTitle}>Delivery Options</h2>

              {/* ปุ่มกลับไปแก้ไข */}
              <button
                style={styles.editBtn}
                onClick={() => navigate('/checkout')}
              >
                Edit
              </button>
            </div>


            {/* badge */}
            <div style={styles.badge}>
              <span>🚚</span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>Delivery</span>
            </div>


            {/* แสดง address */}
            {deliveryForm.firstName && (
              <div style={styles.addressSummary}>
                <p style={styles.addressLine}><strong>Delivery Address</strong></p>
                <p style={styles.addressLine}>{deliveryForm.firstName} {deliveryForm.lastName}</p>
                <p style={styles.addressLine}>{deliveryForm.addressLine1}</p>
                <p style={styles.addressLine}>{deliveryForm.town} {deliveryForm.postcode} {deliveryForm.country}</p>
                <p style={styles.addressLine}>{deliveryForm.phone}</p>
              </div>
            )}
          </section>


          {/* ==========================================
             Payment Section
          ========================================== */}
          <section style={styles.section}>

            <h2 style={styles.sectionTitle}>Payment</h2>

            {/* เลือก payment method */}
            {PAYMENT_METHODS.map(m => (
              <label key={m.id} style={styles.radioRow}>
                <input
                  type="radio"
                  checked={payMethod === m.id}
                  onChange={() => setPayMethod(m.id)}
                />
                <span>{m.icon} {m.label}</span>
              </label>
            ))}


            {/* ===============================
               Card Form
            =============================== */}
            {payMethod === 'card' && (

              <div style={styles.cardBox}>

                <div style={styles.cardGrid}>

                  <CardField name="number" placeholder="Card Number" value={cardForm.number} onChange={handleCardChange} error={errors.number} full />

                  <CardField name="expiry" placeholder="MM/YY" value={cardForm.expiry} onChange={handleCardChange} error={errors.expiry} />

                  <CardField name="cvv" placeholder="CVV" value={cardForm.cvv} onChange={handleCardChange} error={errors.cvv} />

                </div>
              </div>
            )}


            {/* ปุ่ม place order */}
            <button
              style={{ ...styles.placeBtn, opacity: placing ? 0.7 : 1 }}
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? 'Processing...' : 'Confirm & Place Order'}
            </button>

          </section>

        </div>


        {/* ===============================
           RIGHT (Order Summary)
        =============================== */}
        <OrderSummary
          cart={cart}
          totalItems={totalItems}
          totalPrice={totalPrice}
          shippingFee={0}
        />

      </div>
    </div>
  )
}


// ===============================
// Component: CardField
// ===============================
function CardField({ name, placeholder, value, onChange, error, full }) {

  return (
    <div style={{ gridColumn: full ? '1 / -1' : 'span 1' }}>

      <input
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}

        style={{
          width: '100%',
          padding: '12px 14px',
          border: `1.5px solid ${error ? '#ef4444' : '#ddd'}`,
          borderRadius: 8,
        }}
      />

      {/* error */}
      {error && (
        <p style={{ color: '#ef4444', fontSize: 12 }}>
          {error}
        </p>
      )}
    </div>
  )
}


// ===============================
// Styles
// ===============================
const styles = {
  page: { maxWidth: 1100, margin: '0 auto', padding: '40px 24px' },
  pageTitle: { textAlign: 'center', fontSize: 28, fontWeight: 600, marginBottom: 36 },
  layout: { display: 'flex', gap: 40, flexWrap: 'wrap' },
  left: { flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: 12 },
  section: { border: '1px solid #e5e7eb', borderRadius: 12, padding: 24 },
  sectionCollapsed: { border: '1px solid #e5e7eb', borderRadius: 12, padding: 20 },
  sectionRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontSize: 18, fontWeight: 600 },
  editBtn: { background: 'none', border: 'none', cursor: 'pointer' },
  badge: { display: 'flex', gap: 10, marginBottom: 10 },
  addressSummary: {},
  addressLine: { fontSize: 13, color: '#555' },
  radioRow: { display: 'flex', gap: 10, marginBottom: 10 },
  cardBox: { border: '1px solid #e5e7eb', padding: 16, borderRadius: 10 },
  cardGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  placeBtn: { width: '100%', padding: 14, background: '#111', color: '#fff', borderRadius: 50 },
}