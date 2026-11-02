import Button from '../ui/Button'
import { glass } from '../ui/styles'

export default function Navbar({ onOpen }) {
  return (
    <nav
      className={`${glass} fixed top-4 left-1/2 z-[100] flex h-[66px] w-[min(1100px,calc(100%-32px))]
        -translate-x-1/2 items-center justify-between rounded-full pr-3 pl-5`}
    >
      <a href="#" className="flex items-center gap-2.5 text-[1.1rem] font-extrabold text-[#1d2a4d] no-underline">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-linear-to-br from-[#6a93f5] to-[#8b8cf7]
            font-extrabold text-white shadow-[0_8px_18px_-6px_rgba(91,134,240,.7),inset_0_1px_0_rgba(255,255,255,.5)]"
        >
          H
        </div>
        Hope, Inc. ERP
      </a>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={() => onOpen('login')}>Sign In</Button>
        <Button onClick={() => onOpen('register')}>Register</Button>
      </div>
    </nav>
  )
}