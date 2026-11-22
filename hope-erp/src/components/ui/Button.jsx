const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold cursor-pointer ' +
    'transition duration-150 active:scale-[.97] no-underline'

const variants = {
    ghost: 'bg-transparent text-[#1d2a4d] hover:bg-white/60',
    primary:
        'bg-linear-to-br from-[#6a93f5] to-[#8b8cf7] text-white ' +
        'shadow-[0_10px_22px_-8px_rgba(91,134,240,.8),inset_0_1px_0_rgba(255,255,255,.35)] ' +
        'hover:-translate-y-px hover:shadow-[0_14px_26px_-8px_rgba(91,134,240,.9)]',
    outline: 'bg-white/40 border-[1.5px] border-[#5b86f0]/45 text-[#4468d8] hover:bg-white/80',
    google: 'bg-white/70 border border-white/75 text-[#1d2a4d] hover:bg-white w-full',
    secondary: 'bg-white/60 border border-white/75 text-[#1d2a4d] hover:bg-white',
    danger: 'bg-[rgba(229,72,77,.12)] text-[#b42329] border border-[rgba(229,72,77,.3)]',
    success: 'bg-[rgba(18,184,134,.12)] text-[#0b7d5b] border border-[rgba(18,184,134,.3)]',
}

const sizes = {
    md: 'px-[22px] py-[11px] text-[.9rem]',
    sm: 'px-[15px] py-[7px] text-[.8rem]',
    full: 'w-full p-[13px] text-[.95rem]',
}

export default function Button({ variant = 'primary', size = 'md', className = '', ...props }) {
    return <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
}
