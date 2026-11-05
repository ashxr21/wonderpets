    import { useState } from 'react'
    import { useAuth } from '../../context/AuthContext'
    import { useLocalStorage } from '../../hooks/useLocalStorage'
    import {
    KEYS, DEFAULT_EMPLOYEES, DEFAULT_JOBS, DEFAULT_DEPTS, DEFAULT_JOB_HISTORY,
    } from '../../data/defaults'
    import RecordManager from '../ui/RecordManager'
    import ActionButton from '../ui/ActionButton'
    import Modal from '../ui/Modal'
    import Tabs from '../ui/Tabs'

    const GENDERS = [
    { value: 'M', label: 'Male' },
    { value: 'F', label: 'Female' },
    { value: 'O', label: 'Other' },
    ]

    const employeeFields = [
    { name: 'empNo', label: 'Employee No.', short: 'Emp No', placeholder: 'E-001', readOnlyOnEdit: true, half: true },
    { name: 'gender', label: 'Gender', type: 'select', options: GENDERS, half: true },
    { name: 'firstName', label: 'First Name', half: true },
    { name: 'lastName', label: 'Last Name', half: true },
    { name: 'birthDate', label: 'Birth Date', type: 'date', half: true },
    { name: 'hireDate', label: 'Hire Date', type: 'date', half: true },
    { name: 'sepDate', label: 'Separation Date (optional)', short: 'Separated', type: 'date', required: false },
    ]

    const validateEmployee = (v) => {
    if (v.hireDate < v.birthDate) return 'Hire date cannot be before birth date.'
    if (v.sepDate && v.sepDate < v.hireDate) return 'Separation date cannot be before hire date.'
    return ''
    }

    const jobFields = [
    { name: 'jobCode', label: 'Job Code', placeholder: 'J-001', readOnlyOnEdit: true },
    { name: 'jobDesc', label: 'Job Description', short: 'Description' },
    ]

    const deptFields = [
    { name: 'deptCode', label: 'Department Code', short: 'Dept Code', placeholder: 'D-001', readOnlyOnEdit: true },
    { name: 'deptName', label: 'Department Name', short: 'Name' },
    ]

    export default function HR() {
    const { can } = useAuth()
    const [tab, setTab] = useState('employees')
    const [employees, setEmployees] = useLocalStorage(KEYS.employees, DEFAULT_EMPLOYEES)
    const [jobs, setJobs] = useLocalStorage(KEYS.jobs, DEFAULT_JOBS)
    const [depts, setDepts] = useLocalStorage(KEYS.depts, DEFAULT_DEPTS)
    const [history, setHistory] = useLocalStorage(KEYS.jobHistory, DEFAULT_JOB_HISTORY)
    const [histFor, setHistFor] = useState(null) // employee whose job history is open

    const jobOptions = jobs.filter((j) => !j.isDeleted).map((j) => ({ value: j.jobCode, label: `${j.jobCode} – ${j.jobDesc}` }))
    const deptOptions = depts.filter((d) => !d.isDeleted).map((d) => ({ value: d.deptCode, label: `${d.deptCode} – ${d.deptName}` }))

    const historyFields = [
        { name: 'empNo', label: 'Employee No.', hideInTable: true },
        { name: 'effDate', label: 'Effective Date', short: 'Effective', type: 'date', readOnlyOnEdit: true, half: true },
        { name: 'salary', label: 'Salary', type: 'number', money: true, step: '0.01', min: 0, half: true },
        { name: 'jobCode', label: 'Job', type: 'select', options: jobOptions, half: true },
        { name: 'deptCode', label: 'Department', type: 'select', options: deptOptions, half: true },
    ]

    return (
        <>
        <div className="mb-4">
            <Tabs
            value={tab} onChange={setTab}
            options={[
                { value: 'employees', label: 'Employees' },
                { value: 'jobs', label: 'Jobs' },
                { value: 'depts', label: 'Departments' },
            ]}
            />
        </div>

        {tab === 'employees' && (
            <RecordManager
            title="Employees" singular="Employee"
            records={employees} setRecords={setEmployees}
            fields={employeeFields} keyOf={(r) => r.empNo}
            perms={{ add: 'hr.empAdd', edit: 'hr.empEdit', delete: 'hr.empDelete' }}
            validate={validateEmployee}
            extraActions={(r) =>
                can('hr.jhView') && <ActionButton onClick={() => setHistFor(r)}>Job History</ActionButton>
            }
            />
        )}

        {tab === 'jobs' && (
            <RecordManager
            title="Jobs" singular="Job"
            records={jobs} setRecords={setJobs}
            fields={jobFields} keyOf={(r) => r.jobCode}
            perms={{ add: 'hr.jobAdd', edit: 'hr.jobEdit', delete: 'hr.jobDelete' }}
            />
        )}

        {tab === 'depts' && (
            <RecordManager
            title="Departments" singular="Department"
            records={depts} setRecords={setDepts}
            fields={deptFields} keyOf={(r) => r.deptCode}
            perms={{ add: 'hr.deptAdd', edit: 'hr.deptEdit', delete: 'hr.deptDelete' }}
            />
        )}

        <Modal
            open={!!histFor} onClose={() => setHistFor(null)} size="xl"
            title={histFor ? `Job History – ${histFor.firstName} ${histFor.lastName}` : ''}
            subtitle={histFor ? `Employee ${histFor.empNo}` : ''}
        >
            {histFor && (
            <RecordManager
                singular="Job History"
                records={history} setRecords={setHistory}
                fields={historyFields} keyOf={(r) => `${r.empNo}|${r.effDate}`}
                perms={{ add: 'hr.jhAdd', edit: 'hr.jhEdit', delete: 'hr.jhDelete' }}
                scope={(r) => r.empNo === histFor.empNo}
                fixed={{ empNo: histFor.empNo }}
                sort={(a, b) => b.effDate.localeCompare(a.effDate)}
            />
            )}
        </Modal>
        </>
    )
    }
