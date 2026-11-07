import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)
export const useAuth = () => useContext(AuthContext)

const profileToUser = (profile) => ({
  id: profile.id,
  email: profile.email,
  firstName: profile.first_name,
  lastName: profile.last_name,
  name: `${profile.first_name} ${profile.last_name}`.trim() || profile.email,
  role: profile.role,
  status: profile.status,
  perms: profile.permissions ?? {},
})

async function fetchProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (error) throw error
  return profileToUser(data)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [authReady, setAuthReady] = useState(false)
  const [authError, setAuthError] = useState('')
  const [passwordRecovery, setPasswordRecovery] = useState(false)

  const applySession = useCallback(async (session) => {
    if (!session) {
      setCurrentUser(null)
      setUsers([])
      setAuthReady(true)
      return
    }

    try {
      const user = await fetchProfile(session.user.id)
      if (user.status !== 'active') {
        await supabase.auth.signOut()
        setCurrentUser(null)
        setAuthError(
          user.status === 'pending'
            ? 'Your account is awaiting administrator approval.'
            : 'This account is not active. Contact an administrator.'
        )
        setAuthReady(true)
        return
      }

      setCurrentUser(user)
      setAuthError('')
      setAuthReady(true)

      if (user.role === 'admin' || user.role === 'superadmin') {
        const { data, error } = await supabase.from('profiles').select('*').order('created_at')
        if (error) throw error
        setUsers(data.map(profileToUser))
      } else {
        setUsers([user])
      }
    } catch (error) {
      setCurrentUser(null)
      setUsers([])
      setAuthError(`Could not load your Supabase profile: ${error.message}`)
      setAuthReady(true)
    }
  }, [])

  useEffect(() => {
    let active = true
    const handleSession = (session) => {
      if (active) void applySession(session)
    }

    supabase.auth.getSession()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          setAuthError(`Could not restore your Supabase session: ${error.message}`)
          setAuthReady(true)
          return
        }
        handleSession(data.session)
      })
      .catch((error) => {
        if (!active) return
        setAuthError(`Could not restore your Supabase session: ${error.message}`)
        setAuthReady(true)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true)
      window.setTimeout(() => handleSession(session), 0)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [applySession])

  const login = async (email, password) => {
    if (!email || !password) return { ok: false, error: 'Please fill in all fields.' }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { ok: false, error: error.message }

    try {
      const user = await fetchProfile(data.user.id)
      if (user.status !== 'active') {
        await supabase.auth.signOut()
        return {
          ok: false,
          error: user.status === 'pending'
            ? 'Your account is awaiting administrator approval.'
            : 'This account is not active. Contact an administrator.',
        }
      }
      setCurrentUser(user)
      setAuthError('')
      return { ok: true }
    } catch (profileError) {
      await supabase.auth.signOut()
      return { ok: false, error: `Could not load your Supabase profile: ${profileError.message}` }
    }
  }

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    return error ? { ok: false, error: error.message } : { ok: true }
  }

  const register = async ({ firstName, lastName, email, password }) => {
    if (!firstName || !lastName || !email || !password) {
      return { ok: false, error: 'Please fill in all fields.' }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName, last_name: lastName } },
    })
    if (error) return { ok: false, error: error.message }

    if (data.session) await supabase.auth.signOut()
    return {
      ok: true,
      message: data.session
        ? 'Registration submitted. Verify your email, then wait for administrator approval.'
        : 'Check your email to verify your account. An administrator must approve it before you can sign in.',
    }
  }

  const requestPasswordReset = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`,
    })
    return error ? { ok: false, error: error.message } : { ok: true }
  }

  const updatePassword = async (password) => {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { ok: false, error: error.message }
    setPasswordRecovery(false)
    return { ok: true }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { ok: true }
    } catch (error) {
      setAuthError(`Could not sign out: ${error.message}`)
      return { ok: false, error: error.message }
    }
  }

  const updateUser = async (userId, changes) => {
    const target = users.find((user) => user.id === userId)
    if (!target) return { ok: false, error: 'User profile was not found.' }

    const updated = { ...target, ...changes }
    try {
      const { data, error } = await supabase.rpc('manage_erp_profile', {
        target_user_id: userId,
        new_first_name: updated.firstName,
        new_last_name: updated.lastName,
        new_role: updated.role,
        new_status: updated.status,
        new_permissions: updated.perms,
      })
      if (error) return { ok: false, error: error.message }

      const savedProfile = Array.isArray(data) ? data[0] : data
      if (!savedProfile) return { ok: false, error: 'Supabase did not return the updated profile.' }
      const savedUser = profileToUser(savedProfile)
      setUsers((previous) => previous.map((user) => user.id === userId ? savedUser : user))
      if (currentUser?.id === userId) setCurrentUser(savedUser)
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }

  const can = (permission) => {
    if (!currentUser || currentUser.status !== 'active') return false
    if (currentUser.role === 'superadmin' || currentUser.role === 'admin') return true
    return currentUser.perms?.[permission] === true
  }

  const canModule = (module) => {
    if (module === 'sales') {
      return ['sales.view', 'customers.view', 'products.view', 'hr.view'].every(can)
    }
    return can(`${module}.view`)
  }
  return (
    <AuthContext.Provider
      value={{
        users, currentUser, authReady, authError, passwordRecovery, setPasswordRecovery,
        login, loginWithGoogle, register, requestPasswordReset, updatePassword, logout,
        updateUser, can, canModule,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
