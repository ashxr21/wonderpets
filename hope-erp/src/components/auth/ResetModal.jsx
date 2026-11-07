import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import FormField from '../ui/FormField'
import { inputCls } from '../ui/styles'
import { useAuth } from '../../context/AuthContext'

function ResetForm({ onSwitch }) {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSuccess('')
    setError('')
    setBusy(true)
    try {
      const result = await requestPasswordReset(email.trim())
      if (!result.ok) {
        setError(result.error)
        return
      }
      setSuccess(`If an account exists for ${email.trim()}, a reset link has been sent.`)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Alert type="success" message={success} />
      <Alert message={error} />
      <form onSubmit={handleSubmit}>
        <FormField label="Email address" htmlFor="resetEmail">
          <input id="resetEmail" type="email" required className={inputCls} placeholder="you@company.com"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <Button type="submit" size="full" disabled={busy}>{busy ? 'Sending…' : 'Send Reset Link'}</Button>
      </form>
      <div className="mt-5 text-center text-[.9rem] text-[#6679a3]">
        Remember password?{' '}
        <a className="cursor-pointer font-semibold text-[#4468d8] hover:underline" onClick={() => onSwitch('login')}>Back to Sign In</a>
      </div>
    </>
  )
}

export default function ResetModal({ open, onClose, onSwitch }) {
  return (
    <Modal open={open} onClose={onClose} title="Reset password" subtitle="We'll send you a secure link">
      <ResetForm onSwitch={onSwitch} />
    </Modal>
  )
}
