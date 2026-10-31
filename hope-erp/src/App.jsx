import { useEffect, useState } from 'react'
import { useAuth } from './context/AuthContext'
import LandingPage from './components/landing/LandingPage'
import DashboardLayout from './components/dashboard/DashboardLayout'
import LoginModal from './components/auth/LoginModal'
import RegisterModal from './components/auth/RegisterModal'
import ResetModal from './components/auth/ResetModal'

// Fixed gradient backdrop + two decorative orbs (replaces body background / ::before / ::after)
function Background() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden
      bg-[radial-gradient(900px_600px_at_8%_10%,rgba(143,176,255,.75),transparent_60%),radial-gradient(800px_600px_at_95%_15%,rgba(176,160,255,.65),transparent_60%),radial-gradient(900px_700px_at_70%_100%,rgba(120,200,255,.55),transparent_60%),linear-gradient(160deg,#e9f0ff_0%,#dbe6fb_50%,#e6e3fb_100%)] print:hidden">
      <div className="absolute -bottom-20 -left-[120px] h-[380px] w-[380px] rounded-full border border-white/70
        bg-linear-to-br from-white/70 to-[rgba(140,170,255,.25)] blur-[2px]" />
      <div className="absolute top-[40%] -right-[60px] h-[260px] w-[260px] rounded-full border border-white/70
        bg-linear-to-br from-white/65 to-[rgba(170,150,255,.25)] blur-[2px]" />
    </div>
  )
}

export default function App() {
  const { currentUser } = useAuth()
  const [modal, setModal] = useState(null) // null | 'login' | 'register' | 'reset'

  // Close any open auth modal once the user is signed in
  useEffect(() => {
    if (currentUser) setModal(null)
  }, [currentUser])

  const close = () => setModal(null)

  return (
    <div className="min-h-screen font-sans leading-[1.55] text-[#1d2a4d]">
      <Background />

      {currentUser ? (
        <DashboardLayout />
      ) : (
        <>
          <LandingPage onOpen={setModal} />
          <LoginModal open={modal === 'login'} onClose={close} onSwitch={setModal} />
          <RegisterModal open={modal === 'register'} onClose={close} onSwitch={setModal} />
          <ResetModal open={modal === 'reset'} onClose={close} onSwitch={setModal} />
        </>
      )}
    </div>
  )
}
