const tones = {
  neutral: 'hover:bg-linear-to-br hover:from-[#6a93f5] hover:to-[#8b8cf7] hover:text-white',
  danger: 'hover:bg-[#e5484d] hover:text-white',
  success: 'hover:bg-[#12b886] hover:text-white',
}

export default function ActionButton({ tone = 'neutral', className = '', ...props }) {
  return (
    <button
      type="button"
      className={`cursor-pointer rounded-full border border-white/75 bg-white/70 px-[13px] py-1.5 text-[.75rem]
        font-semibold text-[#1d2a4d] transition-all duration-150 ${tones[tone]} ${className}`}
      {...props}
    />
  )
}