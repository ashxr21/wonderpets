import { glassCard } from './styles'

const toneStyles = {
  blue: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  indigo: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  amber: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
}

export default function ModuleKPIs({ items = [] }) {
  if (!items.length) return null

  return (
    <div className="mb-5 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4 print:hidden">
      {items.map((item, idx) => {
        const Icon = item.icon
        const toneCls = toneStyles[item.tone || 'indigo']

        return (
          <div
            key={item.label || idx}
            className={`${glassCard} flex min-w-0 items-center justify-between rounded-2xl p-4 text-slate-900 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80`}
          >
            <div className="min-w-0 flex-1">
              <div className="text-[.72rem] font-bold uppercase tracking-[.08em] text-slate-500">
                {item.label}
              </div>
              <div className="mt-1 text-[1.45rem] font-extrabold tracking-tight text-slate-900 truncate">
                {item.value}
              </div>
              {item.sub && (
                <div className={`mt-0.5 text-[.74rem] font-semibold ${item.subColor || 'text-slate-500'}`}>
                  {item.sub}
                </div>
              )}
            </div>

            {Icon && (
              <div className={`ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${toneCls}`}>
                <Icon className="h-5 w-5" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
