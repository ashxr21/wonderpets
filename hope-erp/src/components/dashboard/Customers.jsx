import MasterdataModule from './MasterDataModule'
import { KEYS, DEFAULT_CUSTOMERS } from '../../data/defaults'  

const fields = [
    {name: 'custNo', label: 'Customer No', short: 'Cust No', placeholder: 'e.g. C-001', readOnlyOnEdit: true},
    {name: 'custname', label: 'Customer Name', placeholder: 'CompanyName'},
    {name: 'address', label: 'Address', placeholder: 'FullAddress'},
    {name: 'payterms', label: 'Payment Terms', short: 'PayTerms', placeholder: 'e.g. 30 days'},

]
export default function Customers() {
    return (
        <MasterdataModule
        title="Customer Management" singular="Customer"
        storageKey={KEYS.customers} defaults={DEFAULT_CUSTOMERS}
        fields={fields} keyOf={(r) => r.custNo}         "cust": Unknown Word. 
        perms ={{ add: 'customers.add', edit: 'customers.edit', delete: 'customers.delete' }}
        />
    )
}

