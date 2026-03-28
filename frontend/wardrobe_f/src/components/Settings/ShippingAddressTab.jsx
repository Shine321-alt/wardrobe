// ShippingAddressTab.jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from '../../context/AuthContext'
import AddAddressModal from './Popup/AddAddressModal'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function ShippingAddressTab() {
    const { user } = useAuth()
    const [showModal, setShowModal] = useState(false)
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)

    // โหลด address ทั้งหมดของ user จาก DB
    useEffect(() => {
        if (!user) { setLoading(false); return }
        axios.get(`${API_URL}/api/shipping`, { withCredentials: true })
            .then(res => setAddresses(res.data))
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [user])

    // reload address list ใหม่จาก DB
    const reloadAddresses = () => {
        axios.get(`${API_URL}/api/shipping`, { withCredentials: true })
            .then(res => setAddresses(res.data))
            .catch(() => {})
    }

    // บันทึก address ใหม่ลง DB
    const handleSave = async (newAddress) => {
        await axios.post(`${API_URL}/api/shipping`, newAddress, { withCredentials: true })
            .then(() => reloadAddresses())
            .catch((err) => console.log('save error:', err.response))
    }

    // ลบ address ออกจาก DB
    const handleDelete = async (addressId) => {
        await axios.delete(`${API_URL}/api/shipping/${addressId}`, { withCredentials: true })
            .then(() => reloadAddresses())
            .catch(() => {})
    }

    if (loading) return <main className="settings-content"><p>Loading...</p></main>

    return (
        <main className="settings-content">
            <h2 className="settings-content-title">Saved Shipping Addresses</h2>

            {/* ถ้ายังไม่มี address */}
            {addresses.length === 0 ? (
                <div className="settings-empty-state">
                    <p>
                        You currently have no saved shipping addresses. Add an address here,
                        and it will be automatically filled in during checkout to make the
                        process faster.
                    </p>
                </div>
            ) : (
                <div className="settings-address-list">
                    {addresses.map((addr) => (
                        <div key={addr.Address_ID} className="settings-address-card">
                            <div className="settings-address-card-header">
                                <p className="settings-address-card-title">Shipping Address</p>
                                <button
                                    className="settings-edit-link"
                                    onClick={() => handleDelete(addr.Address_ID)}
                                >
                                    delete
                                </button>
                            </div>
                            {/* ใช้ชื่อ column ตาม DB */}
                            <p className="settings-address-card-info">{addr.Firstname} {addr.Lastname}</p>
                            <p className="settings-address-card-info">{addr.Address_Desc}</p>
                            {addr.Address_Source && (
                                <p className="settings-address-card-info">{addr.Address_Source}</p>
                            )}
                            <p className="settings-address-card-info">{addr.City} {addr.Postcode}</p>
                            <p className="settings-address-card-info">{addr.Country}</p>
                            <p className="settings-address-card-info">{addr.Phonenumber}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* ปุ่ม Add Address */}
            <button className="settings-add-btn" onClick={() => setShowModal(true)}>
                Add Address
            </button>

            {/* Modal */}
            {showModal && (
                <AddAddressModal
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </main>
    )
}