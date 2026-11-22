import { glass } from '../ui/styles'

// Mirrors the stub renderers in the original script (HR, Sales, Reports, Users).
export default function Placeholder({ title, text }) {
  return (
    <div className={`${glass} mb-[18px] rounded-[22px] p-6`}>
      <h3 className="mb-4 text-[1.05rem] font-extrabold">{title}</h3>
      <p>{text}</p>
    </div>
  )
}
