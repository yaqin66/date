create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  author text not null default '',
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.quotes enable row level security;

create policy "quotes_select_public"
  on public.quotes
  for select
  to anon, authenticated
  using (true);

create policy "quotes_insert_public"
  on public.quotes
  for insert
  to anon, authenticated
  with check (true);

create policy "quotes_delete_public"
  on public.quotes
  for delete
  to anon, authenticated
  using (true);

alter publication supabase_realtime add table public.quotes;
