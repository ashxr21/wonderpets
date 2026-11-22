import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { ERPDataProvider } from './context/ERPDataContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <ERPDataProvider>
        <App />
      </ERPDataProvider>
    </AuthProvider>
  </StrictMode>
)