import MasterDataModule from './MasterDataModule'
import { KEYS } from '../../data/defaults'

const fields = [
  { name: 'custNo', label: 'Customer No.', short: 'Cust No', placeholder: 'e.g. C-001', readOnlyOnEdit: true },
  { name: 'custName', label: 'Customer Name', placeholder: 'Company name' },
  { name: 'address', label: 'Address', placeholder: 'Full address' },
  { name: 'payterms', label: 'Payment Terms', short: 'Pay Terms', placeholder: 'e.g. Net 30, COD' },
]

export default function Customers() {
  return (
    <MasterDataModule
      title="Customer Management" singular="Customer"
      storageKey={KEYS.customers}
      fields={fields} keyField="custNo" permPrefix="customers"
    />
  )
}