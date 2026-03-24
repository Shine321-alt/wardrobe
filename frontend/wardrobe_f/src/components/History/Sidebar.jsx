import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, CreditCard, MapPin, ShoppingBag } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: User, label: 'Account Details', path: '/settings/account-details', id: 'account' },
    { icon: CreditCard, label: 'Payment Methods', path: '/settings/payment-methods', id: 'payment' },
    { icon: MapPin, label: 'Shipping Address', path: '/settings/shipping-address', id: 'shipping' },
    { icon: ShoppingBag, label: 'My Purchases', path: '/settings/my-purchases', id: 'purchases' },
  ];

  return (
    <aside className="sidebar">
      <h2>Settings</h2>
      
      <nav>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
