drop policy if exists "Delete permitted ERP records" on public.erp_records;

create policy "Delete permitted ERP records"
  on public.erp_records for delete to authenticated
  using (public.can_access_erp_record(collection, 'delete'));

grant delete on public.erp_records to authenticated;
