export default function IconActionButton({ icon: Icon, label, tone = 'neutral', className = '', ...props }) {
  const tones = {
    neutral: 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-700',
    danger: 'text-rose-600 hover:bg-rose-50 hover:text-rose-700',
    success: 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700',
  }

  return (

    <button
      type="button"
      aria-label={label}
      title={label}
      className={`inline-flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-transparent
        transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500
        ${tones[tone]} ${className}`}
      {...props}
    >
      <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
      
    </button>
  )
}
