create table if not exists public.deletion_logs (
  id uuid primary key default gen_random_uuid(),
  module text not null check (module in (
    'Customers', 'Products', 'Employees', 'Jobs', 'Departments', 'Sales'
  )),
  record_id text not null,
  record_summary text not null,
  deleted_data jsonb not null check (jsonb_typeof(deleted_data) = 'object'),
  deleted_by text not null,
  deleted_at timestamptz not null default now(),
  created_by uuid not null default auth.uid(),
  pending boolean not null default false
);

alter table public.deletion_logs
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists deleted_at timestamptz not null default now(),
  add column if not exists created_by uuid default auth.uid(),
  add column if not exists pending boolean not null default false;

update public.deletion_logs
set id = gen_random_uuid()
where id is null;

alter table public.deletion_logs
  alter column id set default gen_random_uuid(),
  alter column id set not null;

create index if not exists deletion_logs_deleted_at_idx
  on public.deletion_logs (deleted_at desc);
create unique index if not exists deletion_logs_id_unique_idx
  on public.deletion_logs (id);

alter table public.deletion_logs enable row level security;

drop policy if exists "Read permitted deletion logs" on public.deletion_logs;
create policy "Read permitted deletion logs"
  on public.deletion_logs for select to authenticated
  using (
    created_by = (select auth.uid())
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.status = 'active'
        and (
          p.role in ('admin', 'superadmin')
        )
    )
  );

drop policy if exists "Insert own deletion logs" on public.deletion_logs;
create policy "Insert own deletion logs"
  on public.deletion_logs for insert to authenticated
  with check (
    created_by = (select auth.uid())
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.status = 'active'
        and p.email = deleted_by
      and pending
      and case module
        when 'Customers' then public.can_access_erp_record('customers', 'delete')
        when 'Products' then public.can_access_erp_record('products', 'delete')
          or public.can_access_erp_record('prices', 'delete')
        when 'Employees' then public.can_access_erp_record('employees', 'delete')
          or public.can_access_erp_record('job_history', 'delete')
        when 'Jobs' then public.can_access_erp_record('jobs', 'delete')
        when 'Departments' then public.can_access_erp_record('departments', 'delete')
        when 'Sales' then public.can_access_erp_record('sales', 'delete')
          or public.can_access_erp_record('sales_details', 'delete')
          or public.can_access_erp_record('payments', 'delete')
        else false
      end
    )
  );

drop policy if exists "Rollback own deletion logs" on public.deletion_logs;
create policy "Rollback own deletion logs"
  on public.deletion_logs for delete to authenticated
  using (
    created_by = (select auth.uid())
    and pending
    and exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.status = 'active'
    )
  );

drop policy if exists "Complete own deletion logs" on public.deletion_logs;
create policy "Complete own deletion logs"
  on public.deletion_logs for update to authenticated
  using (
    created_by = (select auth.uid())
    and pending
  )
  with check (
    created_by = (select auth.uid())
    and not pending
  );

grant select, insert, delete on public.deletion_logs to authenticated;
grant update (pending) on public.deletion_logs to authenticated;
