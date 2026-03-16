import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart]             = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading]       = useState(false);

  // ─────────────────────────────────────────────────────────────────
  // GET /api/cart
  // Backend ใช้ httpOnly Cookie → ไม่ต้องส่ง Authorization header
  // แค่ตั้ง withCredentials: true axios จะส่ง cookie ไปให้เอง
  // ─────────────────────────────────────────────────────────────────
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/cart`, {
        withCredentials: true,
      });

      if (res.data.status === 'success') {
        setCart(res.data.cart);
        setTotalItems(res.data.total_items);
        setTotalPrice(res.data.total_price);
      }
    } catch (err) {
      // 401 = ยังไม่ได้ login → clear ตะกร้าเงียบๆ
      if (err.response?.status === 401) {
        setCart([]);
        setTotalItems(0);
        setTotalPrice(0);
      } else {
        console.error('Error fetching cart:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  // POST /api/cart
  const addToCart = async (variantId, quantity = 1) => {
    try {
      await axios.post(
        'http://localhost:5000/api/cart',
        { variant_id: variantId, quantity },
        { withCredentials: true }
      );
      await fetchCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  // PATCH /api/cart/<cart_id>
// CartContext.jsx
// CartContext.jsx
    const updateQuantity = async (cartId, quantity) => {
    if (quantity < 1) return;

    // ✅ อัพเดท cart + คำนวณ total ใหม่ทันที
    setCart(prev => {
        const updated = prev.map(item =>
        item.Cart_ID === cartId ? { ...item, Quantity: quantity } : item
        );
        // คำนวณ total ใหม่จาก updated
        setTotalItems(updated.reduce((sum, item) => sum + item.Quantity, 0));
        setTotalPrice(updated.reduce((sum, item) => sum + item.Price * item.Quantity, 0));
        return updated;
    });

    try {
        await axios.patch(
        `http://localhost:5000/api/cart/${cartId}`,
        { quantity },
        { withCredentials: true }
        );
    } catch (err) {
        console.error('Error updating quantity:', err);
        fetchCart(); // rollback ถ้า error
    }
    };

    const removeFromCart = async (cartId) => {
    // ✅ ลบ + คำนวณ total ใหม่ทันที
    setCart(prev => {
        const updated = prev.filter(item => item.Cart_ID !== cartId);
        setTotalItems(updated.reduce((sum, item) => sum + item.Quantity, 0));
        setTotalPrice(updated.reduce((sum, item) => sum + item.Price * item.Quantity, 0));
        return updated;
    });

    try {
        await axios.delete(`http://localhost:5000/api/cart/${cartId}`, {
        withCredentials: true,
        });
    } catch (err) {
        console.error('Error removing item:', err);
        fetchCart(); // rollback ถ้า error
    }
    };
    useEffect(() => {
        fetchCart();
    }, [user]);

  return (
    <CartContext.Provider
      value={{
        cart,
        totalItems,
        totalPrice,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
