import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { readStore } from '../../utils/storage'
import { computeSales, money, priceFor } from '../../utils/pricing'
import {
    KEYS, DEFAULT_CUSTOMERS, DEFAULT_PRODUCTS, DEFAULT_PRICES, DEFAULT_EMPLOYEES,
    DEFAULT_JOBS, DEFAULT_DEPTS, DEFAULT_JOB_HISTORY, DEFAULT_SALES, DEFAULT_SALES_DETAIL,
    } from '../../data/defaults'
    import Button from '../ui/Button'
    import Tabs from '../ui/Tabs'
    import FormField from '../ui/FormField'
    import { DataTable, Td } from '../ui/DataTable'
    import { inputCls, glass } from '../ui/styles'

    const REPORTS = [
    { id: 'topCustomers', perm: 'reports.topCustomers', label: 'Top Customers' },
    { id: 'productMaster', perm: 'reports.productMaster', label: 'Product Master' },
    { id: 'topProducts', perm: 'reports.topProducts', label: 'Top Products' },
    { id: 'activeEmployees', perm: 'reports.activeEmployees', label: 'Active Employees' },
    { id: 'allEmployees', perm: 'reports.allEmployees', label: 'All Employees' },
    { id: 'empJobHistory', perm: 'reports.empJobHistory', label: 'Employee Job History' },
    { id: 'topSales', perm: 'reports.topSales', label: 'Top Sales' },
    ]

    const GENDER = { M: 'Male', F: 'Female', O: 'Other' }

    export default function Reports() {
    const { can } = useAuth()
    const available = REPORTS.filter((r) => can(r.perm))
    const [active, setActive] = useState(available[0]?.id)
    const [histEmp, setHistEmp] = useState('all')

    const d = useMemo(() => ({
        customers: readStore(KEYS.customers, DEFAULT_CUSTOMERS),
        products: readStore(KEYS.products, DEFAULT_PRODUCTS),
        prices: readStore(KEYS.prices, DEFAULT_PRICES),
        employees: readStore(KEYS.employees, DEFAULT_EMPLOYEES),
        jobs: readStore(KEYS.jobs, DEFAULT_JOBS),
        depts: readStore(KEYS.depts, DEFAULT_DEPTS),
        history: readStore(KEYS.jobHistory, DEFAULT_JOB_HISTORY),
        sales: readStore(KEYS.sales, DEFAULT_SALES),
        details: readStore(KEYS.salesDetail, DEFAULT_SALES_DETAIL),
    }), [])

    if (available.length === 0) {
        return (
        <div className={`${glass} rounded-[22px] p-6`}>
            <h3 className="mb-2 text-[1.05rem] font-extrabold">Reports</h3>
            <p>You don't have access to any reports yet. Ask an administrator to assign rights.</p>
        </div>
        )
    }

    const today = new Date().toISOString().slice(0, 10)
    const sales = computeSales(d.sales, d.details, d.prices)
    const empList = d.employees.filter((e) => !e.isDeleted)

    const custName = (no) => d.customers.find((c) => c.custNo === no)?.custName ?? no
    const prodDesc = (no) => d.products.find((p) => p.prodCode === no)?.description ?? no
    const empName = (no) => { const e = d.employees.find((x) => x.empNo === no); return e ? `${e.firstName} ${e.lastName}` : no }
    const jobDesc = (no) => d.jobs.find((j) => j.jobCode === no)?.jobDesc ?? no
    const deptName = (no) => d.depts.find((x) => x.deptCode === no)?.deptName ?? no
    const live = (list) => list.filter((r) => !r.isDeleted)

    const latestAssignment = (empNo) => {
        const list = live(d.history).filter((h) => h.empNo === empNo).sort((a, b) => b.effDate.localeCompare(a.effDate))
        return list.find((h) => h.effDate <= today) ?? list[0]
    }

    const builders = {
        topCustomers: () => {
        const by = {}
        sales.forEach((s) => { const c = (by[s.custNo] ??= { n: 0, total: 0 }); c.n++; c.total += s.total })
        return {
            heads: ['Rank', 'Cust No', 'Customer', 'Transactions', 'Total Sales'],
            rows: Object.entries(by).sort((a, b) => b[1].total - a[1].total)
            .map(([no, v], i) => [i + 1, no, custName(no), v.n, money(v.total)]),
        }
        },
        productMaster: () => ({
        heads: ['Prod Code', 'Description', 'Unit', 'Current Price'],
        rows: live(d.products).map((p) => {
            const price = priceFor(d.prices, p.prodCode, today)
            return [p.prodCode, p.description, p.unit, price == null ? '—' : money(price)]
        }),
        }),
        topProducts: () => {
        const by = {}
        sales.forEach((s) => s.lines.forEach((l) => {
            const p = (by[l.prodCode] ??= { qty: 0, amount: 0 }); p.qty += l.qty; p.amount += l.amount
        }))
        return {
            heads: ['Rank', 'Prod Code', 'Description', 'Qty Sold', 'Revenue'],
            rows: Object.entries(by).sort((a, b) => b[1].amount - a[1].amount)
            .map(([no, v], i) => [i + 1, no, prodDesc(no), v.qty, money(v.amount)]),
        }
        },
        activeEmployees: () => ({
        heads: ['Emp No', 'Name', 'Hired', 'Job', 'Department', 'Salary'],
        rows: live(d.employees).filter((e) => !e.sepDate || e.sepDate > today).map((e) => {
            const a = latestAssignment(e.empNo)
            return [e.empNo, `${e.firstName} ${e.lastName}`, e.hireDate,
            a ? jobDesc(a.jobCode) : '—', a ? deptName(a.deptCode) : '—', a ? money(a.salary) : '—']
        }),
        }),
        allEmployees: () => ({
        heads: ['Emp No', 'Name', 'Gender', 'Birth Date', 'Hired', 'Separated', 'Status'],
        rows: live(d.employees).map((e) => [
            e.empNo, `${e.firstName} ${e.lastName}`, GENDER[e.gender] ?? e.gender, e.birthDate, e.hireDate,
            e.sepDate || '—', !e.sepDate || e.sepDate > today ? 'Active' : 'Separated',
        ]),
        }),
        empJobHistory: () => ({
        heads: ['Emp No', 'Name', 'Effective', 'Job', 'Department', 'Salary'],
        rows: live(d.history)
            .filter((h) => histEmp === 'all' || h.empNo === histEmp)
            .sort((a, b) => a.empNo.localeCompare(b.empNo) || b.effDate.localeCompare(a.effDate))
            .map((h) => [h.empNo, empName(h.empNo), h.effDate, jobDesc(h.jobCode), deptName(h.deptCode), money(h.salary)]),
        }),
        topSales: () => ({
        heads: ['Rank', 'Trans No', 'Date', 'Customer', 'Salesperson', 'Total'],
        rows: [...sales].sort((a, b) => b.total - a.total).slice(0, 10)
            .map((s, i) => [i + 1, s.transNo, s.salesDate, custName(s.custNo), empName(s.empNo), money(s.total)]),
        }),
    }

    const current = available.find((r) => r.id === active) ?? available[0]
    const { heads, rows } = builders[current.id]()

    return (
        <div>
        <div className="mb-4 print:hidden">
            <Tabs value={current.id} onChange={setActive} options={available.map((r) => ({ value: r.id, label: r.label }))} />
        </div>

        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 print:hidden">
            <h3 className="text-[1.3rem] font-extrabold">{current.label}</h3>
            <div className="flex items-end gap-3">
            {current.id === 'empJobHistory' && (
                <div className="w-[240px] [&>div]:mb-0">
                <FormField label="Employee" htmlFor="histEmp">
                    <select id="histEmp" className={inputCls} value={histEmp} onChange={(e) => setHistEmp(e.target.value)}>
                    <option value="all">All employees</option>
                    {empList.map((e) => <option key={e.empNo} value={e.empNo}>{e.empNo} – {e.firstName} {e.lastName}</option>)}
                    </select>
                </FormField>
                </div>
            )}
            <Button size="sm" onClick={() => window.print()}>🖨 Print</Button>
            </div>
        </div>

        {/* Only visible when printing */}
        <div className="mb-3 hidden print:block">
            <h2 className="text-xl font-bold">Hope, Inc. ERP — {current.label}</h2>
            <p className="text-sm text-gray-600">Generated {today}</p>
        </div>

        <DataTable heads={heads}>
            {rows.length === 0 && (
            <tr><td colSpan={heads.length} className="px-5 py-14 text-center text-[#6679a3]">No data for this report.</td></tr>
            )}
            {rows.map((row, i) => (
            <tr key={i} className="group hover:bg-white/55">
                {row.map((cell, j) => <Td key={j}>{j === 0 ? <strong>{cell}</strong> : cell}</Td>)}
            </tr>
            ))}
        </DataTable>
        </div>
    )
    }
