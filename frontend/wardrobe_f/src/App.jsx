// ===============================
// Import React Router และ component หลัก
// ===============================

// BrowserRouter = ตัวควบคุม routing ทั้งแอป (ใช้ history API)
// Routes = container สำหรับ Route ทั้งหมด
// Route = กำหนด path → component
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Layout = layout หลัก (header/footer ครอบทุกหน้า)
import Layout from './layouts/Layout'

// ===============================
// Import Pages ต่าง ๆ
// ===============================
import HomePage from './pages/HomePage'
import Productpage from './pages/ProductPage'
import './styles/ComingSoon.css'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import WishlistPage from './pages/WishlistPage'
import CategoryPage from './pages/Categorypage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import MenPage from './pages/MenPage'
import WomenPage from './pages/WomenPage'
import KidPage   from './pages/KidPage'
import NewPage   from './pages/NewPage'
import CartPage from './pages/CartPage'
import ProtectedRoute from './components/ProtectedRoute'
import SettingsPage from './pages/SettingsPage'
import OrderDetailPage from './components/Settings/Orderdetailpage'
import CheckoutPage from './pages/CheckoutPage'
import PaymentPage from './pages/PaymentPage'
import SearchPage from './pages/SearchPage'


// ===============================
// Placeholder Page (Coming Soon)
// ===============================

// ใช้แทนหน้าที่ยังไม่ทำเสร็จ เช่น /sale
const ComingSoon = ({ label }) => (
  <div className="coming-soon">
    <p>{label} — Coming Soon</p>
  </div>
)


// ===============================
// Component: App (Root ของแอป)
// ===============================
export default function App() {

  return (

    // ===============================
    // BrowserRouter ครอบทั้งแอป
    // ===============================
    <BrowserRouter>

      <Routes>


        {/* ==========================================
           Auth Pages (ไม่ใช้ Layout)
        ========================================== */}

        {/* หน้า login */}
        <Route path="/login" element={<LoginPage />} />

        {/* หน้า signup */}
        <Route path="/signup" element={<SignUpPage />} />

        {/* forgot password */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* reset password (มี token) */}
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />


        {/* ==========================================
           Public Pages (ใช้ Layout)
        ========================================== */}

        {/* Route กลุ่มนี้จะถูกครอบด้วย Layout */}
        <Route element={<Layout />}>

          {/* หน้า Home */}
          <Route path="/" element={<HomePage />} />

          {/* หน้า category หลัก */}
          <Route path="/men"   element={<MenPage />} />
          <Route path="/women" element={<WomenPage />} />
          <Route path="/kid"   element={<KidPage />} />
          <Route path="/new"   element={<NewPage />} />

          {/* Sale (ยังไม่เสร็จ) */}
          <Route path="/sale" element={<ComingSoon label="Sale" />} />

          {/* หน้า product detail */}
          <Route path="/product/:id" element={<Productpage />} />

          {/* wishlist */}
          <Route path="/wishlist" element={<WishlistPage />} />

          {/* dynamic category เช่น /men/t-shirts */}
          <Route path="/:type/:category" element={<CategoryPage />} />

          {/* search */}
          <Route path="/search" element={<SearchPage />} />

        </Route>


        {/* ==========================================
           Protected Pages (ต้อง login)
        ========================================== */}

        {/* ใช้ ProtectedRoute ครอบ */}
        <Route element={<ProtectedRoute />}>

          {/* และยังใช้ Layout อีกชั้น */}
          <Route element={<Layout />}>

            {/* cart */}
            <Route path="/cart" element={<CartPage />} />

            {/* settings */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* order detail */}
            <Route path="/settings/orders/:id" element={<OrderDetailPage />} />

            {/* checkout */}
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* payment */}
            <Route path="/checkout/payment" element={<PaymentPage />} />

          </Route>
        </Route>


      </Routes>
    </BrowserRouter>
  )
}