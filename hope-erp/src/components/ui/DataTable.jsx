import { glass } from './styles'

export function DataTable({ heads, children }) {
    return (
        <div className={`${glass} overflow-auto rounded-[26px] bg-white/45 print:overflow-visible print:border-0 print:bg-white print:shadow-none print:backdrop-blur-none`}>
            <table className="w-full border-collapse text-[.88rem]">
                <thead>
                    <tr>
                        {heads.map((head) => {
                            const h = typeof head === 'string' ? { label: head } : head
                            return (
                            <th
                                key={h.label}
                                className={`whitespace-nowrap border-b border-[rgba(120,145,210,.22)] bg-white/30 px-4 py-3 text-left
                                    text-xs font-bold uppercase tracking-wider text-slate-600 print:bg-gray-200 ${h.align === 'right' ? 'text-right' : ''} ${h.className ?? ''}`}
                            >
                                {h.label}
                            </th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    )
}

export function Td({ children, className = ''}) {
    return (
        <td className={`border-b border-[rgba(120,145,210,.22)] px-4 py-2.5 align-middle text-[.88rem] text-slate-700 group-last:border-b-0 ${className}`}>
            {children}
        </td>
    )
}

export function Badge({ deleted, ...props }) {
    const cls = deleted ? 'bg-[rgba(229,72,77,.15)] text-[#b42329]' : 'bg-[rgba(18,184,134,.18)] text-[#0b7d5b]'
    return (
        <span {...props} className={`inline-flex items-center gap-1.5 rounded-full border border-white/70 px-[11px] py-1 text-[.72rem] font-bold ${cls}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {deleted ? 'Deleted' : 'Active'}
        </span>
    )
}