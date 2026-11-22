import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useERPCollection, useERPData } from '../../hooks/useERPData'
import { computeSales, money, priceFor } from '../../utils/pricing'
import {
KEYS,
    } from '../../data/defaults'
    import RecordManager from '../ui/RecordManager'
    import Modal from '../ui/Modal'
    import { DataTable, Td, Badge } from '../ui/DataTable'
    import IconActionButton from '../ui/IconActionButton'
    import { CreditCard, Eye, ReceiptText, TrendingUp, Users } from 'lucide-react'

    export default function Sales() {
    const { can } = useAuth()
    const [sales, setSales] = useERPCollection(KEYS.sales)
    const [details, setDetails] = useERPCollection(KEYS.salesDetail)
    const [detailsFor, setDetailsFor] = useState(null) // transNo
    const [paymentsFor, setPaymentsFor] = useState(null) // transNo
    const { collections } = useERPData()
    const customers = collections[KEYS.customers]
    const employees = collections[KEYS.employees]
    const products = collections[KEYS.products]
    const prices = collections[KEYS.prices]
    const payments = collections[KEYS.payments]

    const customerOptions = customers.filter((c) => !c.isDeleted).map((c) => ({ value: c.custNo, label: `${c.custNo} – ${c.custName}` }))
    const employeeOptions = employees.filter((e) => !e.isDeleted).map((e) => ({ value: e.empNo, label: `${e.empNo} – ${e.firstName} ${e.lastName}` }))
    const productOptions = products.filter((p) => !p.isDeleted).map((p) => ({ value: p.prodCode, label: `${p.prodCode} – ${p.description}` }))

    const computedSales = computeSales(sales, details, prices)
    const totals = Object.fromEntries(computedSales.map((s) => [s.transNo, s.total]))
    const paidBySale = Object.fromEntries(payments.filter((p) => !p.isDeleted).reduce((map, p) => {
        map.set(p.transNo, (map.get(p.transNo) ?? 0) + Number(p.amount || 0))
        return map
    }, new Map()))
    const outstanding = computedSales.reduce((sum, s) => sum + Math.max(0, s.total - (paidBySale[s.transNo] ?? 0)), 0)
    const salesByPerson = computedSales.reduce((map, s) => {
        map.set(s.empNo, (map.get(s.empNo) ?? 0) + s.total)
        return map
    }, new Map())
    const topSellerId = [...salesByPerson.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
    const topSeller = employees.find((e) => e.empNo === topSellerId)
    const salesKpis = [
        { label: 'Total sales', value: money(computedSales.reduce((sum, s) => sum + s.total, 0)), icon: TrendingUp, tone: 'indigo' },
        { label: 'Active orders', value: computedSales.length, icon: ReceiptText, tone: 'blue' },
        { label: 'Outstanding balance', value: money(outstanding), icon: CreditCard, tone: 'amber' },
        { label: 'Top salesperson', value: topSeller ? `${topSeller.firstName} ${topSeller.lastName}` : '—', icon: Users, tone: 'purple' },
    ]

    const saleFields = [
        { name: 'transNo', label: 'Transaction No.', short: 'Trans No', placeholder: 'T-001', readOnlyOnEdit: true },
        { name: 'salesDate', label: 'Sales Date', short: 'Date', type: 'date' },
        { name: 'custNo', label: 'Customer', type: 'select', options: customerOptions },
        { name: 'empNo', label: 'Salesperson', type: 'select', options: employeeOptions },
        { name: 'total', label: 'Total', virtual: true, money: true, render: (r) => (r.isDeleted ? '—' : money(totals[r.transNo])) },
    ]

    const sale = sales.find((s) => s.transNo === detailsFor)
    const paymentSale = sales.find((s) => s.transNo === paymentsFor)
    const salePayments = payments
        .filter((payment) => payment.transNo === paymentsFor)
        .sort((a, b) => b.payDate.localeCompare(a.payDate))

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
        { name: 'unitPrice', label: 'Unit Price', virtual: true, money: true, render: (r) => money(priceFor(prices, r.prodCode, sale.salesDate) ?? 0) },
        { name: 'amount', label: 'Amount', virtual: true, money: true, render: (r) => money((priceFor(prices, r.prodCode, sale.salesDate) ?? 0) * Number(r.qty)) },
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
            kpis={salesKpis}
            records={sales} setRecords={setSales}
            storageKey={KEYS.sales}
            fields={saleFields} keyOf={(r) => r.transNo}
            perms={{ add: 'sales.add', edit: 'sales.edit', delete: 'sales.delete' }}
            sort={(a, b) => b.salesDate.localeCompare(a.salesDate)}
            extraActions={(r) =>
            can('sales.detailView') && (
                <>
                    <IconActionButton icon={Eye} label={`Details for sale ${r.transNo}`} onClick={() => setDetailsFor(r.transNo)} />
                    <IconActionButton icon={CreditCard} label={`Payments for sale ${r.transNo}`} onClick={() => setPaymentsFor(r.transNo)} />
                </>
            )
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
                    storageKey={KEYS.salesDetail}
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

        <Modal
            open={!!paymentSale} onClose={() => setPaymentsFor(null)} size="xl"
            title={paymentSale ? `Payments – ${paymentSale.transNo}` : ''}
            subtitle={paymentSale ? `${paymentSale.salesDate} · ${customerOptions.find((c) => c.value === paymentSale.custNo)?.label ?? paymentSale.custNo}` : ''}
        >
            <DataTable heads={['OR No.', 'Payment Date', { label: 'Amount', align: 'right' }, 'Status']}>
                {salePayments.length === 0 && (
                    <tr><td colSpan={4} className="px-5 py-14 text-center text-slate-600">No payments found for this sale.</td></tr>
                )}
                {salePayments.map((payment) => (
                    <tr key={payment.orNo} className={payment.isDeleted ? 'bg-[rgba(229,72,77,.08)] opacity-85' : ''}>
                        <Td><strong>{payment.orNo}</strong></Td>
                        <Td className="whitespace-nowrap">{payment.payDate}</Td>
                        <Td className="text-right font-mono font-semibold tabular-nums">{money(payment.amount)}</Td>
                        <Td><Badge deleted={payment.isDeleted} /></Td>
                    </tr>
                ))}
            </DataTable>
        </Modal>
        </>
    )
    }
