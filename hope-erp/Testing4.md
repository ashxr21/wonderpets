Test Case 4: The Reports Tab Crash

Field       Detail

Test ID     TC-04

Type        Navigation / Runtime Error Testing

Steps       From Products, click Reports

Expected    Reports screen opens

Actual      Sudden total white screen (Runtime Component Breakage)

Severity    High (a crash on navigation)

Root cause  The data mapping tried to read from arrays that were empty or 
            undefined, which threw an error and unmounted the whole app

Fix         Safeguarded the data mapping arrays with optional chaining ( ?. ) so 
            empty data no longer crashes the render

Retest      Pass. Reports opens, and shows an empty state when no data exists
result

Cycle 2 outcome: all navigation paths run without layout breakdown or crashes (Regression Testing complete).

4. CURRENT UNRESOLVED DEFECT LOG

Field                 Detail

Defect ID             BUG-001

Title                 Sales Tab Restricted for Newly Created User Accounts

Priority / Severity   High / Major

Status                Open (assigned to Sprint 2)

Reported by           Tester

Environment           Chrome, localhost:5173, main

Description: established team profiles work across all pages (Role-Based Access Control behaves correctly for them). When a brand-new account is registered, the Sales tab stays hidden or fails to load data.

Steps to reproduce:
1. Register a new account.
2. Sign in with it.
3. Look at the sidebar, or open Sales.

Expected: the new user sees the Sales tab, or sees a clear "awaiting access" message.[cite: 21]
Actual: the Sales tab is hidden or loads no data.

Root cause analysis (hypothesis for developers): the new user's unique authentication ID does not yet exist in the employee or jobHistory tables, so the application's permission state blocks access. Also check: in the front-end permission logic, new accounts are created with an empty permission set, so sales.view is false until an administrator assigns it. Both causes may be involved.