3. TEST CYCLE 3: SUPABASE INTEGRATION & DATA RECOVERY
Objective: verify authentication and that live database records display in the UI (Integration Testing, Database Sync).

Test Case 5: The Invisible Data / RLS Lock

Field       Detail

Test ID     TC-05

Type        Integration / Data Retrieval

Steps       Sign in (and sign up), open a screen that reads a Supabase table or view

Expected    Rows from the database appear in the table

Actual      Authentication (Authentication Flow) worked, but table data refused to 
            display. The UI showed an empty list

Severity    High

Root cause  Row-Level Security (RLS) was blocking reads. Tables had no policy 
            allowing the public key to SELECT , so Supabase silently returned zero rows

Diagnosis   The team inspected the browser's Network tab (successful request with 
            an empty result) and the database security settings

Fix         In Supabase, enabled RLS and added public read policies ( FOR SELECT ) 
            on the tables, and set security_invoker = true on the _active views so they obey those rules

Retest      Pass. Records load in the UI
result