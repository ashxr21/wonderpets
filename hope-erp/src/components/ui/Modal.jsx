import { useEffect } from 'react'
import { createPortal } from 'react-dom'

const sizes = { md: 'max-w-[440px]', lg: 'max-w-[540px]', xl: 'max-w-[840px]' }

export default function Modal({ open, onClose, title, subtitle, size = 'md', children }) {
    useEffect(() => {
        if (!open) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prev }
    }, [open])

    return createPortal(
        <div
            onClick={(e) => e.target === e.currentTarget && onClose()}
            className={`fixed inset-0 z-[200] flex items-center justify-center p-5 leading-[1.55] text-[#1d2a4d]
                bg-[rgba(110,130,200,.28)] backdrop-blur-[10px] transition-all duration-250
                ${open ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        >
            <div
                className={`w-full ${sizes[size]} overflow-hidden rounded-[28px] bg-white/65 border border-white/90
                    backdrop-blur-[22px] backdrop-saturate-[1.6]
                    shadow-[0_30px_70px_-20px_rgba(60,90,200,.5),inset_0_1px_0_#fff]
                    transition-all duration-250 ${open ? 'translate-y-0 scale-100' : 'translate-y-6 scale-[.97]'}`}
            >
                <div className="flex items-start justify-between border-b border-[rgba(120,145,210,.22)] px-7 pt-6 pb-[18px]">
                    <div>
                        <h2 className="text-[1.25rem] font-extrabold">{title}</h2>
                        {subtitle && <p className="mt-0.5 text-[#6679a3]">{subtitle}</p>}
                    </div>

                    <button
                        onClick={onClose}
                        className="h-[34px] w-[34px] cursor-pointer rounded-full border border-white/75 bg-white/70 text-[1.2rem]
                            text-[#6679a3] hover:bg-linear-to-br hover:from-[#6a93f5] hover:to-[#8b8cf7] hover:text-white"
                    >
                        &times;
                    </button>
                </div>

                <div className="max-h-[80vh] overflow-y-auto px-7 pt-6 pb-7">
                    {open && children}
                </div>
            </div>
        </div>,
        document.body
    )
}

