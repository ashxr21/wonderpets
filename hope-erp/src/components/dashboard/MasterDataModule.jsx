import { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useERPCollection } from '../../hooks/useERPData'
import { makeStamp } from '../../utils/stamp'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Alert from '../ui/Alert'
import FormField from '../ui/FormField'
import { DataTable, Td, Badge } from '../ui/DataTable'
import { inputCls } from '../ui/styles'

const actionBtn =
  'cursor-pointer rounded-full border border-white/75 bg-white/70 px-[13px] py-1.5 text-[.75rem] font-semibold ' +
  'text-[#1d2a4d] transition-all duration-150'

function RecordForm({ fields, keyField, singular, mode, record, error, onSubmit, onCancel }) {
  const [values, setValues] = useState(
    () => Object.fromEntries(fields.map((f) => [f.name, record?.[f.name] ?? '']))
  )
  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }))

  return (
    <>
      <Alert message={error} />
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(Object.fromEntries(Object.entries(values).map(([k, v]) => [k, v.trim()])))
        }}
      >
        {fields.map((f) => (
          <FormField key={f.name} label={f.label} htmlFor={f.name}>
            <input
              id={f.name} required className={inputCls} placeholder={f.placeholder}
              value={values[f.name]} onChange={set(f.name)}
              readOnly={mode === 'edit' && f.name === keyField}
            />
          </FormField>
        ))}
        <div className="mt-2 flex gap-2.5">
          <Button type="submit" size="full">Save {singular}</Button>
          <Button type="button" variant="secondary" className="min-w-[100px]" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </>
  )
}

export default function MasterDataModule({ title, singular, permPrefix, storageKey, fields, keyField }) {
  const { can, currentUser } = useAuth()
  const [list, setList] = useERPCollection(storageKey)
  const [filter, setFilter] = useState('active')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // { mode: 'add' | 'edit', record? }
  const [error, setError] = useState('')

  const visible = useMemo(() => {
    const q = search.toLowerCase()
    return list
      .filter((r) => filter === 'all' || (filter === 'active' ? !r.isDeleted : r.isDeleted))
      .filter((r) => !q || fields.some((f) => String(r[f.name]).toLowerCase().includes(q)))
  }, [list, filter, search, fields])

  const closeModal = () => { setEditing(null); setError('') }

  const handleSave = (values) => {
    if (editing.mode === 'add') {
      if (list.some((r) => r[keyField].toLowerCase() === values[keyField].toLowerCase())) {
        return setError(`${singular} code/number already exists.`)
      }
      setList((prev) => [...prev, { ...values, isDeleted: false, stamp: makeStamp('CREATED', currentUser) }])
    } else {
      setList((prev) =>
        prev.map((r) =>
          r[keyField] === editing.record[keyField]
            ? { ...r, ...values, stamp: makeStamp('UPDATED', currentUser) }
            : r
        )
      )
    }
    closeModal()
  }

  const setDeleted = (key, isDeleted) => {
    if (isDeleted && !window.confirm(`Delete this ${singular.toLowerCase()}?`)) return
    setList((prev) =>
      prev.map((r) =>
        r[keyField] === key
          ? { ...r, isDeleted, stamp: makeStamp(isDeleted ? 'DELETED' : 'RESTORED', currentUser) }
          : r
      )
    )
  }

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3 print:hidden">
        <h3 className="text-[1.3rem] font-extrabold">{title}</h3>
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            className="min-w-[220px] rounded-full border border-[rgba(120,145,210,.3)] bg-white/65 px-4 py-2.5 text-[.88rem]
              font-medium text-[#1d2a4d] focus:border-[#5b86f0] focus:bg-white focus:ring-4 focus:ring-[#5b86f0]/20 focus:outline-none"
            placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
          />
          <div className="inline-flex flex-wrap gap-1 rounded-full border border-white/75 bg-white/45 p-1">
            {['active', 'deleted', 'all'].map((t) => (
              <button
                key={t} onClick={() => setFilter(t)}
                className={`cursor-pointer rounded-full border-none px-4 py-[7px] text-[.8rem] font-semibold capitalize
                  ${filter === t
                    ? 'bg-linear-to-br from-[#6a93f5] to-[#8b8cf7] text-white shadow-[0_6px_14px_-6px_rgba(91,134,240,.9)]'
                    : 'bg-transparent text-[#6679a3] hover:text-[#1d2a4d]'}`}
              >
                {t}
              </button>
            ))}
          </div>
          {can(`${permPrefix}.add`) && (
            <Button size="sm" onClick={() => setEditing({ mode: 'add' })}>+ Add {singular}</Button>
          )}
        </div>
      </div>

      <DataTable heads={[...fields.map((f) => f.short ?? f.label), 'Status', 'Stamp', 'Actions']}>
        {visible.length === 0 && (
          <tr><td colSpan={fields.length + 3} className="px-5 py-14 text-center text-[#6679a3]">No records found.</td></tr>
        )}
        {visible.map((r) => (
          <tr key={r[keyField]} className={`group hover:bg-white/55 ${r.isDeleted ? 'bg-[rgba(229,72,77,.08)] opacity-85' : ''}`}>
            {fields.map((f, i) => (
              <Td key={f.name}>{i === 0 ? <strong>{r[f.name]}</strong> : r[f.name]}</Td>
            ))}
            <Td><Badge deleted={r.isDeleted} /></Td>
            <Td className="max-w-[200px] text-[.72rem] text-[#6679a3]">{r.stamp}</Td>
            <Td>
              <div className="flex flex-wrap gap-1.5">
                {!r.isDeleted && can(`${permPrefix}.edit`) && (
                  <button className={`${actionBtn} hover:bg-linear-to-br hover:from-[#6a93f5] hover:to-[#8b8cf7] hover:text-white`}
                    onClick={() => setEditing({ mode: 'edit', record: r })}>Edit</button>
                )}
                {!r.isDeleted && can(`${permPrefix}.delete`) && (
                  <button className={`${actionBtn} hover:bg-[#e5484d] hover:text-white`}
                    onClick={() => setDeleted(r[keyField], true)}>Delete</button>
                )}
                {r.isDeleted && can(`${permPrefix}.delete`) && (
                  <button className={`${actionBtn} hover:bg-[#12b886] hover:text-white`}
                    onClick={() => setDeleted(r[keyField], false)}>Restore</button>
                )}
              </div>
            </Td>
          </tr>
        ))}
      </DataTable>

      <Modal
        open={!!editing} onClose={closeModal} size="lg"
        title={editing?.mode === 'edit' ? `Edit ${singular}` : `Add ${singular}`}
        subtitle={`Enter ${singular.toLowerCase()} details`}
      >
        {editing && (
          <RecordForm
            fields={fields} keyField={keyField} singular={singular}
            mode={editing.mode} record={editing.record} error={error}
            onSubmit={handleSave} onCancel={closeModal}
          />
        )}
      </Modal>
    </>
  )
}
