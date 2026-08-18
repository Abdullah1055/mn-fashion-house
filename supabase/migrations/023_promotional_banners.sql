create table if not exists public.promotional_banners (

    id uuid primary key default gen_random_uuid(),

    title text not null,

    description text,

    discount_text text,

    image_url text,

    storage_path text,

    button_text text not null default 'Shop Now',

    button_link text,

    start_at timestamptz,

    end_at timestamptz,

    is_active boolean not null default true,

    is_dismissible boolean not null default true,

    display_order integer not null default 0,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);


create index if not exists
idx_promotional_banners_active
on public.promotional_banners(is_active);


create index if not exists
idx_promotional_banners_dates
on public.promotional_banners(start_at, end_at);


create index if not exists
idx_promotional_banners_display_order
on public.promotional_banners(display_order);


alter table public.promotional_banners
enable row level security;


create policy "Authenticated users can view promotional banners"
on public.promotional_banners
for select
to authenticated
using (true);


create policy "Authenticated users can create promotional banners"
on public.promotional_banners
for insert
to authenticated
with check (true);


create policy "Authenticated users can update promotional banners"
on public.promotional_banners
for update
to authenticated
using (true)
with check (true);


create policy "Authenticated users can delete promotional banners"
on public.promotional_banners
for delete
to authenticated
using (true);