import { useAuth } from '../../context/AuthContext'
import { glass } from '../ui/styles'

const roleStyles = {
  superadmin: 'bg-[rgba(139,124,246,.2)] text-[#5b46d6]',
  admin: 'bg-[rgba(91,134,240,.2)] text-[#3556c4]',
  user: 'bg-[rgba(18,184,134,.18)] text-[#0b7d5b]',
}

export default function Topbar({ title, onRefresh, refreshing }) {
  const { currentUser } = useAuth()
  return (
    <header className={`${glass} mb-4 flex h-[66px] items-center justify-between rounded-3xl px-[26px] print:hidden`}>
      <div className="flex items-center gap-2">
        <div className="text-[1.15rem] font-extrabold">{title}</div>
        <span className={`rounded-full border border-white/70 px-[13px] py-[5px] text-[.7rem] font-bold uppercase ${roleStyles[currentUser.role]}`}>
          {currentUser.role}
        </span>
      </div>
      {onRefresh && (
        <button type="button" onClick={onRefresh} disabled={refreshing}
          className="cursor-pointer rounded-full border border-white/75 bg-white/65 px-4 py-2 text-[.78rem] font-semibold text-[#1d2a4d] transition hover:bg-white disabled:cursor-wait disabled:opacity-60">
          {refreshing ? 'Refreshing…' : 'Refresh data'}
        </button>
      )}
    </header>
  )
}
