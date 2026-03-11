import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, Settings, HardHat, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '../store/store'

const nav = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Layout() {
  const [open, setOpen] = useState(false)
  const { settings } = useStore()

  return (
    <div className="flex h-screen overflow-hidden bg-cream">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-56 bg-forest-700 flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex
      `}>
        {/* Brand */}
        <div className="px-5 py-5 border-b border-forest-600">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-timber-400 rounded-sm flex items-center justify-center flex-shrink-0">
              <HardHat size={15} className="text-white" />
            </div>
            <div>
              <div className="font-display text-cream text-sm font-semibold leading-tight">
                {settings.companyName || 'Flooring Advisor'}
              </div>
              <div className="font-mono text-forest-300 text-xs">NZ · Pro Edition</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-body transition-colors
                 ${isActive
                   ? 'bg-timber-400 text-white font-bold'
                   : 'text-forest-200 hover:bg-forest-600 hover:text-white'
                 }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-5 py-4 border-t border-forest-600">
          <p className="font-mono text-forest-400 text-xs">v1.0.0</p>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-forest-700 border-b border-forest-600">
          <button onClick={() => setOpen(!open)} className="text-cream p-1">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="font-display text-cream text-sm font-semibold">
            {settings.companyName || 'Flooring Advisor'}
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
