import { useState } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import FormField from '../ui/FormField'
import { inputCls } from '../ui/styles'
import { useAuth } from '../../context/AuthContext'

const linkCls = 'cursor-pointer font-semibold text-[#4468d8] hover:underline'

function LoginForm({ onClose, onSwitch }) {
  const { login, loginWithGoogle } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const res = await login(email.trim(), password)
      if (!res.ok) return setError(res.error)
      onClose()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setBusy(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    try {
      const res = await loginWithGoogle()
      if (!res.ok) setError(res.error)
    } catch (loginError) {
      setError(loginError.message)
    }
  }

  return (
    <>
      <Alert message={error} />
      <form onSubmit={handleSubmit}>
        <FormField label="Email address" htmlFor="loginEmail">
          <input id="loginEmail" type="email" required className={inputCls} placeholder="Email Address"
            value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>
        <FormField label="Password" htmlFor="loginPassword">
          <div className="relative">
            <input id="loginPassword" type={showPw ? 'text' : 'password'} required className={`${inputCls} pr-[46px]`}
              placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShowPw((s) => !s)}
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer border-none bg-transparent text-[1.05rem]">
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
        </FormField>
        <div className="mb-5 flex justify-end text-[.85rem]">
          <a className={linkCls} onClick={() => onSwitch('reset')}>Forgot password?</a>
        </div>
        <Button type="submit" size="full" disabled={busy}>{busy ? 'Signing in…' : 'Sign In'}</Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-[.8rem] text-[#6679a3] before:h-px before:flex-1 before:bg-[rgba(120,145,210,.22)] after:h-px after:flex-1 after:bg-[rgba(120,145,210,.22)]">
        or
      </div>
      <Button variant="google" size="full" onClick={handleGoogle}>Continue with Google</Button>
      <div className="mt-5 text-center text-[.9rem] text-[#6679a3]">
        Don't have an account? <a className={linkCls} onClick={() => onSwitch('register')}>Register</a>
      </div>
    </>
  )
}

export default function LoginModal({ open, onClose, onSwitch }) {
  return (
    <Modal open={open} onClose={onClose} title="Welcome back" subtitle="Sign in to your Hope, Inc. ERP account">
      <LoginForm onClose={onClose} onSwitch={onSwitch} />
    </Modal>
  )
}
