// ===============================
// Import library และ component ที่จำเป็น
// ===============================

// React (ใช้สำหรับ JSX component)
import React from 'react';

// Link = ใช้เปลี่ยนหน้าแบบไม่ reload
// useNavigate = ใช้ redirect ไปหน้าอื่น
import { Link, useNavigate } from 'react-router-dom';

// useCart = context สำหรับจัดการ cart ทั้งระบบ
import { useCart } from '../context/CartContext';

// import CSS ของหน้า cart
import '../styles/CartPage.css';


// ===============================
// Icons (SVG ใช้เอง ไม่ได้ใช้ library)
// ===============================

// icon ลบสินค้า
const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
  </svg>
);

// icon เพิ่มจำนวน
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14"/>
  </svg>
);

// icon ลดจำนวน
const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14"/>
  </svg>
);


// ===============================
// Component: CartItem (สินค้า 1 ชิ้น)
// ===============================
const CartItem = ({ item, onRemove, onUpdateQty }) => {

  // stock ของสินค้า (ถ้าไม่มี → ใช้ Infinity = ไม่จำกัด)
  const stock = item.Stock ?? Infinity;

  // เช็คว่าจำนวนถึง stock สูงสุดแล้วหรือยัง
  const atMax = item.Quantity >= stock;

  return (
    <div className="cart-item">

      {/* ===============================
         รูปสินค้า
      =============================== */}
      <div className="cart-item__image">

        {item.Image_URL ? (
          <img src={item.Image_URL} alt={item.Product_Name} />
        ) : (
          // fallback ถ้าไม่มีรูป
          <div className="cart-item__image-placeholder">No Image</div>
        )}

      </div>


      {/* ===============================
         รายละเอียดสินค้า
      =============================== */}
      <div className="cart-item__details">

        {/* ข้อมูลบน (ชื่อ + ราคา) */}
        <div className="cart-item__top">

          <div className="cart-item__info">

            {/* ชื่อสินค้า */}
            <h3 className="cart-item__name">{item.Product_Name}</h3>

            {/* หมวดหมู่ / สี / size */}
            <p className="cart-item__meta">{item.Category}</p>
            <p className="cart-item__meta">{item.Color_Name}</p>
            <p className="cart-item__meta">Size {item.Size_Name}</p>
          </div>

          {/* ราคา */}
          <span className="cart-item__price">
            ${Number(item.Price).toFixed(2)}
          </span>
        </div>


        {/* ===============================
           ปุ่ม actions (ลบ / เพิ่มลดจำนวน)
        =============================== */}
        <div className="cart-item__actions">

          {/* ปุ่มลบสินค้า */}
          <button
            className="cart-item__btn"
            onClick={() => onRemove(item.Cart_ID)}
            title="Remove item"
          >
            <TrashIcon />
          </button>


          {/* ===============================
             Quantity control
          =============================== */}
          <div className="cart-item__qty">

            {/* ลดจำนวน */}
            <button
              className="cart-item__btn"
              onClick={() => onUpdateQty(item.Cart_ID, item.Quantity - 1)}
              disabled={item.Quantity <= 1} // ห้ามต่ำกว่า 1
              title="Decrease quantity"
            >
              <MinusIcon />
            </button>

            {/* จำนวนปัจจุบัน */}
            <span className="cart-item__qty-value">{item.Quantity}</span>

            {/* เพิ่มจำนวน */}
            <button
              className="cart-item__btn"
              onClick={() => onUpdateQty(item.Cart_ID, item.Quantity + 1)}
              disabled={atMax} // ห้ามเกิน stock
              title={atMax ? `Maximum stock: ${stock}` : 'Increase quantity'}
            >
              <PlusIcon />
            </button>
          </div>


          {/* ===============================
             แจ้งเตือนเมื่อถึง stock สูงสุด
          =============================== */}
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


// ===============================
// Component: CartPage (หน้าหลัก)
// ===============================
const CartPage = () => {

  // ใช้ redirect
  const navigate = useNavigate();

  // ดึงข้อมูลจาก CartContext
  const { cart, totalItems, totalPrice, loading, removeFromCart, updateQuantity } = useCart();


  // ===============================
  // Loading state
  // ===============================
  if (loading) {
    return (
      <div className="cart-loading">
        <p>Loading your bag...</p>
      </div>
    );
  }


  // ===============================
  // UI หลักของหน้า cart
  // ===============================
  return (
    <div className="cart-page">

      <div className="cart-page__inner">

        {/* ===============================
           ฝั่งซ้าย: รายการสินค้า
        =============================== */}
        <div className="cart-page__left">

          <h1 className="cart-page__title">Bag</h1>

          {/* ถ้า cart ว่าง */}
          {!cart || cart.length === 0 ? (

            <div className="cart-empty">
              <p>There are no items in your bag.</p>

              {/* ปุ่มกลับไป shopping */}
              <Link to="/" className="cart-empty__link">
                Continue Shopping
              </Link>
            </div>

          ) : (

            // มีสินค้า → แสดง list
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


        {/* ===============================
           ฝั่งขวา: Order Summary
        =============================== */}
        <div className="cart-page__right">

          <h2 className="cart-summary__title">Order Summary</h2>

          {/* subtotal */}
          <div className="cart-summary__row">
            <span>Subtotal ({totalItems} items)</span>
            <span>${Number(totalPrice).toFixed(2)}</span>
          </div>

          {/* shipping */}
          <div className="cart-summary__row">
            <span>Estimated Shipping &amp; Handling Fee</span>
            <span className="cart-summary__free">free</span>
          </div>

          {/* total */}
          <div className="cart-summary__total">
            <span>Total</span>
            <span>${Number(totalPrice).toFixed(2)}</span>
          </div>

          {/* ปุ่ม checkout */}
          <button
            className="cart-checkout-btn"

            // disable ถ้า cart ว่าง
            disabled={!cart || cart.length === 0}

            // กดแล้วไปหน้า checkout
            onClick={() => navigate('/checkout')}
          >
            CheckOut
          </button>
        </div>

      </div>
    </div>
  );
};


// export component
export default CartPage;