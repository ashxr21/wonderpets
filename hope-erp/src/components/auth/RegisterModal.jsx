import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import FormField from '../ui/FormField'
import { inputCls } from '../ui/styles'
import { useAuth } from '../../context/AuthContext'

function RegisterForm({ onSwitch }) {
  const { register } = useAuth()
  const empty = { firstName: '', lastName: '', email: '', password: '' }
  const [form, setForm] = useState(empty)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    setBusy(true)
    try {
      const res = await register({
        firstName: form.firstName.trim(), lastName: form.lastName.trim(),
        email: form.email.trim(), password: form.password,
      })
      if (!res.ok) return setError(res.error)
      setSuccess(res.message)
      setForm(empty)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Alert message={error} />
      <Alert type="success" message={success} />
      <div className="mb-4 rounded-[14px] bg-white/55 px-3 py-2.5 text-[.8rem] text-[#6679a3]">
        New accounts require email verification and administrator approval.
      </div>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3.5 max-[600px]:grid-cols-1">
          <FormField label="First name" htmlFor="regFirstName">
            <input id="regFirstName" required className={inputCls} placeholder="John" value={form.firstName} onChange={set('firstName')} />
          </FormField>
          <FormField label="Last name" htmlFor="regLastName">
            <input id="regLastName" required className={inputCls} placeholder="Doe" value={form.lastName} onChange={set('lastName')} />
          </FormField>
        </div>
        <FormField label="Email address" htmlFor="regEmail">
          <input id="regEmail" type="email" required className={inputCls} placeholder="you@company.com" value={form.email} onChange={set('email')} />
        </FormField>
        <FormField label="Password" htmlFor="regPassword">
          <input id="regPassword" type="password" minLength={8} required className={inputCls}
            placeholder="At least 8 characters" value={form.password} onChange={set('password')} />
        </FormField>
        <Button type="submit" size="full" disabled={busy}>{busy ? 'Creating account…' : 'Register'}</Button>
      </form>
      <div className="mt-5 text-center text-[.9rem] text-[#6679a3]">
        Already have an account?{' '}
        <a className="cursor-pointer font-semibold text-[#4468d8] hover:underline" onClick={() => onSwitch('login')}>Sign in</a>
      </div>
    </>
  )
}

export default function RegisterModal({ open, onClose, onSwitch }) {
  return (
    <Modal open={open} onClose={onClose} title="Create an account" subtitle="Register for a Hope, Inc. ERP account">
      <RegisterForm onSwitch={onSwitch} />
    </Modal>
  )
}
