import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { readStore } from '../../utils/storage'
import { computeSales, money, priceFor } from '../../utils/pricing'
import {
    KEYS, DEFAULT_SALES, DEFAULT_SALES_DETAIL, DEFAULT_CUSTOMERS,
    DEFAULT_PRODUCTS, DEFAULT_PRICES, DEFAULT_EMPLOYEES,
    } from '../../data/defaults'
    import RecordManager from '../ui/RecordManager'
    import ActionButton from '../ui/ActionButton'
    import Modal from '../ui/Modal'

    export default function Sales() {
    const { can } = useAuth()
    const [sales, setSales] = useLocalStorage(KEYS.sales, DEFAULT_SALES)
    const [details, setDetails] = useLocalStorage(KEYS.salesDetail, DEFAULT_SALES_DETAIL)
    const [detailsFor, setDetailsFor] = useState(null) // transNo

    // Data owned by other modules (read once when this screen opens)
    const { customers, employees, products, prices } = useMemo(() => ({
        customers: readStore(KEYS.customers, DEFAULT_CUSTOMERS),
        employees: readStore(KEYS.employees, DEFAULT_EMPLOYEES),
        products: readStore(KEYS.products, DEFAULT_PRODUCTS),
        prices: readStore(KEYS.prices, DEFAULT_PRICES),
    }), [])

    const customerOptions = customers.filter((c) => !c.isDeleted).map((c) => ({ value: c.custNo, label: `${c.custNo} – ${c.custName}` }))
    const employeeOptions = employees.filter((e) => !e.isDeleted).map((e) => ({ value: e.empNo, label: `${e.empNo} – ${e.firstName} ${e.lastName}` }))
    const productOptions = products.filter((p) => !p.isDeleted).map((p) => ({ value: p.prodCode, label: `${p.prodCode} – ${p.description}` }))

    const totals = Object.fromEntries(computeSales(sales, details, prices).map((s) => [s.transNo, s.total]))

    const saleFields = [
        { name: 'transNo', label: 'Transaction No.', short: 'Trans No', placeholder: 'T-001', readOnlyOnEdit: true },
        { name: 'salesDate', label: 'Sales Date', short: 'Date', type: 'date' },
        { name: 'custNo', label: 'Customer', type: 'select', options: customerOptions },
        { name: 'empNo', label: 'Salesperson', type: 'select', options: employeeOptions },
        { name: 'total', label: 'Total', virtual: true, render: (r) => (r.isDeleted ? '—' : money(totals[r.transNo])) },
    ]

    const sale = sales.find((s) => s.transNo === detailsFor)

    const detailFields = sale && [
        { name: 'transNo', label: 'Transaction No.', hideInTable: true },
        {
        name: 'prodCode', label: 'Product', type: 'select', options: productOptions, readOnlyOnEdit: true,
        hint: (v) => {
            if (!v.prodCode) return ''
            const p = priceFor(prices, v.prodCode, sale.salesDate)
            return p == null ? 'No price set for this sale date.' : `Unit price on ${sale.salesDate}: ${money(p)}`
        },
        },
        { name: 'qty', label: 'Quantity', short: 'Qty', type: 'number', min: 1, step: 1, default: 1 },
        { name: 'unitPrice', label: 'Unit Price', virtual: true, render: (r) => money(priceFor(prices, r.prodCode, sale.salesDate) ?? 0) },
        { name: 'amount', label: 'Amount', virtual: true, render: (r) => money((priceFor(prices, r.prodCode, sale.salesDate) ?? 0) * Number(r.qty)) },
    ]

    const validateDetail = (v) => {
        if (!Number.isInteger(v.qty) || v.qty < 1) return 'Quantity must be a whole number of at least 1.'
        if (priceFor(prices, v.prodCode, sale.salesDate) == null) {
        return 'This product has no price effective on the sale date. Add a price in Products first.'
        }
        return ''
    }

    return (
        <>
        <RecordManager
            title="Sales" singular="Sale"
            records={sales} setRecords={setSales}
            fields={saleFields} keyOf={(r) => r.transNo}
            perms={{ add: 'sales.add', edit: 'sales.edit', delete: 'sales.delete' }}
            sort={(a, b) => b.salesDate.localeCompare(a.salesDate)}
            extraActions={(r) =>
            can('sales.detailView') && <ActionButton onClick={() => setDetailsFor(r.transNo)}>Details</ActionButton>
            }
        />

        <Modal
            open={!!sale} onClose={() => setDetailsFor(null)} size="xl"
            title={sale ? `Sale Details – ${sale.transNo}` : ''}
            subtitle={sale ? `${sale.salesDate} · ${customerOptions.find((c) => c.value === sale.custNo)?.label ?? sale.custNo}` : ''}
        >
            {sale && (
            <>
                <RecordManager
                    singular="Line Item"
                    records={details} setRecords={setDetails}
                    fields={detailFields} keyOf={(r) => `${r.transNo}|${r.prodCode}`}
                    perms={{ add: 'sales.detailAdd', edit: 'sales.detailEdit', delete: 'sales.detailDelete' }}
                    scope={(r) => r.transNo === sale.transNo}
                    fixed={{ transNo: sale.transNo }}
                    validate={validateDetail}
                    />
                    <div className="mt-3 text-right text-[1.05rem] font-semibold">
                    Total: {money(totals[sale.transNo])}
                </div>
            </>
            )}
        </Modal>
        </>
    )
    }
