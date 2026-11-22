import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { ERPDataContext } from './erpData'
import { KEYS } from '../data/defaults'
import { supabase } from '../lib/supabase'
import { computeSales, money } from '../utils/pricing'

const collections = [
  { storageKey: KEYS.customers, name: 'customers', keyOf: (r) => r.custNo },
  { storageKey: KEYS.products, name: 'products', keyOf: (r) => r.prodCode },
  { storageKey: KEYS.prices, name: 'prices', keyOf: (r) => `${r.prodCode}|${r.effDate}` },
  { storageKey: KEYS.employees, name: 'employees', keyOf: (r) => r.empNo },
  { storageKey: KEYS.jobs, name: 'jobs', keyOf: (r) => r.jobCode },
  { storageKey: KEYS.depts, name: 'departments', keyOf: (r) => r.deptCode },
  { storageKey: KEYS.jobHistory, name: 'job_history', keyOf: (r) => `${r.empNo}|${r.jobCode}|${r.effDate}` },
  { storageKey: KEYS.sales, name: 'sales', keyOf: (r) => r.transNo },
  { storageKey: KEYS.salesDetail, name: 'sales_details', keyOf: (r) => `${r.transNo}|${r.prodCode}` },
  { storageKey: KEYS.payments, name: 'payments', keyOf: (r) => r.orNo },
]

const emptyData = () => Object.fromEntries(collections.map(({ storageKey }) => [storageKey, []]))

function deletionErrorMessage(error) {
  if (error.code === '23503' || /foreign key/i.test(error.message)) {
    return 'This record is still referenced by related records. Remove those references first, then try again.'
  }
  if (error.code === '42501' || /row-level security|permission/i.test(error.message)) {
    return 'Supabase denied this deletion. Confirm the DELETE policy is installed and your account has delete permission.'
  }
  return `Could not permanently delete this record: ${error.message}`
}

function readLocalRecords(storageKey) {
  const raw = window.localStorage.getItem(storageKey)
  if (!raw) return []

  const records = JSON.parse(raw)
  if (!Array.isArray(records)) throw new Error(`Local data for ${storageKey} is not a record list.`)
  return records
}

function deletionDetails(collectionName, record, data) {
  const recordId = String(record[{
    customers: 'custNo',
    products: 'prodCode',
    prices: 'prodCode',
    employees: 'empNo',
    jobs: 'jobCode',
    departments: 'deptCode',
    job_history: 'empNo',
    sales: 'transNo',
    sales_details: 'transNo',
    payments: 'orNo',
  }[collectionName]] ?? '')

  const customerName = (customerNumber) =>
    data[KEYS.customers].find((customer) => customer.custNo === customerNumber)?.custName ?? customerNumber
  const productDescription = (productCode) =>
    data[KEYS.products].find((product) => product.prodCode === productCode)?.description ?? productCode
  const employeeName = (employeeNumber) => {
    const employee = data[KEYS.employees].find((item) => item.empNo === employeeNumber)
    return employee ? `${employee.firstName} ${employee.lastName}`.trim() : employeeNumber
  }

  switch (collectionName) {
    case 'customers':
      return { module: 'Customers', recordId, summary: record.custName || recordId }
    case 'products':
      return { module: 'Products', recordId, summary: record.description || recordId }
    case 'prices':
      return { module: 'Products', recordId: `${record.prodCode}|${record.effDate}`, summary: `Price for ${productDescription(record.prodCode)} effective ${record.effDate}` }
    case 'employees':
      return { module: 'Employees', recordId, summary: employeeName(record.empNo) }
    case 'jobs':
      return { module: 'Jobs', recordId, summary: record.jobDesc || recordId }
    case 'departments':
      return { module: 'Departments', recordId, summary: record.deptName || recordId }
    case 'job_history':
      return { module: 'Employees', recordId: `${record.empNo}|${record.jobCode}|${record.effDate}`, summary: `${employeeName(record.empNo)} — ${record.jobCode}, ${record.effDate}` }
    case 'sales': {
      const customer = customerName(record.custNo)
      const sale = computeSales(
        [{ ...record, isDeleted: false }],
        data[KEYS.salesDetail],
        data[KEYS.prices]
      )[0]
      return {
        module: 'Sales',
        recordId,
        summary: `Transaction for ${customer}${sale ? ` · ${money(sale.total)}` : ''}`,
      }
    }
    case 'sales_details':
      return {
        module: 'Sales',
        recordId: `${record.transNo}|${record.prodCode}`,
        summary: `${productDescription(record.prodCode)} on transaction ${record.transNo}`,
      }
    case 'payments':
      return {
        module: 'Sales',
        recordId,
        summary: `Payment for transaction ${record.transNo}`,
      }
    default:
      throw new Error(`Permanent deletion is not supported for collection: ${collectionName}`)
  }
}

