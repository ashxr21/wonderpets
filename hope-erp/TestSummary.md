Next action items:

* Developer 2 and the DBA: create a Supabase database trigger that automatically inserts a blank profile row into the employee table when a new authentication user signs up.
* Note for the DBA: the employee table requires empno (a 5-character primary key), and the table has audit triggers, so the new trigger function must generate a valid unique empno and run with SECURITY DEFINER .
* Tester: retest with a fresh account and a regression pass on all tabs after the fix.

Test Summary

Cycle    Focus                   Test cases      Result
1        Stabilization and UI    TC-01, TC-02    Passed after fixes
2        Navigation and tabs     TC-03, TC-04    Passed after fixes
3        Supabase integration    TC-05           Passed after fix
Open     Access control for new users    BUG-001    Open