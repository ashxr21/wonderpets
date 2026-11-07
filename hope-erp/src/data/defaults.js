export const KEYS = {
  customers: 'hope_erp_customers_v3',
  products: 'hope_erp_products_v2',
  prices: 'hope_erp_prices_v1',
  employees: 'hope_erp_employees_v1',
  jobs: 'hope_erp_jobs_v1',
  depts: 'hope_erp_depts_v1',
  jobHistory: 'hope_erp_jobhistory_v1',
  sales: 'hope_erp_sales_v1',
  salesDetail: 'hope_erp_salesdetail_v1',
  payments: 'hope_erp_payments_v1',
}

const rec = (o) => ({ ...o, isDeleted: false, stamp: 'CREATED system 2026-10-01' })

export const DEFAULT_CUSTOMERS = [
  { custNo: 'C-001', custName: 'Acme Corporation', address: '123 Main St, Metro City', payterms: 'Net 30' },
  { custNo: 'C-002', custName: 'Globex Industries', address: '456 Oak Ave, Harbor Town', payterms: 'Net 45' },
  { custNo: 'C-003', custName: 'Initech Solutions', address: '789 Pine Rd, Lakeside', payterms: 'COD' },
].map(rec)

export const DEFAULT_PRODUCTS = [
  { prodCode: 'P-001', description: 'Industrial Widget A', unit: 'pcs' },
  { prodCode: 'P-002', description: 'Precision Gear Set', unit: 'box' },
  { prodCode: 'P-003', description: 'Heavy-Duty Bearing', unit: 'pcs' },
].map(rec)

export const DEFAULT_PRICES = [
  { prodCode: 'P-001', effDate: '2026-01-01', unitPrice: 25 },
  { prodCode: 'P-001', effDate: '2026-09-01', unitPrice: 27.5 },
  { prodCode: 'P-002', effDate: '2026-01-01', unitPrice: 40 },
  { prodCode: 'P-003', effDate: '2026-01-01', unitPrice: 120 },
].map(rec)

export const DEFAULT_EMPLOYEES = [
  { empNo: 'E-001', gender: 'F', firstName: 'Maria', lastName: 'Santos', birthDate: '1990-04-12', hireDate: '2022-03-01', sepDate: '' },
  { empNo: 'E-002', gender: 'M', firstName: 'John', lastName: 'Cruz', birthDate: '1988-09-23', hireDate: '2021-06-15', sepDate: '' },
  { empNo: 'E-003', gender: 'F', firstName: 'Ana', lastName: 'Reyes', birthDate: '1995-01-30', hireDate: '2023-02-10', sepDate: '2026-08-31' },
].map(rec)

export const DEFAULT_JOBS = [
  { jobCode: 'J-001', jobDesc: 'Sales Associate' },
  { jobCode: 'J-002', jobDesc: 'Sales Manager' },
  { jobCode: 'J-003', jobDesc: 'HR Officer' },
].map(rec)

export const DEFAULT_DEPTS = [
  { deptCode: 'D-001', deptName: 'Sales' },
  { deptCode: 'D-002', deptName: 'Human Resources' },
].map(rec)

export const DEFAULT_JOB_HISTORY = [
  { empNo: 'E-001', effDate: '2022-03-01', salary: 30000, jobCode: 'J-001', deptCode: 'D-001' },
  { empNo: 'E-001', effDate: '2024-01-01', salary: 38000, jobCode: 'J-002', deptCode: 'D-001' },
  { empNo: 'E-002', effDate: '2021-06-15', salary: 45000, jobCode: 'J-002', deptCode: 'D-001' },
  { empNo: 'E-003', effDate: '2023-02-10', salary: 32000, jobCode: 'J-003', deptCode: 'D-002' },
].map(rec)

export const DEFAULT_SALES = [
  { transNo: 'T-001', salesDate: '2026-10-05', custNo: 'C-001', empNo: 'E-001' },
  { transNo: 'T-002', salesDate: '2026-10-12', custNo: 'C-002', empNo: 'E-002' },
  { transNo: 'T-003', salesDate: '2026-10-20', custNo: 'C-001', empNo: 'E-001' },
].map(rec)

export const DEFAULT_SALES_DETAIL = [
  { transNo: 'T-001', prodCode: 'P-001', qty: 10 },
  { transNo: 'T-001', prodCode: 'P-002', qty: 4 },
  { transNo: 'T-002', prodCode: 'P-003', qty: 5 },
  { transNo: 'T-002', prodCode: 'P-001', qty: 6 },
  { transNo: 'T-003', prodCode: 'P-002', qty: 8 },
].map(rec)
