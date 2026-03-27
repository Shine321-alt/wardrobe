// MyPurchasesTab.jsx
import { useNavigate } from 'react-router-dom'

const MOCK_ORDERS = [
  {
    id: '44112233-5566778899-6723401',
    date: 'September 14, 2025 at 9:12 PM',
    type: 'Online Store',
    status: 'Your order has been shipped from our warehouse.',
    delivery: 'September 16–18, 2025 (Excludes remote areas)',
    carrier: 'J&T Express',
    tracking: 'JT9988123456TH',
  },
  {
    id: '77334455-6688990011-5627814',
    date: 'August 22, 2025 at 7:18 PM',
    type: 'Online Store',
    status: 'Your order is being prepared for shipment.',
    delivery: 'August 24–26, 2025 (Excludes remote areas)',
    carrier: 'Kerry Express',
    tracking: 'JT8899776655TH',
  },
  {
    id: '88443322-1199776655-3409128',
    date: 'July 18, 2025 at 2:36 PM',
    type: 'Online Store',
    status: 'Your order is out for delivery.',
    delivery: 'July 19–21, 2025 (Excludes remote areas)',
    carrier: 'Flash Express',
    tracking: 'THP55443322 1TH',
  },
]

export default function MyPurchasesTab() {
  const navigate = useNavigate()

  return (
    <main className="settings-content">
      <div className="settings-orders-box">
        <div className="settings-orders-header">
          <h2>My Orders</h2>
          <p className="settings-orders-note">
            You may cancel your order within 30 minutes of purchase by clicking
            "Cancel Order." Once canceled, your order will be automatically
            processed as canceled if the shipping status indicates that the
            order has not yet been completed.
          </p>
        </div>

        <div className="settings-orders-count">
          {MOCK_ORDERS.length} orders out of {MOCK_ORDERS.length}
        </div>

        {MOCK_ORDERS.map(order => (
          <div key={order.id} className="settings-order-item">
            <div className="settings-order-info">
              <p className="settings-order-date">Order Date: {order.date}</p>
              <div className="settings-order-meta">
                <p>Order ID: {order.id}</p>
                <p>Order Type: {order.type}</p>
                <p>Order Status: {order.status}</p>
                <p>Estimated Delivery: {order.delivery}</p>
                <p>Carrier: {order.carrier}</p>
                <p>Tracking Number: <a href="#">{order.tracking}</a></p>
              </div>
            </div>
            <button
              className="settings-details-btn"
              onClick={() =>
                navigate(`/settings/orders/${encodeURIComponent(order.id)}`,
                  { state: { order } }
                )
              }
            >
              Details
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}