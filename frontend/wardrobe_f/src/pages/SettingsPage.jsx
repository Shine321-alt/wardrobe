// ===============================
// Import React hook และ component ที่จำเป็น
// ===============================

// useState = ใช้เก็บ tab ที่ active อยู่
import { useState } from 'react'

// useLocation = ใช้รับค่า state ที่ส่งมาจากหน้าอื่น (เช่น redirect หลัง checkout)
import { useLocation } from 'react-router-dom'

// Sidebar ด้านซ้าย (เมนูเลือก tab)
import SettingsSidebar      from '../components/Settings/SettingsSidebar'

// Tab ต่าง ๆ
import AccountDetailsTab    from '../components/Settings/AccountDetailsTab'
import PaymentMethodsTab    from '../components/Settings/PaymentMethodsTab'
import ShippingAddressTab   from '../components/Settings/ShippingAddressTab'
import MyPurchasesTab       from '../components/Settings/MyPurchasesTab'

// import CSS
import '../styles/SettingsPage.css'


// ===============================
// Component: SettingsPage
// ===============================

// หน้านี้เป็น "ศูนย์รวมการตั้งค่า"
// เช่น:
// - Account
// - Payment
// - Shipping
// - Orders
export default function SettingsPage() {

  // ===============================
  // รับข้อมูลจาก navigation
  // ===============================
  const location = useLocation()

  // initialTab = tab ที่ถูกส่งมาจากหน้าอื่น
  // เช่น PaymentPage → ส่ง { tab: 'purchases' }
  const initialTab = location.state?.tab || 'account'


  // ===============================
  // State: tab ที่ active อยู่
  // ===============================
  const [activeTab, setActiveTab] = useState(initialTab)


  // ==========================================
  // function: render tab ตาม activeTab
  // ==========================================
  const renderTab = () => {

    switch (activeTab) {

      // ===============================
      // Payment Methods
      // ===============================
      case 'payment':
        return <PaymentMethodsTab />


      // ===============================
      // Shipping Address
      // ===============================
      case 'shipping':
        return <ShippingAddressTab />


      // ===============================
      // Orders / Purchases
      // ===============================
      case 'orders':
        return <MyPurchasesTab />


      // ===============================
      // Default: Account Details
      // ===============================
      default:
        return <AccountDetailsTab />
    }
  }


  // ===============================
  // UI
  // ===============================
  return (

    <div className="settings-page">

      {/* ==========================================
         Sidebar (เมนูเลือก tab)
         - ส่ง activeTab ไปเพื่อ highlight
         - ส่ง setActiveTab เพื่อเปลี่ยน tab
      ========================================== */}
      <SettingsSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />


      {/* ==========================================
         Content ของ tab
      ========================================== */}
      {renderTab()}

    </div>
  )
}