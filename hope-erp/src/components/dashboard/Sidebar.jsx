import { useState } from 'react'
import {
  BarChart3, Briefcase, ChevronLeft, ChevronRight, LayoutDashboard,
  LogOut, Package, ShieldCheck, TrendingUp, Users,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { glass, gradBg } from '../ui/styles'

const NAV = [
  { title: null, items: [{ id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['superadmin', 'admin', 'user'] }] },
  {
    title: 'Modules',
    items: [
      { id: 'customers', icon: Users, label: 'Customers', roles: ['superadmin', 'admin', 'user'] },
      { id: 'products', icon: Package, label: 'Products', roles: ['superadmin', 'admin', 'user'] },
      { id: 'hr', icon: Briefcase, label: 'Human Resources', roles: ['superadmin', 'admin', 'user'] },
      { id: 'sales', icon: TrendingUp, label: 'Sales', roles: ['superadmin', 'admin', 'user'] },
      { id: 'reports', icon: BarChart3, label: 'Reports', roles: ['superadmin', 'admin', 'user'] },
    ],
  },
  { title: 'Administration', items: [{ id: 'users', icon: ShieldCheck, label: 'User Management', roles: ['superadmin', 'admin'] }] },
]

const MODULE_IDS = ['customers', 'products', 'hr', 'sales', 'reports']

export default function Sidebar({ page, onNavigate }) {
  const { currentUser, canModule, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)

  const visible = (item) => {
    if (!item.roles.includes(currentUser.role)) return false
    if (currentUser.role === 'user' && MODULE_IDS.includes(item.id) && !canModule(item.id)) return false
    return true
  }

  return (
    <aside
      className={`${glass} sticky top-4 flex h-[calc(100vh-32px)] shrink-0 flex-col rounded-[28px] transition-[width] duration-200
        ${collapsed ? 'w-[76px]' : 'w-64'} max-[600px]:static max-[600px]:h-auto max-[600px]:w-full max-[600px]:flex-row`}
    >
      <div className={`flex items-center px-4 pt-4 pb-3 ${collapsed ? 'justify-center' : 'justify-between'} max-[600px]:hidden`}>
        <div className={`flex min-w-0 items-center gap-3 ${collapsed ? '' : 'pr-2'}`}>
          <div className={`${gradBg} flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] font-extrabold text-white`}>H</div>
          {!collapsed && <span className="truncate text-[1.05rem] font-extrabold text-slate-900">Hope, Inc. ERP</span>}
        </div>
        <button
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          onClick={() => setCollapsed((value) => !value)}
          className={`${collapsed ? 'absolute right-[-12px] top-[68px]' : ''} flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full
            border border-white/80 bg-white text-slate-600 shadow-md transition hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-500`}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-1.5 max-[600px]:flex max-[600px]:overflow-x-auto max-[600px]:p-2">
        {NAV.map((group) => {
          const items = group.items.filter(visible)
          if (!items.length) return null
          return (
            <div key={group.title ?? 'root'} className="mb-[18px] max-[600px]:mb-0 max-[600px]:flex">
              {group.title && !collapsed && (
                <div className="mb-1.5 px-3 text-[.68rem] font-bold uppercase tracking-[.09em] text-slate-500 max-[600px]:hidden">
                  {group.title}
                </div>
              )}
              {items.map((item) => {
                const active = page === item.id
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    title={collapsed ? item.label : undefined}
                    onClick={() => onNavigate(item.id)}
                    className={`mb-[3px] flex w-full cursor-pointer items-center gap-3 rounded-[14px] border px-3.5 py-[11px] text-left
                      text-[.9rem] font-semibold transition-all duration-150 max-[600px]:mx-0.5 max-[600px]:mb-0 max-[600px]:w-auto max-[600px]:shrink-0
                      ${collapsed ? 'justify-center px-0' : ''}
                      ${active
                        ? `${gradBg} border-white/40 text-white shadow-[0_10px_22px_-10px_rgba(91,134,240,.9),inset_0_1px_0_rgba(255,255,255,.4)]`
                        : 'border-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900'}`}
                  >
                    <Icon aria-hidden="true" className="h-[19px] w-[19px] shrink-0" strokeWidth={1.8} />
                    <span className={`truncate ${collapsed ? 'hidden max-[600px]:inline' : ''}`}>{item.label}</span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-[rgba(120,145,210,.22)] p-3 max-[600px]:hidden">
        <button
          type="button"
          onClick={logout}
          title={collapsed ? `${currentUser.name} · Logout` : undefined}
          className={`flex w-full cursor-pointer items-center gap-2.5 rounded-2xl p-2 text-left text-slate-800 transition hover:bg-white/70
            ${collapsed ? 'justify-center' : ''}`}
        >
          <div className={`${gradBg} flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[13px] font-extrabold text-white`}>
            {(currentUser.firstName[0] || 'U').toUpperCase()}
          </div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[.85rem] font-bold">{currentUser.name}</div>
                <div className="text-[.68rem] uppercase tracking-[.05em] text-slate-500">{currentUser.role}</div>
              </div>
              <LogOut aria-hidden="true" className="h-4 w-4 text-slate-500" />
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
