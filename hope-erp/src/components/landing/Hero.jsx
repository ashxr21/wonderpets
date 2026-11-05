import Button from '../ui/Button'
import { glass, gradBg } from '../ui/styles'

const modules = [
   { icon: '👥', title: 'Customers', text: 'Manage contacts & accounts', color: 'bg-[#ccfbf1] text-[#115e59]'},
   { icon: '📦', title: 'Products', text: 'Catalog & inventory', color: 'bg-[#dcfce7] text-[#166534]'},
   { icon: '🧑‍💼', title: 'Human Resources', text: 'Employees & payroll', color: 'bg-[#fef3c7] text-[#92400e]'},
   { icon: '📈', title: 'Sales', text: 'Orders & revenue', color: 'bg-[#fce7f3] text-[#9d174d]' }
]

export default function Hero({ onOpen }) {
  return (
    <section
      className={`$(glass) mx-auto mt-[110px] mb-10 flex max-w-[1040px] flex-col items-center gap-11
        rounded-[36px] px-10 pt-14 pb-11 text-center max-[960px]:px-[22px] max-[968px]: pt-11 max-[960px]:pb-8`}
    >
       <div>
         <h1 className="mb-[18px] text-[clamp(2.2rem, 5.5vw, 3.8rem)] leading-[1.08] font-extrabold tracking-[-.035em]">
          Run your entire business<br />
          <span className={`$(gradBg) bg-clip-text text-transparent`}>with confidence</span>
         </h1>
         <p className="mx-auto mb-[26px] max-w-[540px] text-[1.1rem] text-[#6679a3]">
           Hope, Inc. ERP unifies Customer Management, Product Catalog, Human Resources,
           and Sales into one powerful platform. Built for teams of every size.
         </p>
         <div className="flex flex-wrap justify-center gap-3">
           <Button onClick={() => onOpen('login')}>Sign In to Dashboard</Button>
           <Button variant="outline" onClick={() => onOpen('register')}>Register</Button>
         </div>
       </div>

       <div className="w-full">
         <div className={`${glass} overflow-hidden rounded-[26px] transition-transform duration-300 hover:-translate-y-1`}>
           <div className={`${gradBg} flex items-center gap-3 px-5 py-3.5 text-[.8rem] font-semibold text-white`}>
             <div className="flex gap-1.5">
               {[0, 1, 2].map((i) => <span key={i} className="h-2.5 w-2.5 rounded-full bg-white/55" />)}
             </div>
             Hope, Inc. ERP Dashboard
          </div>
          <div className="grid grid-cols-4 gap-3.5 p-[22px] max-[960px]:grid-cols-2 max-[600px]:grid-cols-1">
            {modules.map((m) => (
               <div key={m.title} className="flex flex-col gap-2 rounded-[14px] border border-white/75 bg-white/70 p-[18px] text-left">
                 <div className={`flex h-[42px] w-[42px] items-center justify-center rounded-[13px] text-[1.2rem] ${m.color}`}>{m.icon}</div>
                 <h4 className="text-[.95rem] font-bold">{m.title}</h4>
                 <p className="text-[.78rem] text-[#6679a3]">{m.text}</p>
               </div>
             ))}
           </div>
       </div>
     </div>
   </section>
  )
}