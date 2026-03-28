import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function MyPurchasesTab() {
  const navigate = useNavigate();
  
  // ✅ 1. ต้องดึง user ออกมาจาก Hook (เพื่อใช้เช็คว่า Login หรือยัง)
  const { user } = useAuth(); 
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ✅ 2. ตรวจสอบก่อนว่ามี user หรือไม่ 
    // ถ้ายังเป็น null (ยังไม่ login หรือโหลด session ไม่เสร็จ) ให้หยุดทำงานตรงนี้
    if (!user) {
      setLoading(false);
      return; 
    }

    // ✅ 3. เรียก API โดยใช้ credentials: 'include'
    // เบราว์เซอร์จะแนบ Cookie ที่มี Token ไปให้ Flask โดยอัตโนมัติ
    fetch(`${API_URL}/api/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include' 
    })
      .then(response => {
        if (!response.ok) {
          if (response.status === 401) throw new Error('Unauthorized');
          throw new Error('Failed to fetch orders');
        }
        return response.json();
      })
      .then(data => {
        setOrders(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
      
  }, [user]); // ✅ 4. ใส่ user ใน dependency array เพื่อให้ fetch ใหม่เมื่อสถานะเปลี่ยน

  // แสดง Loading เฉพาะตอนที่กำลังรอข้อมูล
  if (loading) return <div className="p-5 text-center">Loading orders...</div>;

  // ถ้าโหลดเสร็จแล้วแต่ไม่มี user (ไม่ได้ Login)
  if (!user) return <div className="p-5 text-center">Please login to view your orders.</div>;

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
          {orders.length} orders out of {orders.length}
        </div>

        {orders.length > 0 ? (
          orders.map(order => (
            <div key={order.id} className="settings-order-item">
              <div className="settings-order-info">
                <p className="settings-order-date">Order Date: {order.date}</p>
                <div className="settings-order-meta">
                  <p>Order ID: {order.id || 'N/A'}</p>
                  <p>Order Type: {order.type || 'Online Store'}</p>
                  <p>Order Status: <span className="status-badge">{order.status || 'Prepare for shipment'}</span></p>
                  <p>
                  Estimate Delivery: {
                  order.date 
                  ? new Date(new Date(order.date).setDate(new Date(order.date).getDate() + 3))
                  .toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                  : 'TBD'
                  }
                  </p>
                  <p>Carrier: {order.carrier || 'Kerry Express'}</p>
                  <p>Tracking: <a href="#" onClick={(e) => e.preventDefault()}>{order.tracking || 'THP554433221TH'}</a></p>
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
          ))
        ) : (
          <div className="text-center py-10">
            <p>You haven't made any purchases yet.</p>
          </div>
        )}
      </div>
    </main>
  );
}