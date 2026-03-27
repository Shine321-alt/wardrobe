// ShippingAddressTab.jsx
export default function ShippingAddressTab() {
  return (
    <main className="settings-content">
      <h2 className="settings-content-title">Saved Shipping Addresses</h2>
      <div className="settings-empty-state">
        <p>
          You currently have no saved shipping addresses. Add an address here,
          and it will be automatically filled in during checkout to make the
          process faster.
        </p>
        <button className="settings-add-btn">Add Address</button>
      </div>
    </main>
  )
}