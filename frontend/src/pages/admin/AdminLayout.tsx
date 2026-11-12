import { NavLink, Outlet } from 'react-router-dom'

const TABS = [['/admin', 'Products', true], ['/admin/categories', 'Categories', false], ['/admin/customers', 'Customer access', false], ['/admin/previews', 'Preview rooms', false], ['/admin/settings', 'Shop settings', false]] as const

export default function AdminLayout() {
  return (
    <div className="container-x py-8">
      <h1 className="text-3xl font-bold">Admin dashboard</h1>
      <nav className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-2" aria-label="Admin">
        {TABS.map(([to, l, end]) => <NavLink key={to} to={to} end={end} className={({ isActive }) => `chip whitespace-nowrap !px-4 !py-2 text-sm ${isActive ? 'chip-on' : ''}`}>{l}</NavLink>)}
      </nav>
      <div className="mt-6"><Outlet /></div>
    </div>
  )
}