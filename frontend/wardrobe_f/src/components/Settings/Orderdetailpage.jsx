// OrderDetailPage.jsx
import { useEffect, useState } from 'react'          // ✅ fix 1: เพิ่ม import
import { useLocation, useNavigate } from 'react-router-dom'
import SettingsSidebar from './SettingsSidebar'
import '../../styles/SettingsPage.css'

const API_BASE = 'http://localhost:5000'          // ✅ fix 4: ประกาศ constant

export default function OrderDetailPage() {
    const location = useLocation()
    const navigate = useNavigate()

    const [order,   setOrder]   = useState(null)
    const [loading, setLoading] = useState(true)      // ✅ เริ่มเป็น true ไม่ใช่ null
    const [error,   setError]   = useState(null)

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                setLoading(true)
                const res  = await fetch(`${API_BASE}/api/orders/details`, {
                    method: 'GET',                    // ✅ GET ไม่ใช่ POST สำหรับ fetch ข้อมูล
                    headers: {
                        'Content-Type':  'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    credentials: 'include',
                })
                const json = await res.json()
                if (!res.ok || !json.success) throw new Error(json.error || 'Failed to fetch')
                setOrder(json.data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchOrder()
    }, [])                                            // ✅ fix 2: [] ไม่ใช่ [id]

    // ✅ fix 3: order?.date ป้องกัน crash ตอน order ยัง null
    const estimatedDelivery = order?.date
        ? new Date(new Date(order.date).setDate(new Date(order.date).getDate() + 3))
            .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'TBD'

    const goBack = () => navigate('/settings', { state: { tab: 'orders' } })

    if (loading) return (
        <div className="order-detail-page">
            <SettingsSidebar activeTab="orders" onTabChange={(tab) =>
                navigate('/settings', { state: { tab } })} />
            <div className="order-detail-content">
                <p>Loading order...</p>
            </div>
        </div>
    )

    if (error) return (
        <div className="order-detail-page">
            <SettingsSidebar activeTab="orders" onTabChange={(tab) =>
                navigate('/settings', { state: { tab } })} />
            <div className="order-detail-content">
                <p style={{ color: 'red' }}>Error: {error}</p>
                <button className="order-detail-back" onClick={goBack}>← Back to My Orders</button>
            </div>
        </div>
    )

    if (!order) return null

    return (
        <div className="order-detail-page">

            <SettingsSidebar activeTab="orders" onTabChange={(tab) =>
                navigate('/settings', { state: { tab } })} />

            <div className="order-detail-content">

                <button className="order-detail-back" onClick={goBack}>
                    ← Back to My Orders
                </button>

                <h2>My Order Details</h2>

                <div className="order-detail-section">
                    <p>Order Date: {order.date}</p>
                    <p>Order ID: {order.id || 'N/A'}</p>
                    <p>Order Type: {order.type || 'Online Store'}</p>
                    <p>Order Status: {order.status || 'Prepare for shipment'}</p>
                    <p>Tracking Number: <a href="#">{order.tracking || 'THP554433221TH'}</a></p>
                </div>

                <div className="order-detail-section">
                    <h3>Shipping Address</h3>
                    <p>{order.shipping?.name    || 'user_First Name* user_Last Name*'}</p>
                    <p>{order.shipping?.address || 'user_Address*'}</p>
                    <p>{order.shipping?.city    || 'user_City* user_State* user_ZIPcode*'}</p>
                    <p>{order.shipping?.phone   || 'user_Phone Number*'}</p>
                </div>

                <div className="order-detail-section">
                    <h3>Delivery Date</h3>
                    <p>Package from: {order.date || 'N/A'}</p>
                    <p>Estimated Delivery: {estimatedDelivery}</p>
                </div>

                <div className="order-detail-section">
                    <h3>Payment Method</h3>
                    <p>{order.payment || 'Select Payment method'}</p>
                </div>

                <div className="order-detail-section">
                    <h3>Order Summary</h3>

                    {order.items?.length > 0 ? (
                        order.items.map((item, i) => (
                            <div key={i} className="order-detail-item">
                                <img
                                    src={item.Image_URL}
                                    alt={item.Product_Name}
                                    className="order-detail-item-img"
                                />
                                <div className="order-detail-item-info">
                                    <p>{item.Product_Name}</p>
                                    <p>Color: {item.Color_Name}</p>
                                    <p>Price: ${item.Price}</p>
                                    <p>Quantity: {item.Quantity}</p>
                                    <p>Total: ${item.Price * item.Quantity}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No items</p>
                    )}

                    <div className="order-detail-totals">
                        <div className="order-detail-total-row">
                            <span>Subtotal</span>
                            <span>${order.subtotal || '0.00'}</span>
                        </div>
                        <div className="order-detail-total-row">
                            <span>Packaging Fee</span>
                            <span>${order.packaging_fee || '0.00'}</span>
                        </div>
                        <div className="order-detail-total-row">
                            <span><strong>Grand Total</strong></span>
                            <span><strong>${order.total || '0.00'}</strong></span>
                        </div>
                    </div>
                </div>

                <button className="order-detail-back" onClick={goBack}>
                    ← Back to My Orders
                </button>

            </div>
        </div>
    )
}