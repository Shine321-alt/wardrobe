// SettingsSidebar.jsx — sidebar สำหรับหน้า Settings ทุก tab

const IconUser = () => (
  <svg viewBox="0 0 24 24"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
)
const IconCard = () => (
  <svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>
)
const IconBox = () => (
  <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73L13 2.27a2 2 0 0 0-2 0L4 6.27A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
)
const IconBag = () => (
  <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
)

const NAV_ITEMS = [
  { key: 'account',  label: 'Account Details',  Icon: IconUser },
  { key: 'payment',  label: 'Payment Methods',   Icon: IconCard },
  { key: 'shipping', label: 'Shipping Address',  Icon: IconBox  },
  { key: 'orders',   label: 'My Purchases',      Icon: IconBag  },
]

export default function SettingsSidebar({ activeTab, onTabChange }) {
  return (
    <aside className="settings-sidebar">
      <h1 className="settings-sidebar-title">Settings</h1>
      <nav className="settings-sidebar-nav">
        {NAV_ITEMS.map(({ key, label, Icon }) => (
          <button
            key={key}
            className={`settings-nav-item ${activeTab === key ? 'active' : ''}`}
            onClick={() => onTabChange(key)}
          >
            <Icon />
            {label}
          </button>
        ))}
      </nav>
    </aside>
  )
}