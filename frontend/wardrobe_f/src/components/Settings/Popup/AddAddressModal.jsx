// AddAddressModal.jsx — popup form สำหรับเพิ่ม shipping address
import { useState } from 'react'
import '../../../styles/AddAddressModal.css'

export default function AddAddressModal({ onClose, onSave }) {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        address: '',
        addressLine2: '',
        city: '',
        zipCode: '',
        state: '',
        country: '',
        phone: '',
        isDefault: false,
    })

    // อัปเดต field ที่เปลี่ยน
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    // กด Save
    const handleSave = () => {
        onSave(form)
        onClose()
    }

    return (
        // overlay — คลิกข้างนอกเพื่อปิด
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="modal-header">
                    <h2 className="modal-title">Add Address</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {/* Form */}
                <div className="modal-body">

                    {/* First Name + Last Name */}
                    <div className="modal-row">
                        <input
                            className="modal-input"
                            name="firstName"
                            placeholder="First Name*"
                            value={form.firstName}
                            onChange={handleChange}
                        />
                        <input
                            className="modal-input"
                            name="lastName"
                            placeholder="Last name*"
                            value={form.lastName}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Address */}
                    <input
                        className="modal-input full"
                        name="address"
                        placeholder="Address*"
                        value={form.address}
                        onChange={handleChange}
                    />

                    {/* Address Line 2 */}
                    <input
                        className="modal-input full"
                        name="addressLine2"
                        placeholder="Address Line 2"
                        value={form.addressLine2}
                        onChange={handleChange}
                    />

                    {/* City + ZIP Code */}
                    <div className="modal-row">
                        <input
                            className="modal-input"
                            name="city"
                            placeholder="City*"
                            value={form.city}
                            onChange={handleChange}
                        />
                        <input
                            className="modal-input"
                            name="zipCode"
                            placeholder="ZIP Code*"
                            value={form.zipCode}
                            onChange={handleChange}
                        />
                    </div>

                    {/* State + Country */}
                    <div className="modal-row">
                        <input
                            className="modal-input"
                            name="state"
                            placeholder="State*"
                            value={form.state}
                            onChange={handleChange}
                        />
                        <input
                            className="modal-input"
                            name="country"
                            placeholder="Country / Region*"
                            value={form.country}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Phone Number */}
                    <input
                        className="modal-input full"
                        name="phone"
                        placeholder="Phone Number*"
                        value={form.phone}
                        onChange={handleChange}
                    />

                    {/* Default checkbox */}
                    <label className="modal-checkbox-row">
                        <input
                            type="checkbox"
                            name="isDefault"
                            checked={form.isDefault}
                            onChange={handleChange}
                        />
                        <span>Set as Default Shipping Address</span>
                    </label>

                </div>

                {/* Save button */}
                <div className="modal-footer">
                    <button className="modal-save-btn" onClick={handleSave}>
                        Save Address
                    </button>
                </div>

            </div>
        </div>
    )
}