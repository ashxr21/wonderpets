import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { ALL_PERMS, PERM_GROUPS, emptyPerms, fullPerms } from '../../data/permissions'
import Button from '../ui/Button'
import Modal from '../ui/Modal'
import Alert from '../ui/Alert'
import FormField from '../ui/FormField'
import Tabs from '../ui/Tabs'
import ActionButton from '../ui/ActionButton'
import { DataTable, Td } from '../ui/DataTable'
import { inputCls } from '../ui/styles'

const ROLE_STYLE = {
    superadmin: 'bg-[rgba(139,124,246,.2)] text-[#5b46d6]',
    admin: 'bg-[rgba(91,134,240,.2)] text-[#3556c4]',
    user: 'bg-[rgba(18,184,134,.18)] text-[#0b7d5b]',
    }
    const STATUS_STYLE = {
    active: 'bg-[rgba(18,184,134,.18)] text-[#0b7d5b]',
    pending: 'bg-[rgba(245,165,36,.2)] text-[#9a6200]',
    blocked: 'bg-[rgba(229,72,77,.15)] text-[#b42329]',
    disapproved: 'bg-[rgba(102,121,163,.2)] text-[#4a5a80]',
    }

    function Pill({ cls, children }) {
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full border border-white/70 px-[11px] py-1 text-[.72rem] font-bold capitalize ${cls}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        {children}
        </span>
    )
    }

    function UserForm({ mode, user, self, roles, users, onSave, onCancel }) {
    const [v, setV] = useState(() => ({
        firstName: user?.firstName ?? '', lastName: user?.lastName ?? '', email: user?.email ?? '',
        role: user?.role ?? 'user', status: user?.status ?? 'active',
    }))
    const [error, setError] = useState('')
    const set = (k) => (e) => setV((x) => ({ ...x, [k]: e.target.value }))

    const submit = (e) => {
        e.preventDefault()
        const values = { ...v, firstName: v.firstName.trim(), lastName: v.lastName.trim(), email: v.email.trim() }
        if (mode === 'add' && users.some((u) => u.email.toLowerCase() === values.email.toLowerCase())) {
        return setError('Email already registered.')
        }
        onSave(values)
    }

    return (
        <>
        <Alert message={error} />
        <form onSubmit={submit}>
            <div className="grid grid-cols-2 gap-x-3.5 max-[600px]:grid-cols-1">
            <FormField label="First Name" htmlFor="umFirst">
                <input id="umFirst" required className={inputCls} value={v.firstName} onChange={set('firstName')} />
            </FormField>
            <FormField label="Last Name" htmlFor="umLast">
                <input id="umLast" required className={inputCls} value={v.lastName} onChange={set('lastName')} />
            </FormField>
            </div>
            <FormField label="Email" htmlFor="umEmail">
            <input id="umEmail" type="email" required disabled={mode === 'edit'} className={`${inputCls} disabled:bg-[rgba(220,230,250,.6)] disabled:text-[#6679a3]`}
                value={v.email} onChange={set('email')} />
            </FormField>
            <div className="grid grid-cols-2 gap-x-3.5 max-[600px]:grid-cols-1">
            <FormField label="Role" htmlFor="umRole">
                <select id="umRole" className={`${inputCls} disabled:opacity-60`} disabled={self} value={v.role} onChange={set('role')}>
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
            </FormField>
            <FormField label="Status" htmlFor="umStatus">
                <select id="umStatus" className={`${inputCls} disabled:opacity-60`} disabled={self} value={v.status} onChange={set('status')}>
                {Object.keys(STATUS_STYLE).map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </FormField>
            </div>
            <div className="mt-2 flex gap-2.5">
            <Button type="submit" size="full">Save User</Button>
            <Button type="button" variant="secondary" className="min-w-[100px]" onClick={onCancel}>Cancel</Button>
            </div>
        </form>
        </>
    )
    }

    function RightsForm({ user, onSave, onCancel }) {
    const [perms, setPerms] = useState(() => ({ ...emptyPerms(), ...user.perms }))

    const toggle = (k) => setPerms((p) => ({ ...p, [k]: !p[k] }))
    const setGroup = (g, on) =>
        setPerms((p) => {
        const n = { ...p, [g.view]: on }
        g.items.forEach((k) => (n[k] = on))
        return n
        })
    const toggleView = (g) =>
        perms[g.view] ? setGroup(g, false) : setPerms((p) => ({ ...p, [g.view]: true }))

    return (
        <>
        <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
            {PERM_GROUPS.map((g) => (
            <div key={g.key} className="rounded-[18px] border border-white/75 bg-white/55 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <label className="flex cursor-pointer items-center gap-2 font-bold">
                    <input type="checkbox" className="h-4 w-4 accent-[#5b86f0]" checked={!!perms[g.view]} onChange={() => toggleView(g)} />
                    {g.label} <span className="text-[.75rem] font-medium text-[#6679a3]">(module access)</span>
                </label>
                <div className="flex gap-1.5">
                    <ActionButton onClick={() => setGroup(g, true)}>Select all</ActionButton>
                    <ActionButton onClick={() => setGroup(g, false)}>Clear</ActionButton>
                </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-[600px]:grid-cols-1">
                {g.items.map((k) => (
                    <label key={k} className={`flex items-center gap-2 text-[.88rem] ${perms[g.view] ? 'cursor-pointer' : 'opacity-50'}`}>
                    <input type="checkbox" className="h-4 w-4 accent-[#5b86f0]" disabled={!perms[g.view]} checked={!!perms[k]} onChange={() => toggle(k)} />
                    {ALL_PERMS[k]}
                    </label>
                ))}
                </div>
            </div>
            ))}
        </div>
        <div className="mt-4 flex gap-2.5">
            <Button size="full" onClick={() => onSave(perms)}>Save Rights</Button>
            <Button variant="secondary" className="min-w-[100px]" onClick={onCancel}>Cancel</Button>
        </div>
        </>
    )
    }

    export default function UserManagement() {
    const { users, setUsers, currentUser } = useAuth()
    const [filter, setFilter] = useState('all')
    const [editing, setEditing] = useState(null) // { mode, user? }
    const [rightsFor, setRightsFor] = useState(null)

    const me = currentUser.email.toLowerCase()
    const isSelf = (u) => u.email.toLowerCase() === me
    // Superadmins manage everyone; admins can only manage regular users.
    const manageable = (u) => !isSelf(u) && (currentUser.role === 'superadmin' || u.role === 'user')
    const roles = currentUser.role === 'superadmin' ? ['user', 'admin', 'superadmin'] : ['user']

    const patch = (email, changes) =>
        setUsers((prev) => prev.map((u) => (u.email.toLowerCase() === email.toLowerCase() ? { ...u, ...changes } : u)))

    const saveUser = (values) => {
        if (editing.mode === 'add') {
        setUsers((prev) => [...prev, { ...values, perms: values.role === 'user' ? emptyPerms() : fullPerms() }])
        } else {
        const old = editing.user
        const perms = values.role === old.role ? old.perms : values.role === 'user' ? emptyPerms() : fullPerms()
        patch(old.email, { ...values, perms })
        }
        setEditing(null)
    }

    const count = (s) => users.filter((u) => u.status === s).length
    const visible = users.filter((u) => filter === 'all' || u.status === filter)

    return (
        <>
        <div className="mb-[18px] flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-[1.3rem] font-extrabold">User Management</h3>
            <div className="flex flex-wrap items-center gap-2.5">
            <Tabs
                value={filter} onChange={setFilter}
                options={[
                { value: 'all', label: 'All' },
                { value: 'pending', label: `Pending (${count('pending')})` },
                { value: 'active', label: 'Active' },
                { value: 'blocked', label: 'Blocked' },
                { value: 'disapproved', label: 'Disapproved' },
                ]}
            />
            <Button size="sm" onClick={() => setEditing({ mode: 'add' })}>+ Add User</Button>
            </div>
        </div>

        <DataTable heads={['Name', 'Email', 'Role', 'Status', 'Actions']}>
            {visible.length === 0 && (
            <tr><td colSpan={5} className="px-5 py-14 text-center text-[#6679a3]">No users found.</td></tr>
            )}
            {visible.map((u) => (
            <tr key={u.email} className="group hover:bg-white/55">
                <Td><strong>{u.firstName} {u.lastName}</strong>{isSelf(u) && <span className="ml-2 text-[.72rem] text-[#6679a3]">(you)</span>}</Td>
                <Td>{u.email}</Td>
                <Td><Pill cls={ROLE_STYLE[u.role]}>{u.role}</Pill></Td>
                <Td><Pill cls={STATUS_STYLE[u.status]}>{u.status}</Pill></Td>
                <Td>
                <div className="flex flex-wrap gap-1.5">
                    {manageable(u) && u.status === 'pending' && (
                    <>
                        <ActionButton tone="success" onClick={() => patch(u.email, { status: 'active', perms: u.role === 'user' ? { ...emptyPerms(), ...u.perms } : fullPerms() })}>Approve</ActionButton>
                        <ActionButton tone="danger" onClick={() => patch(u.email, { status: 'disapproved' })}>Disapprove</ActionButton>
                    </>
                    )}
                    {manageable(u) && u.status === 'active' && (
                    <ActionButton tone="danger" onClick={() => patch(u.email, { status: 'blocked' })}>Block</ActionButton>
                    )}
                    {manageable(u) && (u.status === 'blocked' || u.status === 'disapproved') && (
                    <ActionButton tone="success" onClick={() => patch(u.email, { status: 'active' })}>Activate</ActionButton>
                    )}
                    {manageable(u) && u.role === 'user' && (
                    <ActionButton onClick={() => setRightsFor(u)}>Rights</ActionButton>
                    )}
                    {(manageable(u) || isSelf(u)) && (
                    <ActionButton onClick={() => setEditing({ mode: 'edit', user: u })}>Edit</ActionButton>
                    )}
                </div>
                </Td>
            </tr>
            ))}
        </DataTable>

        <Modal
            open={!!editing} onClose={() => setEditing(null)} size="lg"
            title={editing?.mode === 'edit' ? 'Edit User' : 'Add User'} subtitle="Account details"
        >
            {editing && (
            <UserForm
                mode={editing.mode} user={editing.user} users={users} roles={roles}
                self={editing.user ? isSelf(editing.user) : false}
                onSave={saveUser} onCancel={() => setEditing(null)}
            />
            )}
        </Modal>

        <Modal
            open={!!rightsFor} onClose={() => setRightsFor(null)} size="xl"
            title={rightsFor ? `Assign Rights – ${rightsFor.firstName} ${rightsFor.lastName}` : ''}
            subtitle="Choose which modules and actions this user can access"
        >
            {rightsFor && (
            <RightsForm
                user={rightsFor}
                onSave={(perms) => { patch(rightsFor.email, { perms }); setRightsFor(null) }}
                onCancel={() => setRightsFor(null)}
            />
            )}
        </Modal>
        </>
    )
    }
