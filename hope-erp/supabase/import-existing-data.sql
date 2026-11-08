begin;

create table if not exists public.erp_records_import_backup (
  backup_id bigint generated always as identity primary key,
  collection text not null,
  record_key text not null,
  payload jsonb not null,
  created_by uuid,
  created_at timestamptz,
  updated_at timestamptz,
  backed_up_at timestamptz not null default now()
);

alter table public.erp_records_import_backup enable row level security;
revoke all on public.erp_records_import_backup from public, anon, authenticated;

insert into public.erp_records_import_backup (
  collection, record_key, payload, created_by, created_at, updated_at
)
select collection, record_key, payload, created_by, created_at, updated_at
from public.erp_records
where collection in (
  'customers', 'products', 'prices', 'employees', 'jobs',
  'departments', 'job_history', 'sales', 'sales_details', 'payments'
);

delete from public.erp_records
where collection in (
  'customers', 'products', 'prices', 'employees', 'jobs',
  'departments', 'job_history', 'sales', 'sales_details', 'payments'
);

insert into public.erp_records (collection, record_key, payload)
select 'customers', r ->> 'custno',
  jsonb_build_object(
    'custNo', r ->> 'custno',
    'custName', r ->> 'custname',
    'address', r ->> 'address',
    'payterms', r ->> 'payterm',
    'isDeleted', coalesce(r -> 'is_deleted', 'false'::jsonb),
    'stamp', coalesce(r -> 'stamp', '""'::jsonb)
  )
from (select to_jsonb(t) as r from public.customer as t) as source
where r ->> 'custno' is not null;

insert into public.erp_records (collection, record_key, payload)
select 'departments', r ->> 'deptcode',
  jsonb_build_object(
    'deptCode', r ->> 'deptcode',
    'deptName', r ->> 'deptname',
    'isDeleted', coalesce(r -> 'is_deleted', 'false'::jsonb),
    'stamp', coalesce(r -> 'stamp', '""'::jsonb)
  )
from (select to_jsonb(t) as r from public.department as t) as source
where r ->> 'deptcode' is not null;

insert into public.erp_records (collection, record_key, payload)
select 'employees', r ->> 'empno',
  jsonb_build_object(
    'empNo', r ->> 'empno',
    'gender', r ->> 'gender',
    'firstName', r ->> 'firstname',
    'lastName', r ->> 'lastname',
    'birthDate', r ->> 'birthdate',
    'hireDate', r ->> 'hiredate',
    'sepDate', coalesce(r ->> 'sepdate', ''),
    'isDeleted', coalesce(r -> 'is_deleted', 'false'::jsonb),
    'stamp', coalesce(r -> 'stamp', '""'::jsonb)
  )
from (select to_jsonb(t) as r from public.employee as t) as source
where r ->> 'empno' is not null;

insert into public.erp_records (collection, record_key, payload)
select 'jobs', r ->> 'jobcode',
  jsonb_build_object(
    'jobCode', r ->> 'jobcode',
    'jobDesc', coalesce(r -> 'jobdesc', r -> 'job_desc', r -> 'description', '""'::jsonb),
    'isDeleted', coalesce(r -> 'is_deleted', 'false'::jsonb),
    'stamp', coalesce(r -> 'stamp', '""'::jsonb)
  )
from (select to_jsonb(t) as r from public.job as t) as source
where r ->> 'jobcode' is not null;

insert into public.erp_records (collection, record_key, payload)
select 'job_history',
  (r ->> 'empno') || '|' || (r ->> 'jobcode') || '|' || (r ->> 'effdate'),
  jsonb_build_object(
    'empNo', r ->> 'empno',
    'jobCode', r ->> 'jobcode',
    'effDate', r ->> 'effdate',
    'salary', r -> 'salary',
    'deptCode', r ->> 'deptcode',
    'isDeleted', coalesce(r -> 'is_deleted', 'false'::jsonb),
    'stamp', coalesce(r -> 'stamp', '""'::jsonb)
  )
from (select to_jsonb(t) as r from public.jobhistory as t) as source
where r ->> 'empno' is not null
  and r ->> 'jobcode' is not null
  and r ->> 'effdate' is not null;

insert into public.erp_records (collection, record_key, payload)
select 'payments', r ->> 'orno',
  jsonb_build_object(
    'orNo', r ->> 'orno',
    'payDate', r ->> 'paydate',
    'amount', r -> 'amount',
    'transNo', r ->> 'transno',
    'isDeleted', coalesce(r -> 'is_deleted', 'false'::jsonb),
    'stamp', coalesce(r -> 'stamp', '""'::jsonb)
  )
from (select to_jsonb(t) as r from public.payment as t) as source
where r ->> 'orno' is not null;

insert into public.erp_records (collection, record_key, payload)
select 'prices', (r ->> 'prodcode') || '|' || (r ->> 'effdate'),
  jsonb_build_object(
    'prodCode', r ->> 'prodcode',
    'effDate', r ->> 'effdate',
    'unitPrice', r -> 'unitprice',
    'isDeleted', coalesce(r -> 'is_deleted', 'false'::jsonb),
    'stamp', coalesce(r -> 'stamp', '""'::jsonb)
  )
from (select to_jsonb(t) as r from public.pricehist as t) as source
where r ->> 'prodcode' is not null
  and r ->> 'effdate' is not null;

insert into public.erp_records (collection, record_key, payload)
select 'products', r ->> 'prodcode',
  jsonb_build_object(
    'prodCode', r ->> 'prodcode',
    'description', r ->> 'description',
    'unit', r ->> 'unit',
    'isDeleted', coalesce(r -> 'is_deleted', 'false'::jsonb),
    'stamp', coalesce(r -> 'stamp', '""'::jsonb)
  )
from (select to_jsonb(t) as r from public.product as t) as source
where r ->> 'prodcode' is not null;

insert into public.erp_records (collection, record_key, payload)
select 'sales', r ->> 'transno',
  jsonb_build_object(
    'transNo', r ->> 'transno',
    'salesDate', r ->> 'salesdate',
    'custNo', r ->> 'custno',
    'empNo', r ->> 'empno',
    'isDeleted', coalesce(r -> 'is_deleted', 'false'::jsonb),
    'stamp', coalesce(r -> 'stamp', '""'::jsonb)
  )
from (select to_jsonb(t) as r from public.sales as t) as source
where r ->> 'transno' is not null;

commit;
