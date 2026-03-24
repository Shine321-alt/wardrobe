import React from 'react';
import Sidebar from '../components/History/Sidebar';
import OrderCard from '../components/History/OrderCard';
import '../styles/MyPurchase.css';

export default function MyPurchase() {
  const orders = [
    {
      id: '44112233556778899-6723401',
      date: 'September 14, 2025 at 9:12 PM',
      type: 'Online Store',
      status: 'Your order has been shipped from our warehouse.',
      estimatedDelivery: 'September 16–18, 2025 (Excludes remote areas)',
      carrier: 'J&T Express',
      trackingNumber: 'JT9981234561H',
    },
    {
      id: '77334455668899001-5627814',
      date: 'August 22, 2025 at 7:18 PM',
      type: 'Online Store',
      status: 'Your order is being prepared for shipment.',
      estimatedDelivery: 'August 24–26, 2025 (Excludes remote areas)',
      carrier: 'Kerry Express',
      trackingNumber: 'JT8997785551H',
    },
    {
      id: '88433221109776655-3409128',
      date: 'July 18, 2025 at 2:36 PM',
      type: 'Online Store',
      status: 'Your order is out for delivery.',
      estimatedDelivery: 'July 19–21, 2025 (Excludes remote areas)',
      carrier: 'Flash Express',
      trackingNumber: 'TH8544433221TH',
    },
  ];

  return (
    <div className="my-purchase-container">
      <Sidebar />

      <main className="main-content">
        <div className="content-wrapper">
          <h1 className="page-header">My Orders</h1>

          <div className="description-box">
            <p>
              You may cancel your order within 30 minutes of purchase by clicking "Cancel Order". Once canceled, your order will be automatically processed as canceled if the shipping status indicates that the order has not yet been completed.
            </p>
          </div>

          <div className="order-count">
            {orders.length} orders out of {orders.length}
          </div>

          <div>
            {orders.map((order, index) => (
              <OrderCard key={index} order={order} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
