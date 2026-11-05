import Button from '../ui/Button'
import { glass, gradBg } from '../ui/styles'

const modules = [
  { icon: '👥', title: 'Customers', text: 'Manage contacts & accounts', color: 'bg-[#dffaf5] text-[#1d685e]' },
  { icon: '📦', title: 'Products', text: 'Catalog & inventory', color: 'bg-[#e7fdf0] text-[#1d6a3c]' },
  { icon: '🧑‍💼', title: 'Human Resources', text: 'Employees & payroll', color: 'bg-[#fff3d9] text-[#9b6a1c]' },
  { icon: '📈', title: 'Sales', text: 'Orders & revenue', color: 'bg-[#fceaf5] text-[#a4325e]' }
]

export default function Hero({ onOpen }) {
  return (
    <section
      className={`${glass} mx-auto mt-[110px] mb-10 flex max-w-[1100px] flex-col items-center gap-10
        rounded-[38px] border border-white/80 bg-white/20 px-10 pb-10 pt-12 text-center shadow-[0_22px_70px_-22px_rgba(94,116,208,.35)] max-[960px]:px-[22px] max-[960px]:pt-10 max-[960px]:pb-8`}
    >
      <div className="w-full">
        <h1 className="mb-5 text-[clamp(3.1rem,5.5vw,6.6rem)] leading-[0.98] font-extrabold tracking-[-0.065em] text-[#1d2a4d]">
          Run your entire business
          <span className="mt-2 block">
            <span className={`${gradBg} bg-clip-text text-transparent`}>with confidence</span>
          </span>
        </h1>
        <p className="mx-auto max-w-[620px] text-[1.08rem] leading-[1.6] text-[#5c6c8b]">
          Hope, Inc. ERP unifies Customer Management, Product Catalog, Human Resources,
          and Sales into one powerful platform. Built for teams of every size.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <Button className="px-7 py-[13px] text-[1.02rem]" onClick={() => onOpen('login')}>Sign In to Dashboard</Button>
        <Button variant="outline" className="px-7 py-[13px] text-[1.02rem]" onClick={() => onOpen('register')}>Register</Button>
      </div>

      <div className="w-full">
        <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white/30 shadow-[0_18px_34px_-20px_rgba(110,124,196,.4)] backdrop-blur-[8px]">
          <div className={`${gradBg} flex items-center gap-3 px-4 py-3 text-[0.82rem] font-semibold text-white`}>
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/60" />)}
            </div>
            Hope, Inc. ERP Dashboard
          </div>

          <div className="grid grid-cols-4 gap-3 bg-[#ecf4ff]/80 p-5 max-[960px]:grid-cols-2 max-[600px]:grid-cols-1">
            {modules.map((m) => (
              <div key={m.title} className="flex flex-col gap-2 rounded-[16px] border border-[#edf2ff] bg-white/80 p-[18px] text-left shadow-[inset_0_1px_0_rgba(255,255,255,.75)]">
                <div className={`flex h-[42px] w-[42px] items-center justify-center rounded-[12px] text-[1.25rem] ${m.color}`}>{m.icon}</div>
                <h4 className="text-[1rem] font-bold tracking-[-0.02em] text-[#25314d]">{m.title}</h4>
                <p className="text-[0.8rem] leading-[1.5] text-[#5d6d8d]">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}