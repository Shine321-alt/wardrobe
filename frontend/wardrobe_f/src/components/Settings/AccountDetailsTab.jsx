// AccountDetailsTab.jsx
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#757575" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <path d="M16 2v4M8 2v4M3 10h18"/>
  </svg>
)

export default function AccountDetailsTab() {
  const { user } = useAuth()

  const [form, setForm] = useState({
    dateOfBirth: '', firstName: '', lastName: '',
    zipCode: '', address: '', addressLine2: '',
    city: '', state: '', phone: '',
  })

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSave = (e) => {
    e.preventDefault()
    // TODO: เชื่อม API
    alert('Saved!')
  }

  return (
    <main className="settings-content">
      <h2 className="settings-content-title">Account Details</h2>

      <div className="settings-info-row">
        <span className="settings-info-label">Email*</span>
        <span className="settings-info-value">
          {user?.email || 'User_email@gmail.com'}
        </span>
      </div>

      <div className="settings-password-row">
        <span className="settings-info-label">Password</span>
        <div className="settings-password-dots">
          {Array.from({ length: 14 }).map((_, i) => <span key={i} />)}
        </div>
        <button className="settings-edit-link">edit</button>
      </div>

      <p className="settings-info-note">
        If you would like to save this address to your "Member Addresses,"
        please complete all required fields, including your phone number.
      </p>

      <form className="settings-form" onSubmit={handleSave}>
        {[
          { name: 'dateOfBirth', placeholder: 'Date of Birth *', icon: <IconCalendar /> },
          { name: 'firstName',   placeholder: 'First Name*' },
          { name: 'lastName',    placeholder: 'Last name*' },
          { name: 'zipCode',     placeholder: 'ZIP Code*' },
          { name: 'address',     placeholder: 'Address*' },
          { name: 'addressLine2',placeholder: 'Address Line 2' },
          { name: 'city',        placeholder: 'City*' },
          { name: 'state',       placeholder: 'State*' },
          { name: 'phone',       placeholder: 'Phone Number*', type: 'tel' },
        ].map(({ name, placeholder, icon, type }) => (
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
        <button type="submit" className="settings-save-btn">save</button>
      </form>
    </main>
  )
}