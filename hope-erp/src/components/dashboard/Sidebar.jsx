import { useAuth } from '../../context/AuthContext'
import { glass, gradBg } from '../ui/styles'

const NAV = [
  { title: null, items: [{ id: 'dashboard', icon: '🏠', label: 'Dashboard', roles: ['superadmin', 'admin', 'user'] }] },
  {
    title: 'Modules',
    items: [
      { id: 'customers', icon: '👥', label: 'Customers', roles: ['superadmin', 'admin', 'user'] },
      { id: 'products', icon: '📦', label: 'Products', roles: ['superadmin', 'admin', 'user'] },
      { id: 'hr', icon: '🧑‍💼', label: 'Human Resources', roles: ['superadmin', 'admin', 'user'] },
      { id: 'sales', icon: '📈', label: 'Sales', roles: ['superadmin', 'admin', 'user'] },
      { id: 'reports', icon: '📊', label: 'Reports', roles: ['superadmin', 'admin', 'user'] },
    ],
  },
  { title: 'Administration', items: [{ id: 'users', icon: '🔐', label: 'User Management', roles: ['superadmin', 'admin'] }] },
]

const MODULE_IDS = ['customers', 'products', 'hr', 'sales', 'reports']

export default function Sidebar({ page, onNavigate }) {
  const { currentUser, canModule, logout } = useAuth()

  const visible = (item) => {
    if (!item.roles.includes(currentUser.role)) return false
    if (currentUser.role === 'user' && MODULE_IDS.includes(item.id) && !canModule(item.id)) return false
    return true
  }

  return (
    <aside
      className={`${glass} sticky top-4 flex h-[calc(100vh-32px)] w-64 shrink-0 flex-col rounded-[28px] bg-white/45
        max-[960px]:w-[76px]
        max-[600px]:static max-[600px]:h-auto max-[600px]:w-full max-[600px]:flex-row`}
    >
      <div className="flex items-center gap-3 px-5 pt-[22px] pb-3.5 max-[960px]:justify-center max-[600px]:hidden">
        <div className={`${gradBg} flex h-10 w-10 items-center justify-center rounded-[13px] font-extrabold text-white`}>H</div>
        <span className="text-[1.05rem] font-extrabold max-[960px]:hidden">Hope, Inc. ERP</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-1.5 max-[600px]:flex max-[600px]:overflow-x-auto max-[600px]:p-2">
        {NAV.map((group) => {
          const items = group.items.filter(visible)
          if (!items.length) return null
          return (
            <div key={group.title ?? 'root'} className="mb-[18px] max-[600px]:mb-0 max-[600px]:flex">
              {group.title && (
                <div className="mb-1.5 px-3 text-[.68rem] font-bold uppercase tracking-[.09em] text-[#6679a3] max-[960px]:hidden">
                  {group.title}
                </div>
              )}
              {items.map((item) => {
                const active = page === item.id
                return (
                  <div
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`mb-[3px] flex cursor-pointer items-center gap-3 rounded-[14px] border px-3.5 py-[11px]
                      text-[.9rem] font-semibold transition-all duration-150 max-[960px]:justify-center
                      max-[600px]:mx-0.5 max-[600px]:mb-0 max-[600px]:shrink-0
                      ${active
                        ? `${gradBg} border-white/40 text-white shadow-[0_10px_22px_-10px_rgba(91,134,240,.9),inset_0_1px_0_rgba(255,255,255,.4)]`
                        : 'border-transparent text-[#6679a3] hover:bg-white/60 hover:text-[#1d2a4d]'}`}
                  >
                    <span className="w-[22px] text-center text-[1.1rem]">{item.icon}</span>
                    <span className="max-[960px]:hidden">{item.label}</span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </nav>

      <div className="border-t border-[rgba(120,145,210,.22)] p-3 max-[600px]:hidden">
        <div onClick={logout} className="flex cursor-pointer items-center gap-2.5 rounded-2xl p-2 hover:bg-white/60 max-[960px]:justify-center">
          <div className={`${gradBg} flex h-[38px] w-[38px] items-center justify-center rounded-[13px] font-extrabold text-white`}>
            {(currentUser.firstName[0] || 'U').toUpperCase()}
          </div>
          <div className="min-w-0 flex-1 max-[960px]:hidden">
            <div className="truncate text-[.85rem] font-bold">{currentUser.name}</div>
            <div className="text-[.68rem] uppercase tracking-[.05em] text-[#6679a3]">{currentUser.role}</div>
          </div>
          <span className="text-[.8rem] opacity-50 max-[960px]:hidden">Logout</span>
        </div>
      </div>
    </aside>
  )
}