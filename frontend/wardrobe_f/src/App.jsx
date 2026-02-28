import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './layouts/Layout'
import HomePage from './pages/HomePage'
import './styles/ComingSoon.css'
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
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/men" element={<ComingSoon label="Men" />} />
          <Route path="/women" element={<ComingSoon label="Women" />} />
          <Route path="/kid" element={<ComingSoon label="Kid" />} />
          <Route path="/new" element={<ComingSoon label="New Arrivals" />} />
          <Route path="/category/:slug" element={<ComingSoon label="Category" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
