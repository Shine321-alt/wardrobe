import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import HomePage from './pages/HomePage'
import Productpage from './pages/ProductPage'
import './styles/ComingSoon.css'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import WishlistPage from './pages/WishlistPage'

import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import MenPage from './pages/MenPage'
import CartPage from './pages/CartPage'
import ProtectedRoute from './components/ProtectedRoute'
import SettingsPage from './pages/SettingsPage'
import MyPurchaseDetailPage from './pages/MyPurchaseDetailPage'

// Placeholder pages
const ComingSoon = ({ label }) => (
  <div className="coming-soon">
    <p>{label} — Coming Soon</p>
  </div>
)

export default function App() {
  return (
  <BrowserRouter>
    <Routes>

      {/* Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      {/* Public pages */}
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/men" element={<MenPage />} />
        <Route path="/women" element={<ComingSoon label="Women" />} />
        <Route path="/kid" element={<ComingSoon label="Kid" />} />
        <Route path="/new" element={<ComingSoon label="New Arrivals" />} />
        <Route path="/sale" element={<ComingSoon label="Sale" />} />
        <Route path="/category/:slug" element={<ComingSoon label="Category" />} />
        <Route path="/product/:id" element={<Productpage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
      </Route>

      {/* Protected pages — ต้อง login */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/orders/:id" element={<MyPurchaseDetailPage />} />  
        </Route>
      </Route>

    </Routes>
  </BrowserRouter>
  )
}