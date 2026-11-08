create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  first_name text not null default '',
  last_name text not null default '',
  role text not null default 'user' check (role in ('user', 'admin', 'superadmin')),
  status text not null default 'pending' check (status in ('pending', 'active', 'blocked', 'disapproved')),
  permissions jsonb not null default '{}'::jsonb check (jsonb_typeof(permissions) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.erp_records (
  id uuid primary key default gen_random_uuid(),
  collection text not null check (collection in (
    'customers', 'products', 'prices', 'employees', 'jobs',
    'departments', 'job_history', 'sales', 'sales_details', 'payments'
  )),
  record_key text not null check (record_key <> ''),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection, record_key)
);

alter table public.erp_records
  drop constraint if exists erp_records_collection_check;
alter table public.erp_records
  add constraint erp_records_collection_check
  check (collection in (
    'customers', 'products', 'prices', 'employees', 'jobs',
    'departments', 'job_history', 'sales', 'sales_details', 'payments'
  ));

create or replace function public.create_erp_profile()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, email, first_name, last_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  )
  on conflict (id) do update
    set email = excluded.email,
        first_name = excluded.first_name,
        last_name = excluded.last_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_erp_profile on auth.users;
create trigger on_auth_user_created_erp_profile
  after insert on auth.users
  for each row execute function public.create_erp_profile();

create or replace function public.is_active_erp_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and status = 'active'
      and role in ('admin', 'superadmin')
  );
$$;

create or replace function public.can_access_erp_record(
  target_collection text,
  operation text
)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.status = 'active'
      and (
        p.role in ('admin', 'superadmin')
        or (
          operation = 'view'
          and case target_collection
            when 'customers' then p.permissions ->> 'customers.view' = 'true'
            when 'products' then p.permissions ->> 'products.view' = 'true'
            when 'prices' then p.permissions ->> 'products.view' = 'true'
            when 'employees' then p.permissions ->> 'hr.view' = 'true'
            when 'jobs' then p.permissions ->> 'hr.view' = 'true'
            when 'departments' then p.permissions ->> 'hr.view' = 'true'
            when 'job_history' then p.permissions ->> 'hr.view' = 'true'
              or p.permissions ->> 'hr.jhView' = 'true'
            when 'sales' then p.permissions ->> 'sales.view' = 'true'
            when 'sales_details' then p.permissions ->> 'sales.view' = 'true'
              or p.permissions ->> 'sales.detailView' = 'true'
            when 'payments' then p.permissions ->> 'sales.view' = 'true'
              or p.permissions ->> 'sales.detailView' = 'true'
            else false
          end
        )
        or (
          operation <> 'view'
          and p.permissions ->> (
            case target_collection
              when 'customers' then 'customers.' || operation
              when 'products' then 'products.' || operation
              when 'prices' then 'products.price' || upper(left(operation, 1)) || substr(operation, 2)
              when 'employees' then 'hr.emp' || upper(left(operation, 1)) || substr(operation, 2)
              when 'jobs' then 'hr.job' || upper(left(operation, 1)) || substr(operation, 2)
              when 'departments' then 'hr.dept' || upper(left(operation, 1)) || substr(operation, 2)
              when 'job_history' then 'hr.jh' || upper(left(operation, 1)) || substr(operation, 2)
              when 'sales' then 'sales.' || operation
              when 'sales_details' then 'sales.detail' || upper(left(operation, 1)) || substr(operation, 2)
              when 'payments' then 'sales.detail' || upper(left(operation, 1)) || substr(operation, 2)
              else ''
            end
          ) = 'true'
        )
      )
  );
$$;

