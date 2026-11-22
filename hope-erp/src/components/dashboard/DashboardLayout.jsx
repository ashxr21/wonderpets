import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import DashboardHome from './DashboardHome'
import Customers from './Customers'
import Products from './Products'
import HR from './HR'
import Sales from './Sales'
import Reports from './Reports'
import UserManagement from './UserManagement'
import Placeholder from './Placeholder'
import { useERPData } from '../../hooks/useERPData'

const TITLES = {
  dashboard: 'Dashboard',
  customers: 'Customer Management',
  products: 'Product Management',
  hr: 'Human Resources',
  sales: 'Sales Management',
  reports: 'Reports',
  users: 'User Management',
}

const MODULES = ['customers', 'products', 'hr', 'sales', 'reports']

export default function DashboardLayout() {
  const { currentUser, canModule } = useAuth()
  const { refresh, loading } = useERPData()
  const [page, setPage] = useState('dashboard')

  // Quick Actions on the home screen can point at modules this user can't open
  const denied =
    (page === 'users' && currentUser.role === 'user') ||
    (MODULES.includes(page) && !canModule(page))

  const renderPage = () => {
    switch (page) {
      case 'customers': return <Customers />
      case 'products': return <Products />
      case 'hr': return <HR />
      case 'sales': return <Sales />
      case 'reports': return <Reports />
      case 'users': return <UserManagement />
      default: return <DashboardHome onNavigate={setPage} />
    }
  }

  return (
    <div className="flex min-h-screen gap-4 p-4 max-[600px]:flex-col max-[600px]:p-2.5 print:block print:p-0">
      <Sidebar page={page} onNavigate={setPage} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={TITLES[page] ?? page}
          onRefresh={page === 'dashboard' ? refresh : undefined}
          refreshing={loading}
        />
        <div className="flex-1 overflow-y-auto p-1 print:overflow-visible">
          {denied
            ? <Placeholder title="No access" text="You don't have permission to open this module. Ask an administrator for rights." />
            : renderPage()}
        </div>
      </div>
    </div>
  )
}
