// ===============================
// Import React hooks และ library ที่จำเป็น
// ===============================

// createContext = สร้าง context สำหรับ cart
// useState = เก็บ state (cart, totalItems, totalPrice)
// useEffect = ใช้โหลด cart ตอน user เปลี่ยน
// useContext = ใช้เรียก context
import React, { createContext, useState, useEffect, useContext } from 'react';

// axios = ใช้เรียก API
import axios from 'axios';

// useAuth = ใช้ดูว่า user login อยู่หรือไม่
import { useAuth } from './AuthContext';


// ===============================
// สร้าง CartContext
// ===============================
const CartContext = createContext();


// ===============================
// Component: CartProvider
// ===============================

// ใช้ครอบ app เพื่อให้ทุก component เข้าถึง cart ได้
export const CartProvider = ({ children }) => {

    // ===============================
    // ดึง user จาก AuthContext
    // ===============================
    const { user } = useAuth();

    // ===============================
    // State ต่าง ๆ ของ cart
    // ===============================

    // list ของสินค้าใน cart
    const [cart, setCart]             = useState([]);

    // จำนวน item รวมทั้งหมด
    const [totalItems, setTotalItems] = useState(0);

    // ราคารวมทั้งหมด
    const [totalPrice, setTotalPrice] = useState(0);

    // loading state (ตอนเรียก API)
    const [loading, setLoading]       = useState(false);


    // ===============================
    // กำหนด API URL
    // ===============================
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"


    // ==========================================
    // GET /api/cart → ดึงข้อมูล cart
    // ==========================================
    const fetchCart = async () => {

        // เริ่ม loading
        setLoading(true);

        try {

            // เรียก backend
            const res = await axios.get(`${API_URL}/api/cart`, {
                withCredentials: true, // ส่ง cookie (สำคัญสำหรับ auth)
            });

            // ===============================
            // set state จาก response
            // ===============================
            setCart(res.data.items);
            setTotalItems(res.data.total_items);
            setTotalPrice(res.data.total_price);

        } catch (err) {

            // ถ้า unauthorized (ยังไม่ login)
            if (err.response?.status === 401) {

                // reset cart
                setCart([]);
                setTotalItems(0);
                setTotalPrice(0);

            } else {

                console.error('Error fetching cart:', err);
            }

        } finally {

            // ปิด loading
            setLoading(false);
        }
    };


    // ==========================================
    // POST /api/cart → เพิ่มสินค้า
    // ==========================================
    const addToCart = async (variantId, quantity = 1) => {

        try {

            // ส่ง variant_id + quantity ไป backend
            await axios.post(
                `${API_URL}/api/cart`,
                { variant_id: variantId, quantity },
                { withCredentials: true }
            );

            // reload cart ใหม่
            await fetchCart();

        } catch (err) {

            console.error('Error adding to cart:', err);
        }
    };


    // ==========================================
    // PUT /api/cart/<cart_id> → อัปเดตจำนวน
    // ==========================================
    const updateQuantity = async (cartId, quantity) => {

        // กันค่า quantity ต่ำกว่า 1
        if (quantity < 1) return;


        // ===============================
        // Optimistic UI (update ก่อนเรียก API)
        // ===============================
        setCart(prev => {

            // map เพื่อแก้เฉพาะ item ที่ตรง cartId
            const updated = prev.map(item =>
                item.Cart_ID === cartId 
                ? { ...item, Quantity: quantity } 
                : item
            );

            // คำนวณ total ใหม่
            setTotalItems(
                updated.reduce((sum, item) => sum + item.Quantity, 0)
            );

            setTotalPrice(
                updated.reduce((sum, item) => sum + item.Price * item.Quantity, 0)
            );

            return updated;
        });


        try {

            // เรียก backend เพื่อ update จริง
            await axios.put(
                `${API_URL}/api/cart/${cartId}`,
                { quantity },
                { withCredentials: true }
            );

        } catch (err) {

            console.error('Error updating quantity:', err);

            // ถ้า error → reload cart จาก backend (rollback)
            fetchCart();
        }
    };


    // ==========================================
    // DELETE /api/cart/<cart_id> → ลบสินค้า
    // ==========================================
    const removeFromCart = async (cartId) => {

        // ===============================
        // Optimistic UI (ลบก่อน)
        // ===============================
        setCart(prev => {

            // filter เอา item ที่ไม่ใช่ cartId
            const updated = prev.filter(item => item.Cart_ID !== cartId);

            // คำนวณ total ใหม่
            setTotalItems(
                updated.reduce((sum, item) => sum + item.Quantity, 0)
            );

            setTotalPrice(
                updated.reduce((sum, item) => sum + item.Price * item.Quantity, 0)
            );

            return updated;
        });


        try {

            // เรียก backend เพื่อลบจริง
            await axios.delete(`${API_URL}/api/cart/${cartId}`, {
                withCredentials: true,
            });

        } catch (err) {

            console.error('Error removing item:', err);

            // ถ้า error → reload cart
            fetchCart();
        }
    };


    // ==========================================
    // useEffect: โหลด cart เมื่อ user เปลี่ยน
    // ==========================================
    useEffect(() => {

        // ถ้า login → โหลด cart
        // ถ้า logout → fetchCart จะ reset เอง
        fetchCart();

    }, [user]);


    // ==========================================
    // Provider (แชร์ข้อมูล cart ทั้งแอป)
    // ==========================================
    return (

        <CartContext.Provider
            value={{
                cart,            // list สินค้า
                totalItems,      // จำนวนรวม
                totalPrice,      // ราคารวม
                loading,         // loading state
                fetchCart,       // ดึง cart ใหม่
                addToCart,       // เพิ่มสินค้า
                updateQuantity,  // แก้จำนวน
                removeFromCart,  // ลบสินค้า
            }}
        >
            {children}
        </CartContext.Provider>
    );
};


// ===============================
// Hook: useCart
// ===============================

// ใช้เรียก context ได้ง่าย เช่น:
// const { cart, addToCart } = useCart()
export const useCart = () => useContext(CartContext);