export function ERPDataProvider({ children }) {
  const { currentUser } = useAuth()
  const [data, setData] = useState(emptyData)
  const [loading, setLoading] = useState(false)
  const [refreshVersion, setRefreshVersion] = useState(0)
  const [error, setError] = useState('')
  const dataRef = useRef(data)
  const writeQueues = useRef({})

  useEffect(() => {
    let active = true

    if (!currentUser) {
      dataRef.current = emptyData()
      setData(dataRef.current)
      setLoading(false)
      setError('')
      return () => { active = false }
    }

    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const nextData = emptyData()
        const canMigrateLocalStorage = currentUser.role === 'admin' || currentUser.role === 'superadmin'
        let isERPDatabaseEmpty = false

        if (canMigrateLocalStorage) {
          const { count, error: countError } = await supabase
            .from('erp_records')
            .select('id', { count: 'exact', head: true })
          if (countError) throw countError
          isERPDatabaseEmpty = count === 0
        }

        for (const collection of collections) {
          const { data: rows, error: queryError } = await supabase
            .from('erp_records')
            .select('record_key, payload')
            .eq('collection', collection.name)

          if (queryError) throw queryError

          if (rows.length) {
            nextData[collection.storageKey] = rows.map((row) => row.payload)
            continue
          }

          const localRecords = isERPDatabaseEmpty
            ? readLocalRecords(collection.storageKey)
            : []
          if (localRecords.length) {
            const { error: migrationError } = await supabase.from('erp_records').upsert(
              localRecords.map((record) => ({
                collection: collection.name,
                record_key: String(collection.keyOf(record)),
                payload: record,
              })),
              { onConflict: 'collection,record_key', ignoreDuplicates: true }
            )
            if (migrationError) throw migrationError
            const { data: migratedRows, error: migratedRowsError } = await supabase
              .from('erp_records')
              .select('payload')
              .eq('collection', collection.name)
            if (migratedRowsError) throw migratedRowsError
            nextData[collection.storageKey] = migratedRows.map((row) => row.payload)
          }
        }

        if (active) {
          dataRef.current = nextData
          setData(nextData)
        }
      } catch (loadError) {
        if (active) setError(`Could not load ERP data from Supabase: ${loadError.message}`)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [currentUser, refreshVersion])

  const refresh = useCallback(() => {
    setRefreshVersion((version) => version + 1)
  }, [])

  const setRecords = useCallback((storageKey, update) => {
    const collection = collections.find((item) => item.storageKey === storageKey)
    if (!collection) throw new Error(`Unknown ERP collection: ${storageKey}`)

    const previous = dataRef.current[storageKey]
    const next = typeof update === 'function' ? update(previous) : update
    const previousByKey = new Map(previous.map((record) => [String(collection.keyOf(record)), record]))
    const changed = next.filter((record) => {
      const oldRecord = previousByKey.get(String(collection.keyOf(record)))
      return !oldRecord || JSON.stringify(oldRecord) !== JSON.stringify(record)
    })

    dataRef.current = { ...dataRef.current, [storageKey]: next }
    setData(dataRef.current)
    if (!changed.length) return

    const write = async () => {
      const { error: writeError } = await supabase.from('erp_records').upsert(
        changed.map((record) => ({
          collection: collection.name,
          record_key: String(collection.keyOf(record)),
          payload: record,
          updated_at: new Date().toISOString(),
        })),
        { onConflict: 'collection,record_key' }
      )

      if (writeError) throw writeError
      setError('')
    }

    const previousQueue = writeQueues.current[collection.name] ?? Promise.resolve()
    writeQueues.current[collection.name] = previousQueue
      .then(write)
      .catch(async (writeError) => {
        setError(`Could not save ${collection.name} to Supabase: ${writeError.message}`)
        try {
          const { data: rows, error: reloadError } = await supabase
            .from('erp_records')
            .select('payload')
            .eq('collection', collection.name)

          if (reloadError) throw reloadError
          const restored = rows.map((row) => row.payload)
          dataRef.current = { ...dataRef.current, [storageKey]: restored }
          setData(dataRef.current)
        } catch (reloadError) {
          setError(`Could not save or reload ${collection.name}: ${reloadError.message}`)
        }
      })
  }, [])

  const deleteRecord = useCallback(async (storageKey, record) => {
    const collection = collections.find((item) => item.storageKey === storageKey)
    if (!collection) throw new Error(`Unknown ERP collection: ${storageKey}`)

    const recordKey = String(collection.keyOf(record))
    const previousQueue = writeQueues.current[collection.name] ?? Promise.resolve()
    let auditWarning = ''
    const removal = previousQueue.then(async () => {
      const { data: recordRow, error: lookupError } = await supabase
        .from('erp_records')
        .select('id')
        .eq('collection', collection.name)
        .eq('record_key', recordKey)
        .maybeSingle()

      if (lookupError) throw new Error(deletionErrorMessage(lookupError))
      if (!recordRow) {
        throw new Error('Supabase could not find this record. It may already have been deleted, or your account may not have access to it.')
      }

      if (!currentUser) throw new Error('You must be signed in to permanently delete a record.')
      const { module, recordId, summary } = deletionDetails(collection.name, record, dataRef.current)
      const deletedBy = currentUser.email || currentUser.name
      const { data: logRow, error: logError } = await supabase
        .from('deletion_logs')
        .insert({
          module,
          record_id: recordId,
          record_summary: summary,
          deleted_data: record,
          deleted_by: deletedBy,
          pending: true,
        })
        .select('id')
        .single()

      if (logError) {
        throw new Error(`Could not save the deletion history; the record was not deleted: ${logError.message}`)
      }
      if (!logRow) throw new Error('Could not confirm the deletion history was saved; the record was not deleted.')

      try {
        const { data: deletedRows, error: deleteError } = await supabase
          .from('erp_records')
          .delete()
          .eq('id', recordRow.id)
          .select('id')

        if (deleteError) throw new Error(deletionErrorMessage(deleteError))
        if (!deletedRows?.length) {
          throw new Error('Supabase did not delete this record. It may already be gone, or your account may not have DELETE permission.')
        }
      } catch (deleteFailure) {
        const { data: rolledBackRows, error: rollbackError } = await supabase
          .from('deletion_logs')
          .delete()
          .eq('id', logRow.id)
          .eq('pending', true)
          .select('id')

        if (rollbackError || !rolledBackRows?.length) {
          const reason = rollbackError?.message ?? 'Supabase did not remove the audit row.'
          throw new Error(`${deleteFailure.message} The failed deletion log could not be rolled back: ${reason}`)
        }
        throw deleteFailure
      }

      const { data: completedRows, error: completionError } = await supabase
        .from('deletion_logs')
        .update({ pending: false })
        .eq('id', logRow.id)
        .eq('pending', true)
        .select('id')

      if (completionError || !completedRows?.length) {
        auditWarning = `The record was deleted, but its audit log could not be finalized: ${completionError?.message ?? 'Supabase did not update the audit row.'}`
      }
    })

    writeQueues.current[collection.name] = removal.then(() => undefined, () => undefined)
    await removal

    const next = {
      ...dataRef.current,
      [storageKey]: dataRef.current[storageKey].filter(
        (item) => String(collection.keyOf(item)) !== recordKey
      ),
    }
    dataRef.current = next
    setData(next)
    return auditWarning ? { warning: auditWarning } : null
  }, [currentUser])

  const value = { collections: data, loading, error, setRecords, deleteRecord, refresh }
  return <ERPDataContext.Provider value={value}>{children}</ERPDataContext.Provider>
}
