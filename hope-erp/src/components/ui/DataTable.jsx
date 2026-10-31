import { glass } from '.styles'

export function DataTable({ heads, children }) {
    return (
        <div className={'${glass} overflow-auto rounded-[22px] print:overflow-visible print:border-0 print:bg-white print:shadow-none print:backdrop-blur-none'}>
            <table className="w-full border-collapse text-[.88rem]">
                <thead>
                    <tr>
                        {heads.map((h) => (
                            <th
                                key={h}
                                className="whitespace-nowrap border-b border-[rgba(120,145,210,.22)] bg-white/40 px-4 py-3.5 text-left
                                    text-[.7rem] font-bold uppercase tracking-[.08em] text-[#6679a3] print:bg-gray-200"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>{children}</tbody>
            </table>
        </div>
    )
}

export function Td({ children, className = ''}) {
    return (
        <td className={'border-b border-[rgba(120,145,210,.22)] px-4 py-3.5 align-middle group-last:border-b-0 ${className}'}>
            {children}
        </td>
    )
}

export function Badge({ deleted }) {
    const cls = deleted ? 'bg-[rgba(229,72,77,.15)] text-[#b42329]' : 'bg-[rgba(18,184,134,.18)] text-[#0b7d5b]'
    return (
        <span className={'inline-flex items-center gap-1.5 rounded-full border border-white/70 px-[11px] py-1 text-[.72rem] font-bold ${cls}'}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {deleted ? 'Deleted' : 'Active'}
        </span>
    )
}
