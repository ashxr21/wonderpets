# Hope ERP

## Connect to Supabase

The Vite app in this folder uses Supabase Auth for accounts and the `erp_records`
table for customers, products/prices, HR, sales, and sales details. The React app
uses the Supabase publishable key; authorization is enforced by row-level security
(RLS) in Supabase.

1. In the Supabase dashboard, open **SQL Editor** and run [`supabase/schema.sql`](./supabase/schema.sql).
2. In **Authentication → URL Configuration**, set the Site URL and add your local
   and deployed app URLs to the redirect allow list (for local development,
   `http://localhost:5173`).
3. This folder's ignored `.env.local` should contain the project URL and publishable
   key:

   ```dotenv
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   ```

   The variable names are already present in this project's `.env.local`. Do not
   put a `service_role` or secret key in a `VITE_` variable or in browser code.
4. From this folder, run `npm install` and `npm run dev`.
5. Register an account and verify its email. New accounts are pending until an
   administrator approves them. To bootstrap the first administrator, replace
   the email below with the verified account's email and run this once in SQL
   Editor:

   ```sql
   update public.profiles
   set role = 'superadmin', status = 'active'
   where email = 'you@example.com';
   ```

   Sign in again after promotion. Administrators can approve users, set roles,
   and assign permissions in **User Management**. Users must register themselves;
   the browser app intentionally does not create Auth accounts with elevated
   privileges.

Email/password registration, email verification, password reset, and Google sign-in
are wired to Supabase Auth. To enable Google sign-in, configure the Google provider
in **Authentication → Providers** and add the callback URL shown by Supabase to
your Google OAuth client.

## ERP data and access

ERP records are shared in the Supabase project and stored as JSON payloads in
`public.erp_records`, keyed by collection and the app's existing record key. RLS
checks the user's active profile and permissions for every read and write.
Report permissions do not independently grant access to source records; assign
view access to the relevant modules as well.

To display data already in the legacy tables (`customer`, `department`,
`employee`, `job`, `jobhistory`, `payment`, `pricehist`, `product`, and `sales`):

1. Run the updated [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase
   SQL Editor. It is safe to rerun and adds the payments collection.
2. Run [`supabase/import-existing-data.sql`](./supabase/import-existing-data.sql)
   in the same project. It copies your legacy rows into `erp_records`, translating
   the existing snake-case column names to the field names Hope ERP uses.
3. Refresh the app or sign out and back in. Customers, products/prices, HR, sales,
   and sale payments should then appear in their modules.

The import saves a backup of any existing Hope ERP copies in
`public.erp_records_import_backup` before replacing those copies. It does not
change or delete rows in your original tables. The `sales` table has no sale-line
table in the schema you shared, so the import cannot populate sale line items;
payments are displayed separately from sale details.

This is a one-time import, not ongoing synchronization. After importing, Hope ERP
reads and writes `erp_records`; edits made later in the app do not update the
original normalized tables. A live two-way connection would need a separate
mapping and sync design.

The dashboard home counts active customers, products, and sales from the loaded
ERP records. Its month-to-date revenue card sums non-deleted payments dated in
the current month. Use **Refresh data** on the dashboard to reload the cloud
records.
