export default function Tabs ({ value, onChange, options }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full border border-white/75 bg-white/45 p-1 print:hidden">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`cursor-pointer rounded-full border-none px-4 py-[7px] text-[.78rem] font-semibold tracking-[.02em]
            ${value === o.value
              ? 'bg-linear-to-br from-[#6a93f5] to-[#8b8cf7] text-white shadow-[0_6px_14px_-6px_rgba(91,134,240,.9)]'
              : 'bg-transparent text-[#6679a3] hover:text-[#1d2a4d]'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}