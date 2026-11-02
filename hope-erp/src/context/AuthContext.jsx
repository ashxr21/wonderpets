import { createContext, useContext, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { DEFAULT_USERS, emptyPerms, sampleUserPerms } from '../data/permissions'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }) {
  const [users, setUsers] = useLocalStorage('hope_erp_users_v3', DEFAULT_USERS)
  const [currentUser, setCurrentUser] = useState(null)

  const findUser = (email) =>
    users.find((u) => u.email.toLowerCase() === email.toLowerCase())

    const login = (email, password) => {
    if (!email || !password) return { ok: false, error: 'Please fill in all fields.' }

    let user = findUser(email)
    if (!user) {
      user = {
        email, firstName: email.split('@')[0], lastName: '',
        role: 'user', status: 'active', perms: sampleUserPerms(),
      }
      setUsers((prev) => [...prev, user])
    }
    if (user.status === 'blocked') return { ok: false, error: 'This account is blocked.' }
    if (user.status === 'pending') return { ok: false, error: 'Your account is awaiting administrator approval.' }
    if (user.status === 'disapproved') return { ok: false, error: 'Your registration was not approved.' }

    setCurrentUser({
      email: user.email,
      name: `${user.firstName} ${user.lastName || ''}`.trim(),
      role: user.role,
      firstName: user.firstName,
    })
    return { ok: true }
  }

  const loginWithGoogle = () =>
    setCurrentUser({ email: 'google.user@gmail.com', name: 'Google User', role: 'user', firstName: 'Google' })

  const register = ({ firstName, lastName, email }) => {
    if (!firstName || !lastName || !email) return { ok: false, error: 'Please fill in all fields.' }
    if (findUser(email)) return { ok: false, error: 'Email already registered.' }
    setUsers((prev) => [
      ...prev,
      { email, firstName, lastName, role: 'user', status: 'pending', perms: emptyPerms() },
    ])
    return { ok: true, message: 'Registration submitted successfully. Awaiting admin approval.' }
  }

  const logout = () => setCurrentUser(null)

  // Admins/superadmins can do everything; regular users use their stored perms.
  const can = (perm) => {
    if (!currentUser) return false
    if (currentUser.role === 'superadmin' || currentUser.role === 'admin') return true
    return !!findUser(currentUser.email)?.perms?.[perm]
  }
  const canModule = (mod) => can(`${mod}.view`) 

  return (
    <AuthContext.Provider
      value={{ users, setUsers, currentUser, login, loginWithGoogle, register, logout, can, canModule }}
    >
      {children}
    </AuthContext.Provider>
  )
}
