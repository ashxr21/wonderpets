import { useAuth } from '../../context/AuthContext'
import { useERPData } from '../../hooks/useERPData'
import { glass } from '../ui/styles'
import { money } from '../../utils/pricing'
import { KEYS } from '../../data/defaults'
import { BarChart3, Briefcase, Package, TrendingUp, Users } from 'lucide-react'

const shortcuts = [
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'hr', label: 'HR Records', icon: Briefcase },
  { id: 'sales', label: 'Sales Pipeline', icon: TrendingUp },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
]

export default function DashboardHome({ onNavigate }) {
  const { currentUser } = useAuth()
  const { collections } = useERPData()
  const customers = collections[KEYS.customers]
  const products = collections[KEYS.products]
  const sales = collections[KEYS.sales]
  const payments = collections[KEYS.payments]
  const month = new Date().toISOString().slice(0, 7)
  const monthPayments = payments.filter(
    (payment) => !payment.isDeleted && payment.payDate?.startsWith(month)
  )
  const revenue = monthPayments.reduce((total, payment) => total + Number(payment.amount || 0), 0)
  const stats = [
    { label: 'Customers', value: customers.filter((record) => !record.isDeleted).length, change: 'From Supabase' },
    { label: 'Products', value: products.filter((record) => !record.isDeleted).length, change: 'From Supabase' },
    { label: 'Sales Records', value: sales.filter((record) => !record.isDeleted).length, change: 'From Supabase' },
    {
      label: 'Revenue (MTD)',
      value: money(revenue),
      change: revenue > 0 ? 'From Supabase payments' : 'No sales this month',
    },
  ]

  return (
    <>
      <div
        className="mb-[18px] overflow-hidden rounded-[28px] border border-white/60 p-[34px] text-white
          bg-linear-to-br from-[rgba(91,134,240,.92)] to-[rgba(139,124,246,.88)]
          shadow-[0_24px_50px_-20px_rgba(70,100,220,.7)]"
      >
        <h2 className="mb-1.5 text-[1.6rem] font-extrabold">Welcome back, {currentUser.firstName || currentUser.name}!</h2>
        <p>Here is your enterprise overview and quick management shortcuts.</p>
      </div>

      <div className="mb-[18px] grid grid-cols-4 gap-4 max-[960px]:grid-cols-2 max-[600px]:grid-cols-1">
        {stats.map((s) => (
          <div key={s.label} className={`${glass} flex flex-col gap-1.5 rounded-[22px] p-[22px]`}>
            <div className="text-[.75rem] font-bold uppercase text-slate-600">{s.label}</div>
            <div className="text-[2rem] font-extrabold">{s.value}</div>
            <div className="text-[.8rem] font-semibold text-[#12b886]">{s.change}</div>
          </div>
        ))}
      </div>

      <div className={`${glass} mb-[18px] rounded-[22px] p-6`}>
        <h3 className="mb-4 text-lg leading-6 font-bold">Quick Actions</h3>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-3">
          {shortcuts.map((s) => {
            const Icon = s.icon
            return (
            <button
              key={s.id}
              onClick={() => onNavigate(s.id)}
              className="flex cursor-pointer items-center gap-2.5 rounded-2xl border border-white/75 bg-white/60 p-4 text-left
                text-[.9rem] font-semibold text-[#1d2a4d] transition-all duration-150
                hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_12px_24px_-14px_rgba(70,100,220,.6)]"
            >
              <Icon aria-hidden="true" className="h-5 w-5 text-indigo-600" strokeWidth={1.8} />
              {s.label}
            </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
