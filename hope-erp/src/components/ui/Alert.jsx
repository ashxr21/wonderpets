const types = {
    error: 'bg-[rgba(229,72,77,.12)] text-[#a6262b] border-[rgba(229,72,77,.3)]', 
    success: 'bg-[rgba(18,184,134,.14)] text-[#0b6b40] border-[rgba(18,184,134,.35)]',
}

export default function Alert({ type = 'error', message }) {
    if (!message) return null
    return (
        <div className={`mb-4 rounded-[14px] border px-3.5 py-3 text-[.85rem] ${types[type]}`}>{message}</div>
    )
}