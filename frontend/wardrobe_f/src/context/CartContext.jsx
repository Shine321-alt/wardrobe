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

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

  // GET /api/cart
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/cart`, {
        withCredentials: true,
      });

      setCart(res.data.items);
      setTotalItems(res.data.total_items);
      setTotalPrice(res.data.total_price);

    } catch (err) {
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
        `${API_URL}/api/cart`,
        { variant_id: variantId, quantity },
        { withCredentials: true }
      );
      await fetchCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  // PUT /api/cart/<cart_id>
  const updateQuantity = async (cartId, quantity) => {
    if (quantity < 1) return;

    setCart(prev => {
      const updated = prev.map(item =>
        item.Cart_ID === cartId ? { ...item, Quantity: quantity } : item
      );
      setTotalItems(updated.reduce((sum, item) => sum + item.Quantity, 0));
      setTotalPrice(updated.reduce((sum, item) => sum + item.Price * item.Quantity, 0));
      return updated;
    });

    try {

      await axios.put(
        `${API_URL}/api/cart/${cartId}`,
        { quantity },
        { withCredentials: true }
      );
    } catch (err) {
      console.error('Error updating quantity:', err);
      fetchCart();
    }
  };

  const removeFromCart = async (cartId) => {
    setCart(prev => {
      const updated = prev.filter(item => item.Cart_ID !== cartId);
      setTotalItems(updated.reduce((sum, item) => sum + item.Quantity, 0));
      setTotalPrice(updated.reduce((sum, item) => sum + item.Price * item.Quantity, 0));
      return updated;
    });

    try {

      await axios.delete(`${API_URL}/api/cart/${cartId}`, {
        withCredentials: true,
      });
    } catch (err) {
      console.error('Error removing item:', err);
      fetchCart();
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
