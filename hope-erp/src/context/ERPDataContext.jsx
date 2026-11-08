import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { ERPDataContext } from './erpData'
import { KEYS } from '../data/defaults'
import { supabase } from '../lib/supabase'

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
function readLocalRecords(storageKey) {
  const raw = window.localStorage.getItem(storageKey)
  if (!raw) return []

  const records = JSON.parse(raw)
  if (!Array.isArray(records)) throw new Error(`Local data for ${storageKey} is not a record list.`)
  return records
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

  const value = { collections: data, loading, error, setRecords, refresh }
  return <ERPDataContext.Provider value={value}>{children}</ERPDataContext.Provider>
}
