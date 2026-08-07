create table if not exists public.brands (

    id uuid primary key default gen_random_uuid(),

    name text not null unique,

    slug text not null unique,

    logo_url text,

    description text,

    is_active boolean default true,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

alter table public.brands enable row level security;

create policy "Public can view active brands"
on public.brands
for select
using (true);

create policy "Authenticated users manage brands"
on public.brands
for all
to authenticated
using (true)
with check (true);