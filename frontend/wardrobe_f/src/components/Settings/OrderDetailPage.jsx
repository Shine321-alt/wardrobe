// OrderDetailPage.jsx — หน้าแสดงรายละเอียด order
import { useLocation, useNavigate } from 'react-router-dom'
import SettingsSidebar from './SettingsSidebar'
import '../../../styles/SettingsPage.css'

export default function OrderDetailPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const order = location.state?.order

    // ถ้าไม่มีข้อมูล order → กลับไปหน้า orders
    if (!order) {
        navigate('/settings', { state: { tab: 'orders' } })
        return null
    }

    // คำนวณ Estimated Delivery (+3 วัน)
    const estimatedDelivery = order.date
        ? new Date(new Date(order.date).setDate(new Date(order.date).getDate() + 3))
            .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
        : 'TBD'

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
                    <p>Order Date: {order.date}</p>
                    <p>Order ID: {order.id || 'N/A'}</p>
                    <p>Order Type: {order.type || 'Online Store'}</p>
                    <p>Order Status: {order.status || 'Prepare for shipment'}</p>
                    <p>Tracking Number: <a href="#">{order.tracking || 'THP554433221TH'}</a></p>
                </div>

                {/* Shipping Address */}
                <div className="order-detail-section">
                    <h3>Shipping Address</h3>
                    <p>{order.shipping?.name || 'user_First Name* user_Last Name*'}</p>
                    <p>{order.shipping?.address || 'user_Address*'}</p>
                    <p>{order.shipping?.city || 'user_City* user_State* user_ZIPcode*'}</p>
                    <p>{order.shipping?.phone || 'user_Phone Number*'}</p>
                </div>

                {/* Delivery Date */}
                <div className="order-detail-section">
                    <h3>Delivery Date</h3>
                    <p>Package from: {order.date || 'N/A'}</p>
                    <p>Estimated Delivery: {estimatedDelivery}</p>
                </div>

                {/* Payment Method */}
                <div className="order-detail-section">
                    <h3>Payment Method</h3>
                    <p>{order.payment || 'Select Payment method'}</p>
                </div>

                {/* Order Summary */}
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

                    {/* Totals */}
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