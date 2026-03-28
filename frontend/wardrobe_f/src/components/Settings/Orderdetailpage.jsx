// Orderdetailpage.jsx — หน้าแสดงรายละเอียด order
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import SettingsSidebar from './SettingsSidebar'
import '../../styles/OrderDetailPage.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function OrderDetailPage() {
    const { id } = useParams()         // ดึง order_id จาก URL /settings/orders/:id
    const navigate = useNavigate()

    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!id) return

        // ดึงข้อมูล order + items จาก Backend
        fetch(`${API_URL}/api/orders/${id}`, {
            method: 'GET',
            credentials: 'include'
        })
        .then(res => {
            if (!res.ok) throw new Error('Order not found')
            return res.json()
        })
        .then(data => setOrder(data))
        .catch(err => setError(err.message))
        .finally(() => setLoading(false))

    }, [id])

    // คำนวณ Estimated Delivery (+3 วัน)
    const estimatedDelivery = order?.date
        ? new Date(new Date(order.date).setDate(new Date(order.date).getDate() + 3))
            .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'TBD'

    if (loading) return <div className="order-detail-loading">Loading...</div>
    if (error)   return <div className="order-detail-error">{error}</div>
    if (!order)  return null

    return (
        <div className="order-detail-page">

            {/* Sidebar */}
            <SettingsSidebar activeTab="orders" onTabChange={(tab) =>
                navigate('/settings', { state: { tab } })
            } />

            {/* Content */}
            <div className="order-detail-content">

                {/* Back button */}
                <button
                    className="order-detail-back"
                    onClick={() => navigate('/settings', { state: { tab: 'orders' } })}
                >
                    ← Back to My Orders
                </button>

                <h2>My Order Details</h2>

                {/* Order Info */}
                <div className="order-detail-section">
                    <h3>Order Information</h3>
                    <p>Order Date: {order.date}</p>
                    <p>Order ID: {order.id}</p>
                    <p>Order Type: Online Store</p>
                    <p>Order Status: {order.status}</p>
                </div>

                {/* Shipping Address — จาก BuyOrder */}
                <div className="order-detail-section">
                    <h3>Shipping Address</h3>
                    <p>{order.Firstname} {order.Lastname}</p>
                    <p>{order.Address_Desc}</p>
                    <p>{order.Town} {order.Postcode}</p>
                    <p>{order.Country}</p>
                    <p>{order.Phonenumber}</p>
                </div>

                {/* Delivery Date */}
                <div className="order-detail-section">
                    <h3>Delivery Date</h3>
                    <p>Package from: {order.date}</p>
                    <p>Estimated Delivery: {estimatedDelivery}</p>
                </div>

                {/* Payment Method — จาก BuyOrder */}
                <div className="order-detail-section">
                    <h3>Payment Method</h3>
                    {order.Cardnumber
                        ? <p>Card ending in **** {order.Cardnumber.slice(-4)}</p>
                        : <p>No payment method on file</p>
                    }
                </div>

                {/* Order Summary — items จาก order_items */}
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
                                    <p>Size: {item.Size_Name}</p>
                                    <p>Price: ${item.Price}</p>
                                    <p>Quantity: {item.Quantity}</p>
                                    <p>Total: ${item.Price * item.Quantity}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No items</p>
                    )}

                    {/* Totals */}
                    <div className="order-detail-totals">
                        <div className="order-detail-total-row">
                            <span>Subtotal</span>
                            <span>${order.total}</span>
                        </div>
                        <div className="order-detail-total-row">
                            <span>Shipping Fee</span>
                            <span>${order.shipping_fee || '0.00'}</span>
                        </div>
                        <div className="order-detail-total-row order-detail-grand">
                            <span><strong>Grand Total</strong></span>
                            <span><strong>${(parseFloat(order.total || 0) + parseFloat(order.shipping_fee || 0)).toFixed(2)}</strong></span>
                        </div>
                    </div>
                </div>

                {/* Back button bottom */}
                <button
                    className="order-detail-back"
                    onClick={() => navigate('/settings', { state: { tab: 'orders' } })}
                >
                    ← Back to My Orders
                </button>

            </div>
        </div>
    )
}