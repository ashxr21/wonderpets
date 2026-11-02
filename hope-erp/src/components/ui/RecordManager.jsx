import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { makeStamp } from '../../utils/stamp'
import { money } from '../../utils/pricing'
import Button from './Button'
import Modal from './Modal'
import Alert from './Alert'
import FormField from './FormField'
import Tabs from './Tabs'
import ActionButton from './ActionButton'
import { DataTable, Td, Badge } from './DataTable'
import { inputCls } from './styles'

// What a table cell shows for a field
const shown = (f, r) => {
  if (f.render) return f.render(r)
  const v = r[f.name]
  if (f.options) return f.options.find((o) => o.value === v)?.label ?? v
  if (f.money) return money(v)
  return v === '' || v == null ? '—' : v
}
const text = (f, r) => {
  const x = shown(f, r)
  return typeof x === 'string' || typeof x === 'number' ? String(x) : ''
}

const disabledCls = 'disabled:bg-[rgba(220,230,250,.6)] disabled:text-[#6679a3] disabled:cursor-not-allowed'

function RecordForm({ fields, fixed, mode, record, error, singular, onSubmit, onCancel }) {
  const formFields = fields.filter((f) => !f.virtual)
  const [values, setValues] = useState(() =>
    Object.fromEntries(formFields.map((f) => [f.name, record?.[f.name] ?? fixed[f.name] ?? f.default ?? '']))
  )
  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }))
  const locked = (f) => f.name in fixed || (mode === 'edit' && f.readOnlyOnEdit)

  return (
    <>
      <Alert message={error} />
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(values) }}>
        <div className="grid grid-cols-2 gap-x-3.5 max-[600px]:grid-cols-1">
          {formFields.map((f) => {
            const hint = f.hint?.(values)
            return (
              <div key={f.name} className={f.half ? '' : 'col-span-2 max-[600px]:col-span-1'}>
                <FormField label={f.label} htmlFor={f.name}>
                  {f.type === 'select' ? (
                    <select
                      id={f.name} className={`${inputCls} ${disabledCls}`} required={f.required !== false}
                      disabled={locked(f)} value={values[f.name]} onChange={set(f.name)}
                    >
                      <option value="">Select…</option>
                      {f.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <input
                      id={f.name} type={f.type ?? 'text'} step={f.step} min={f.min}
                      className={`${inputCls} ${disabledCls}`} required={f.required !== false}
                      disabled={locked(f)} placeholder={f.placeholder}
                      value={values[f.name]} onChange={set(f.name)}
                    />
                  )}
                  {hint && <p className="mt-1.5 text-[.8rem] text-[#6679a3]">{hint}</p>}
                </FormField>
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex gap-2.5">
          <Button type="submit" size="full">Save {singular}</Button>
          <Button type="button" variant="secondary" className="min-w-[100px]" onClick={onCancel}>Cancel</Button>
        </div>
      </form>
    </>
  )
}

/**
 * Generic list screen: search, Active/Deleted/All tabs, add, edit, soft-delete, restore.
 *
 * fields[]  { name, label, short, type: text|number|date|select, options, half, required,
 *             readOnlyOnEdit, hideInTable, virtual, render(record), hint(values), money, default }
 * keyOf     (record) => unique string
 * perms    { add, edit, delete } permission keys
 * scope     (record) => bool        limit the list (e.g. one employee's history)
 * fixed     { field: value }        locked values for new records in a scoped list
 * validate  (values, mode, record) => error string or ''
 */
export default function RecordManager({
  title, singular, records, setRecords, fields, keyOf, perms,
  scope, fixed = {}, sort, extraActions, validate,
}) {
  const { can, currentUser } = useAuth()
  const [filter, setFilter] = useState('active')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // { mode: 'add' | 'edit', record? }
  const [error, setError] = useState('')

  const columns = fields.filter((f) => !f.hideInTable)
  const q = search.trim().toLowerCase()

  let visible = (scope ? records.filter(scope) : records)
    .filter((r) => filter === 'all' || (filter === 'active' ? !r.isDeleted : r.isDeleted))
    .filter((r) => !q || columns.some((f) => text(f, r).toLowerCase().includes(q)))
  if (sort) visible = [...visible].sort(sort)

  const close = () => { setEditing(null); setError('') }

  const handleSave = (raw) => {
    const values = {}
    fields.filter((f) => !f.virtual).forEach((f) => {
      const v = typeof raw[f.name] === 'string' ? raw[f.name].trim() : raw[f.name]
      values[f.name] = f.type === 'number' && v !== '' ? Number(v) : v
    })
    const merged = { ...values, ...fixed }

    const msg = validate?.(merged, editing.mode, editing.record)
    if (msg) return setError(msg)

    if (editing.mode === 'add') {
      if (records.some((r) => keyOf(r).toLowerCase() === keyOf(merged).toLowerCase())) {
        return setError(`That ${singular.toLowerCase()} already exists.`)
      }
      setRecords((prev) => [...prev, { ...merged, isDeleted: false, stamp: makeStamp('CREATED', currentUser) }])
    } else {
      const k = keyOf(editing.record)
      setRecords((prev) =>
        prev.map((r) => (keyOf(r) === k ? { ...r, ...merged, stamp: makeStamp('UPDATED', currentUser) } : r))
      )
    }
    close()
  }

  const setDeleted = (record, isDeleted) => {
    if (isDeleted && !window.confirm(`Delete this ${singular.toLowerCase()}?`)) return
    const k = keyOf(record)
    setRecords((prev) =>
      prev.map((r) =>
        keyOf(r) === k ? { ...r, isDeleted, stamp: makeStamp(isDeleted ? 'DELETED' : 'RESTORED', currentUser) } : r
      )
    )
  }

  return (
    <>
      <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3 print:hidden">
        {title && <h3 className="text-[1.3rem] font-extrabold">{title}</h3>}
        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <input
            className="min-w-[200px] rounded-full border border-[rgba(120,145,210,.3)] bg-white/65 px-4 py-2.5 text-[.88rem]
              font-medium text-[#1d2a4d] focus:border-[#5b86f0] focus:bg-white focus:ring-4 focus:ring-[#5b86f0]/20 focus:outline-none"
            placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
          />
          <Tabs
            value={filter} onChange={setFilter}
            options={['active', 'deleted', 'all'].map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }))}
          />
          {can(perms.add) && <Button size="sm" onClick={() => setEditing({ mode: 'add' })}>+ Add {singular}</Button>}
        </div>
      </div>

      <DataTable heads={[...columns.map((f) => f.short ?? f.label), 'Status', 'Stamp', 'Actions']}>
        {visible.length === 0 && (
          <tr><td colSpan={columns.length + 3} className="px-5 py-14 text-center text-[#6679a3]">No records found.</td></tr>
        )}
        {visible.map((r) => (
          <tr key={keyOf(r)} className={`group hover:bg-white/55 ${r.isDeleted ? 'bg-[rgba(229,72,77,.08)] opacity-85' : ''}`}>
            {columns.map((f, i) => (
              <Td key={f.name}>{i === 0 ? <strong>{shown(f, r)}</strong> : shown(f, r)}</Td>
            ))}
            <Td><Badge deleted={r.isDeleted} /></Td>
            <Td className="max-w-[200px] text-[.72rem] text-[#6679a3]">{r.stamp}</Td>
            <Td>
              <div className="flex flex-wrap gap-1.5">
                {!r.isDeleted && extraActions?.(r)}
                {!r.isDeleted && can(perms.edit) && (
                  <ActionButton onClick={() => setEditing({ mode: 'edit', record: r })}>Edit</ActionButton>
                )}
                {!r.isDeleted && can(perms.delete) && (
                  <ActionButton tone="danger" onClick={() => setDeleted(r, true)}>Delete</ActionButton>
                )}
                {r.isDeleted && can(perms.delete) && (
                  <ActionButton tone="success" onClick={() => setDeleted(r, false)}>Restore</ActionButton>
                )}
              </div>
            </Td>
          </tr>
        ))}
      </DataTable>

      <Modal
        open={!!editing} onClose={close} size="lg"
        title={editing?.mode === 'edit' ? `Edit ${singular}` : `Add ${singular}`}
        subtitle={`Enter ${singular.toLowerCase()} details`}
      >
        {editing && (
          <RecordForm
            fields={fields} fixed={fixed} mode={editing.mode} record={editing.record}
            error={error} singular={singular} onSubmit={handleSave} onCancel={close}
          />
        )}
      </Modal>
    </>
  )
}