import React from 'react';

export default function OrderCard({ order }) {
  return (
    <div className="order-card">
      {/* Header with Date and Details Button */}
      <div className="order-card-header">
        <div>
          <h3 className="order-card-title">
            Order Date: {order.date}
          </h3>
        </div>
        <button className="details-button">
          Details
        </button>
      </div>

      {/* Order Information */}
      <div className="order-info">
        <div className="order-info-item">
          <span className="order-info-label">Order ID:</span>
          <span className="order-info-value">{order.id}</span>
        </div>

        <div className="order-info-item">
          <span className="order-info-label">Order Type:</span>
          <span className="order-info-value">{order.type}</span>
        </div>

        <div className="order-info-item">
          <span className="order-info-label">Order Status:</span>
          <span className="order-info-value">{order.status}</span>
        </div>

        <div className="order-info-item">
          <span className="order-info-label">Estimated Delivery:</span>
          <span className="order-info-value">{order.estimatedDelivery}</span>
        </div>

        <div className="order-info-item">
          <span className="order-info-label">Carrier:</span>
          <span className="order-info-value">{order.carrier}</span>
        </div>

        <div className="order-info-item">
          <span className="order-info-label">Tracking Number:</span>
          <span className="tracking-link">{order.trackingNumber}</span>
        </div>
      </div>
    </div>
  );
}
