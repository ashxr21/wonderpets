import { useAuth } from '../../context/AuthContext'
import { glass } from '../ui/styles'

const stats = [
  { label: 'Total Customers', value: '4', change: 'Active accounts' },
  { label: 'Products', value: '5', change: 'Catalog items' },
  { label: 'Open Orders', value: '3', change: 'Sales pipeline' },
  { label: 'Revenue (MTD)', value: '$12.4k', change: '↑ 18% vs last month' },
]

const shortcuts = [
  { id: 'customers', label: '👥 Customers' },
  { id: 'products', label: '📦 Products' },
  { id: 'hr', label: '🧑‍💼 HR Records' },
  { id: 'sales', label: '📈 Sales Pipeline' },
  { id: 'reports', label: '📊 Reports' },
]

export default function DashboardHome({ onNavigate }) {
  const { currentUser } = useAuth()
  return (
    <>
      <div
        className="mb-[18px] overflow-hidden rounded-[28px] border border-white/60 p-[34px] text-white
          bg-linear-to-br from-[rgba(91,134,240,.92)] to-[rgba(139,124,246,.88)]
          shadow-[0_24px_50px_-20px_rgba(70,100,220,.7)]"
      >
        <h2 className="mb-1.5 text-[1.6rem] font-extrabold">Welcome back, {currentUser.firstName}!</h2>
        <p>Here is your enterprise overview and quick management shortcuts.</p>
      </div>

      <div className="mb-[18px] grid grid-cols-4 gap-4 max-[960px]:grid-cols-2 max-[600px]:grid-cols-1">
        {stats.map((s) => (
          <div key={s.label} className={`${glass} flex flex-col gap-1.5 rounded-[22px] p-[22px]`}>
            <div className="text-[.75rem] font-bold uppercase text-[#6679a3]">{s.label}</div>
            <div className="text-[2rem] font-extrabold">{s.value}</div>
            <div className="text-[.8rem] font-semibold text-[#12b886]">{s.change}</div>
          </div>
        ))}
      </div>

      <div className={`${glass} mb-[18px] rounded-[22px] p-6`}>
        <h3 className="mb-4 text-[1.05rem] font-extrabold">Quick Actions</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
          {shortcuts.map((s) => (
            <button
              key={s.id}
              onClick={() => onNavigate(s.id)}
              className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-white/75 bg-white/60 p-4 text-left
                text-[.9rem] font-semibold text-[#1d2a4d] transition-all duration-150
                hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_24px_-14px_rgba(70,100,220,.6)]"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
