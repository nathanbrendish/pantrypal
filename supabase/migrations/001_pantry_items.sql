create table public.pantry_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ingredient_name text not null,
  created_at timestamptz not null default now()
);

create index pantry_items_user_id_idx on public.pantry_items (user_id);

alter table public.pantry_items enable row level security;

create policy "Users can view their own pantry items"
  on public.pantry_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own pantry items"
  on public.pantry_items for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own pantry items"
  on public.pantry_items for delete
  using (auth.uid() = user_id);
