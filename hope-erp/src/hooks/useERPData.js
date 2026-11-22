import { useContext } from 'react'
import { ERPDataContext } from '../context/erpData'

export function useERPData() {
  const value = useContext(ERPDataContext)
  if (!value) throw new Error('useERPData must be used inside ERPDataProvider.')
  return value
}

export function useERPCollection(storageKey) {
  const { collections, setRecords } = useERPData()
  return [collections[storageKey] ?? [], (update) => setRecords(storageKey, update)]
}