create or replace function public.can_read_erp_collection(target_collection text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select public.can_access_erp_record(target_collection, 'view');
$$;

create or replace function public.enforce_erp_record_write_permission()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'INSERT' then
    if (select auth.uid()) is not null
        and not public.can_access_erp_record(new.collection, 'add') then
      raise exception 'Missing permission to add this record.';
    end if;
    new.created_by = (select auth.uid());
    new.created_at = now();
    new.updated_at = now();
    return new;
  end if;

  if new.id is distinct from old.id
      or new.collection is distinct from old.collection
      or new.record_key is distinct from old.record_key
      or new.created_by is distinct from old.created_by
      or new.created_at is distinct from old.created_at then
    raise exception 'Record identifiers and creation metadata cannot be changed.';
  end if;

  if old.payload -> 'isDeleted' is distinct from new.payload -> 'isDeleted' then
    if (old.payload - array['isDeleted', 'stamp'])
        is distinct from (new.payload - array['isDeleted', 'stamp']) then
      raise exception 'Delete and restore operations cannot change record fields.';
    end if;
    if not public.can_access_erp_record(old.collection, 'delete') then
      raise exception 'Missing permission to delete or restore this record.';
    end if;
  elsif not public.can_access_erp_record(old.collection, 'edit') then
    raise exception 'Missing permission to edit this record.';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists enforce_erp_record_write_permission on public.erp_records;
create trigger enforce_erp_record_write_permission
  before insert or update on public.erp_records
  for each row execute function public.enforce_erp_record_write_permission();

create or replace function public.manage_erp_profile(
  target_user_id uuid,
  new_first_name text,
  new_last_name text,
  new_role text,
  new_status text,
  new_permissions jsonb
)
returns public.profiles
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor public.profiles;
  target public.profiles;
begin
  select * into actor
  from public.profiles
  where id = (select auth.uid()) and status = 'active';

  if not found or actor.role not in ('admin', 'superadmin') then
    raise exception 'Only active administrators can manage profiles.';
  end if;

  select * into target
  from public.profiles
  where id = target_user_id
  for update;

  if not found then
    raise exception 'Profile not found.';
  end if;

  if new_role not in ('user', 'admin', 'superadmin')
      or new_status not in ('pending', 'active', 'blocked', 'disapproved')
      or jsonb_typeof(new_permissions) <> 'object' then
    raise exception 'Invalid profile values.';
  end if;

  if actor.id = target.id then
    if new_role <> target.role
        or new_status <> target.status
        or new_permissions <> target.permissions then
      raise exception 'You cannot change your own role, status, or permissions.';
    end if;
  elsif actor.role = 'admin' and target.role <> 'user' then
    raise exception 'Administrators may only manage regular users.';
  elsif actor.role = 'admin' and new_role <> 'user' then
    raise exception 'Administrators cannot grant elevated roles.';
  end if;

  update public.profiles
  set first_name = coalesce(new_first_name, ''),
      last_name = coalesce(new_last_name, ''),
      role = new_role,
      status = new_status,
      permissions = new_permissions,
      updated_at = now()
  where id = target.id
  returning * into target;

  return target;
end;
$$;

alter table public.profiles enable row level security;
alter table public.erp_records enable row level security;

drop policy if exists "Profiles can be read by self or admins" on public.profiles;
create policy "Profiles can be read by self or admins"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_active_erp_admin());

drop policy if exists "Read permitted ERP records" on public.erp_records;
create policy "Read permitted ERP records"
  on public.erp_records for select to authenticated
  using (public.can_read_erp_collection(collection));

drop policy if exists "Insert permitted ERP records" on public.erp_records;
create policy "Insert permitted ERP records"
  on public.erp_records for insert to authenticated
  with check (public.can_access_erp_record(collection, 'add'));

drop policy if exists "Update permitted ERP records" on public.erp_records;
create policy "Update permitted ERP records"
  on public.erp_records for update to authenticated
  using (
    public.can_access_erp_record(collection, 'edit')
    or public.can_access_erp_record(collection, 'delete')
  )
  with check (
    public.can_access_erp_record(collection, 'edit')
    or public.can_access_erp_record(collection, 'delete')
  );

revoke all on function public.create_erp_profile() from public, anon, authenticated;
revoke all on function public.is_active_erp_admin() from public, anon;
revoke all on function public.can_access_erp_record(text, text) from public, anon;
revoke all on function public.can_read_erp_collection(text) from public, anon;
revoke all on function public.enforce_erp_record_write_permission() from public, anon, authenticated;
revoke all on function public.manage_erp_profile(uuid, text, text, text, text, jsonb) from public, anon;
grant execute on function public.is_active_erp_admin() to authenticated;
grant execute on function public.can_access_erp_record(text, text) to authenticated;
grant execute on function public.can_read_erp_collection(text) to authenticated;
grant execute on function public.manage_erp_profile(uuid, text, text, text, text, jsonb) to authenticated;
grant select on public.profiles to authenticated;
grant select, insert, update on public.erp_records to authenticated;
