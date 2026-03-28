// AccountDetailsTab.jsx
import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const IconCalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)

const IconEye = ({ show }) => show ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="1.8">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" strokeWidth="1.8">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const IconX = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

// ─── Change Password Modal ──────────────────────────────────────────────────
function ChangePasswordModal({ onClose }) {
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [show, setShow] = useState({ current: false, newPw: false, confirm: false })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const hasMin8    = pwForm.newPw.length >= 8
  const hasUpper   = /[A-Z]/.test(pwForm.newPw)
  const hasLower   = /[a-z]/.test(pwForm.newPw)
  const hasNumber  = /[0-9]/.test(pwForm.newPw)
  const newPwValid = hasMin8 && hasUpper && hasLower && hasNumber
  const matches    = pwForm.newPw === pwForm.confirm && pwForm.confirm !== ''

  const handleSubmit = async () => {
    setError('')
    if (!pwForm.current) return setError('Please enter your current password.')
    if (!newPwValid)      return setError('New password does not meet requirements.')
    if (!matches)         return setError('Passwords do not match.')

    setLoading(true)
    try {
      await axios.put(
        `${API_URL}/api/user/change-password`,
        { currentPassword: pwForm.current, newPassword: pwForm.newPw },
        { withCredentials: true }
      )
      setSuccess(true)
      setTimeout(onClose, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  const toggleShow = (field) =>
    setShow(prev => ({ ...prev, [field]: !prev[field] }))

  const Req = ({ ok, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
      {ok ? <IconCheck /> : <IconX />}
      <span style={{ fontSize: 12, color: ok ? '#22c55e' : '#9e9e9e' }}>{label}</span>
    </div>
  )

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(2px)',
        zIndex: 1000,
        animation: 'fadeIn .18s ease'
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: '#fff', borderRadius: 16,
        padding: '36px 32px 28px',
        width: 'min(420px, 92vw)',
        boxShadow: '0 24px 64px rgba(0,0,0,.18)',
        zIndex: 1001,
        animation: 'slideUp .22s cubic-bezier(.34,1.36,.64,1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#111' }}>Change Password</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#555', padding: 4, borderRadius: 6,
            display: 'flex', alignItems: 'center', transition: 'color .15s'
          }}>
            <IconClose />
          </button>
        </div>

        {success ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
            <p style={{ margin: 0, fontWeight: 600, color: '#22c55e' }}>Password changed successfully!</p>
          </div>
        ) : (
          <>
            {/* Fields */}
            {[
              { key: 'current', label: 'Current Password*' },
              { key: 'newPw',   label: 'New Password*' },
              { key: 'confirm', label: 'Confirm New Password*' },
            ].map(({ key, label }) => (
              <div key={key} style={{ position: 'relative', marginBottom: 14 }}>
                <input
                  type={show[key] ? 'text' : 'password'}
                  placeholder={label}
                  value={pwForm[key]}
                  onChange={e => setPwForm(prev => ({ ...prev, [key]: e.target.value }))}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '13px 44px 13px 16px',
                    border: '1.5px solid #e0e0e0', borderRadius: 10,
                    fontSize: 14, outline: 'none', color: '#111',
                    transition: 'border-color .15s',
                    fontFamily: 'inherit',
                  }}
                  onFocus={e => e.target.style.borderColor = '#111'}
                  onBlur={e => e.target.style.borderColor = '#e0e0e0'}
                />
                <button onClick={() => toggleShow(key)} type="button" style={{
                  position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 2, display: 'flex'
                }}>
                  <IconEye show={show[key]} />
                </button>
              </div>
            ))}

            {/* Requirements */}
            {pwForm.newPw && (
              <div style={{
                background: '#f9f9f9', borderRadius: 10, padding: '12px 14px',
                marginBottom: 14, border: '1px solid #f0f0f0'
              }}>
                <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#555' }}>Password Requirements:</p>
                <Req ok={hasMin8}   label="Minimum 8 characters" />
                <Req ok={hasUpper && hasLower} label="At least one uppercase and one lowercase letter" />
                <Req ok={hasNumber} label="At least one number" />
                {pwForm.confirm && <Req ok={matches} label="Passwords match" />}
              </div>
            )}

            {error && (
              <p style={{ color: '#ef4444', fontSize: 13, margin: '0 0 12px', textAlign: 'center' }}>{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%', padding: '13px 0',
                background: loading ? '#555' : '#111',
                color: '#fff', border: 'none', borderRadius: 50,
                fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '.5px', transition: 'background .2s',
                marginTop: 4, fontFamily: 'inherit',
              }}
            >
              {loading ? 'Saving...' : 'save'}
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translate(-50%, calc(-50% + 16px)) } to { opacity: 1; transform: translate(-50%, -50%) } }
      `}</style>
    </>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function AccountDetailsTab() {
  const { user } = useAuth()
  const [showPwModal, setShowPwModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [email, setEmail] = useState('')

  const [form, setForm] = useState({
    dateOfBirth: '', firstName: '', lastName: '',
    zipCode: '', address: '', addressLine2: '',
    city: '', state: '', phone: '',
  })

  useEffect(() => {
    axios.get(`${API_URL}/api/user/profile`, { withCredentials: true })
      .then(res => {
        const d = res.data
        // ดึง email จาก API ก่อน ถ้าไม่มีค่อย fallback ไป AuthContext
        setEmail(d.Email || user?.email || '')
        setForm({
          dateOfBirth:  d.Birth         || '',
          firstName:    d.Firstname     || '',
          lastName:     d.Lastname      || '',
          zipCode:      d.Zip_Code      || '',
          address:      d.Address_Main  || '',
          addressLine2: d.Address_Alter || '',
          city:         d.City          || '',
          state:        d.State         || '',
          phone:        d.Phonenumber   || '',
        })
      })
      .catch(() => {
        // ถ้า API ล้มเหลว ใช้ email จาก AuthContext แทน
        setEmail(user?.email || '')
      })
  }, [])

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSavedMsg('')
    try {
      await axios.put(`${API_URL}/api/user/profile`, form, { withCredentials: true })
      setSavedMsg('Changes saved successfully!')
      setTimeout(() => setSavedMsg(''), 3000)
    } catch {
      setSavedMsg('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const fields = [
    { name: 'dateOfBirth',  placeholder: 'Date of Birth *', icon: <IconCalendar /> },
    { name: 'firstName',    placeholder: 'First Name *' },
    { name: 'lastName',     placeholder: 'Last Name *' },
    { name: 'zipCode',      placeholder: 'ZIP Code *' },
    { name: 'address',      placeholder: 'Address *' },
    { name: 'addressLine2', placeholder: 'Address Line 2' },
    { name: 'city',         placeholder: 'City *' },
    { name: 'state',        placeholder: 'State *' },
    { name: 'phone',        placeholder: 'Phone Number *', type: 'tel' },
  ]

  return (
    <>
      <main className="settings-content">
        <h2 className="settings-content-title">Account Details</h2>

        {/* Email row */}
        <div className="settings-info-row">
          <span className="settings-info-label">Email*</span>
          <span className="settings-info-value">
            {email || 'Loading...'}
          </span>
        </div>

        {/* Password row — "edit" opens modal */}
        <div className="settings-password-row">
          <span className="settings-info-label">Password</span>
          <div className="settings-password-dots">
            {Array.from({ length: 14 }).map((_, i) => <span key={i} />)}
          </div>
          <button
            className="settings-edit-link"
            onClick={() => setShowPwModal(true)}
          >
            edit
          </button>
        </div>

        <p className="settings-info-note">
          If you would like to save this address to your "Member Addresses,"
          please complete all required fields, including your phone number.
        </p>

        <form className="settings-form" onSubmit={handleSave}>
          {fields.map(({ name, placeholder, icon, type }) => (
            <div className="settings-input-wrap" key={name}>
              <input
                className="settings-input"
                type={type || 'text'}
                name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={handleChange}
              />
              {icon && <span className="settings-input-icon">{icon}</span>}
            </div>
          ))}

          <div className="settings-divider" />

          {savedMsg && (
            <p style={{
              textAlign: 'center', marginBottom: 12,
              color: savedMsg.includes('success') ? '#22c55e' : '#ef4444',
              fontSize: 13, fontWeight: 500
            }}>
              {savedMsg}
            </p>
          )}

          <button
            type="submit"
            className="settings-save-btn"
            disabled={saving}
            style={{ opacity: saving ? 0.7 : 1, cursor: saving ? 'not-allowed' : 'pointer' }}
          >
            {saving ? 'saving...' : 'save'}
          </button>
        </form>
      </main>

      {/* Change Password Modal */}
      {showPwModal && <ChangePasswordModal onClose={() => setShowPwModal(false)} />}
    </>
  )
}