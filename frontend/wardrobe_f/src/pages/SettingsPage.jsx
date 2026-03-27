// SettingsPage.jsx — page หลักที่ render tab ต่างๆ
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import SettingsSidebar      from '../components/Settings/SettingsSidebar'
import AccountDetailsTab    from '../components/Settings/AccountDetailsTab'
import PaymentMethodsTab    from '../components/Settings/PaymentMethodsTab'
import ShippingAddressTab   from '../components/Settings/ShippingAddressTab'
import MyPurchasesTab       from '../components/Settings/MyPurchasesTab'
import '../styles/SettingsPage.css'

export default function SettingsPage() {
  const location = useLocation()
  const initialTab = location.state?.tab || 'account'
  const [activeTab, setActiveTab] = useState(initialTab)

  const renderTab = () => {
    switch (activeTab) {
      case 'payment':  return <PaymentMethodsTab />
      case 'shipping': return <ShippingAddressTab />
      case 'orders':   return <MyPurchasesTab />
      default:         return <AccountDetailsTab />
    }
  }

  return (
    <div className="settings-page">
      <SettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {renderTab()}
    </div>
  )
}