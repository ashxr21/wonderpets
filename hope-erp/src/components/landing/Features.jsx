import { glass } from '../ui/styles'

const features = [
  { icon: '👥', title: 'Customer Management', text: 'Track leads, accounts, contacts, and interaction history in one place.', color: 'bg-[#ccfbf1] text-[#115e59]' },
  { icon: '📦', title: 'Product Management', text: 'Maintain product catalog, pricing, stock levels, and categories.', color: 'bg-[#dcfce7] text-[#166534]' },
  { icon: '🧑‍💼', title: 'Human Resources', text: 'Employee records, attendance, leave, and organizational structure.', color: 'bg-[#fef3c7] text-[#92400e]' },
  { icon: '📈', title: 'Sales Management', text: 'Quotes, orders, invoices, and real-time sales performance.', color: 'bg-[#fce7f3] text-[#9d174d]' },
]

export default function Features() {
  return (
    <section className="mx-auto max-w-[1100px] px-6 pt-[30px] pb-[90px]">
      <div className="mb-9 text-center">
        <h2 className="mb-2 text-[2rem] font-extrabold tracking-[-.02em]">Everything you need to grow</h2>
        <p className="text-[#6679a3]">Four core modules. Three user roles. One unified system.</p>
      </div>
      
      <div className="grid grid-cols-4 gap-4 max-[960px]:grid-cols-2 max-[600px]:grid-cols-1">
        {features.map((f) => (
          <div
            key={f.title}
            className={`${glass} rounded-[22px] px-[22px] py-7 text-left transition-all duration-250 hover:-translate-y-[5px] hover:bg-white/70`}
          >
            <div className={`mb-[18px] flex h-[52px] w-[52px] items-center justify-center rounded-2xl text-[1.4rem] ${f.color}`}>{f.icon}</div>
            <h3 className="mb-1.5 text-base font-bold">{f.title}</h3>
            <p className="text-[0.85rem] text-[#6679a3]">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
