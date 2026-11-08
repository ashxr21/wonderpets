import Button from '../ui/Button'
import { glass } from '../ui/styles'

export default function Navbar({ onOpen }) {
  return (
    <nav
      className={`${glass} fixed top-4 left-1/2 z-[100] flex h-[72px] w-[min(1100px,calc(100%-28px))]
        -translate-x-1/2 items-center justify-between rounded-full border border-white/80 bg-white/30 px-5 pr-4 shadow-[0_20px_55px_-22px_rgba(101,120,200,.42)] backdrop-blur-[18px]`}
    >
      <a href="#" className="flex items-center gap-3 text-[1.05rem] font-extrabold tracking-[-0.03em] text-[#1d2b4d] no-underline">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-linear-to-br from-[#6c91f7] to-[#8b8cf7]
            text-base font-extrabold text-white shadow-[0_8px_18px_-6px_rgba(91,134,240,.7),inset_0_1px_0_rgba(255,255,255,.5)]"
        >
          H
        </div>
        <span>Hope, Inc. ERP</span>
      </a>
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="px-5 text-[0.98rem]" onClick={() => onOpen('login')}>Sign In</Button>
        <Button className="px-6 text-[0.98rem]" onClick={() => onOpen('register')}>Register</Button>
      </div>
    </nav>
  )
}