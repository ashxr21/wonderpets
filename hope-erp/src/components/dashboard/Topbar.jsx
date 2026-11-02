import { useAuth } from '../../context/AuthContext'
import { glass } from '../ui/styles'

const roleStyles = {
  superadmin: 'bg-[rgba(139,124,246,.2)] text-[#5b46d6]',
  admin: 'bg-[rgba(91,134,240,.2)] text-[#3556c4]',
  user: 'bg-[rgba(18,184,134,.18)] text-[#0b7d5b]',
}

export default function Topbar({ title }) {
  const { currentUser } = useAuth()
  return (
    <header className={`${glass} mb-4 flex h-[66px] items-center justify-between rounded-3xl px-[26px] print:hidden`}>
      <div className="text-[1.15rem] font-extrabold">{title}</div>
      <span className={`rounded-full border border-white/70 px-[13px] py-[5px] text-[.7rem] font-bold uppercase ${roleStyles[currentUser.role]}`}>
        {currentUser.role}
      </span>
    </header>
  )
}
