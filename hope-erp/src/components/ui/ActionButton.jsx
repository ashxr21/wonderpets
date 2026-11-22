const tones = {
  neutral: 'hover:bg-linear-to-br hover:from-[#6a93f5] hover:to-[#8b8cf7] hover:text-white',
  danger: 'hover:bg-[#e5484d] hover:text-white',
  success: 'hover:bg-[#12b886] hover:text-white',
}

export default function ActionButton({ tone = 'neutral', className = '', ...props }) {
  return (
    <button
      type="button"
      className={`cursor-pointer rounded-full border border-[rgba(120,145,210,.28)] bg-white/80 px-[13px] py-1.5 text-[.75rem]
        font-semibold text-[#1d2a4d] shadow-[0_4px_12px_-6px_rgba(91,134,240,.4)] transition-all duration-150
        hover:bg-white hover:text-[#1d2a4d] ${tones[tone]} ${className}`}
      {...props}
    />
  )
}