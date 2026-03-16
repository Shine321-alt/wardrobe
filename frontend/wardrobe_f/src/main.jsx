import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'   // ← เพิ่ม

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>         {/* ← เพิ่ม */}
        <App />
      </CartProvider>        {/* ← เพิ่ม */}
    </AuthProvider>
  </StrictMode>,
)