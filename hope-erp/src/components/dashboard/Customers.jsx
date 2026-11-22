import { useERPData } from '../../hooks/useERPData'
import MasterDataModule from './MasterDataModule'
import { KEYS } from '../../data/defaults'
import { CreditCard, ShoppingCart, UserCheck, Users } from 'lucide-react'

const fields = [
  { name: 'custNo', label: 'Customer No.', short: 'Cust No', placeholder: 'e.g. C-001', readOnlyOnEdit: true },
  { name: 'custName', label: 'Customer Name', placeholder: 'Company name' },
  { name: 'address', label: 'Address', placeholder: 'Full address' },
  { name: 'payterms', label: 'Payment Terms', short: 'Pay Terms', placeholder: 'e.g. Net 30, COD' },
]

export default function Customers() {
  const { collections } = useERPData()
  const customers = collections[KEYS.customers]
  const sales = collections[KEYS.sales]
  const activeCustomers = customers.filter((customer) => !customer.isDeleted)
  const customersWithSales = new Set(
    sales.filter((sale) => !sale.isDeleted).map((sale) => sale.custNo)
  )
  const kpis = [
    { label: 'Total customers', value: customers.length, icon: Users, tone: 'indigo' },
    { label: 'Active customers', value: activeCustomers.length, icon: UserCheck, tone: 'emerald' },
    {
      label: 'Payment terms',
      value: new Set(activeCustomers.map((customer) => customer.payterms).filter(Boolean)).size,
      icon: CreditCard,
      tone: 'blue',
    },
    {
      label: 'Customers with sales',
      value: activeCustomers.filter((customer) => customersWithSales.has(customer.custNo)).length,
      icon: ShoppingCart,
      tone: 'purple',
    },
  ]

  return (
    <MasterDataModule
      title="Customer Management" singular="Customer"
      storageKey={KEYS.customers}
      fields={fields} keyField="custNo" permPrefix="customers" kpis={kpis}
    />
  )
}