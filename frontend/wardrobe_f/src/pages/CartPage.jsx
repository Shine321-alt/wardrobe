import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import '../styles/CartPage.css';

// ── Icons ──────────────────────────────────────────────────────────────────────
const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
  </svg>
);

const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14"/>
  </svg>
);

// ── CartItem Component ─────────────────────────────────────────────────────────
const CartItem = ({ item, onRemove, onUpdateQty }) => {
  const stock = item.Stock ?? Infinity;
  const atMax = item.Quantity >= stock;

  return (
    <div className="cart-item">
      <div className="cart-item__image">
        {item.Image_URL ? (
          <img src={item.Image_URL} alt={item.Product_Name} />
        ) : (
          <div className="cart-item__image-placeholder">No Image</div>
        )}
      </div>

      <div className="cart-item__details">
        <div className="cart-item__top">
          <div className="cart-item__info">
            <h3 className="cart-item__name">{item.Product_Name}</h3>
            <p className="cart-item__meta">{item.Category}</p>
            <p className="cart-item__meta">{item.Color_Name}</p>
            <p className="cart-item__meta">Size {item.Size_Name}</p>
          </div>
          <span className="cart-item__price">
            ${Number(item.Price).toFixed(2)}
          </span>
        </div>

        <div className="cart-item__actions">
          <button
            className="cart-item__btn"
            onClick={() => onRemove(item.Cart_ID)}
            title="Remove item"
          >
            <TrashIcon />
          </button>

          <div className="cart-item__qty">
            <button
              className="cart-item__btn"
              onClick={() => onUpdateQty(item.Cart_ID, item.Quantity - 1)}
              disabled={item.Quantity <= 1}
              title="Decrease quantity"
            >
              <MinusIcon />
            </button>
            <span className="cart-item__qty-value">{item.Quantity}</span>
            <button
              className="cart-item__btn"
              onClick={() => onUpdateQty(item.Cart_ID, item.Quantity + 1)}
              disabled={atMax}
              title={atMax ? `Maximum stock: ${stock}` : 'Increase quantity'}
            >
              <PlusIcon />
            </button>
          </div>

          {/* แสดง warning เมื่อถึง stock สูงสุด */}
          {atMax && (
            <span className="cart-item__stock-warning">
              Max {stock} available
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ── CartPage ───────────────────────────────────────────────────────────────────
const CartPage = () => {
  const navigate = useNavigate();
  const { cart, totalItems, totalPrice, loading, removeFromCart, updateQuantity } = useCart();

  if (loading) {
    return (
      <div className="cart-loading">
        <p>Loading your bag...</p>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-page__inner">

        <div className="cart-page__left">
          <h1 className="cart-page__title">Bag</h1>

          {!cart || cart.length === 0 ? (
            <div className="cart-empty">
              <p>There are no items in your bag.</p>
              <Link to="/" className="cart-empty__link">Continue Shopping</Link>
            </div>
          ) : (
            <div className="cart-list">
              {cart.map((item) => (
                <CartItem
                  key={item.Cart_ID}
                  item={item}
                  onRemove={removeFromCart}
                  onUpdateQty={updateQuantity}
                />
              ))}
            </div>
          )}
        </div>

        <div className="cart-page__right">
          <h2 className="cart-summary__title">Order Summary</h2>

          <div className="cart-summary__row">
            <span>Subtotal ({totalItems} items)</span>
            <span>${Number(totalPrice).toFixed(2)}</span>
          </div>

          <div className="cart-summary__row">
            <span>Estimated Shipping &amp; Handling Fee</span>
            <span className="cart-summary__free">free</span>
          </div>

          <div className="cart-summary__total">
            <span>Total</span>
            <span>${Number(totalPrice).toFixed(2)}</span>
          </div>

          <button
            className="cart-checkout-btn"
            disabled={!cart || cart.length === 0}
            onClick={() => navigate('/checkout')}
          >
            CheckOut
          </button>
        </div>

      </div>
    </div>
  );
};

export default CartPage;