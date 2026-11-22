import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Alert from '../ui/Alert'
import FormField from '../ui/FormField'
import { inputCls } from '../ui/styles'

export default function UpdatePasswordModal({ open, onClose }) {
  const { updatePassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (password !== confirmation) {
      setError('Passwords do not match.')
      return
    }

    setBusy(true)
    try {
      const result = await updatePassword(password)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setPassword('')
      setConfirmation('')
      onClose()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Choose a new password" subtitle="Your account password will be updated securely">
      <Alert message={error} />
      <form onSubmit={submit}>
        <FormField label="New password" htmlFor="newPassword">
          <input id="newPassword" type="password" minLength={8} required className={inputCls}
            value={password} onChange={(event) => setPassword(event.target.value)} />
        </FormField>
        <FormField label="Confirm password" htmlFor="confirmPassword">
          <input id="confirmPassword" type="password" minLength={8} required className={inputCls}
            value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
        </FormField>
        <Button type="submit" size="full" disabled={busy}>{busy ? 'Saving…' : 'Update Password'}</Button>
      </form>
    </Modal>
  )
}
