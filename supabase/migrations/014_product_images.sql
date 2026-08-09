create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  image_url text not null,

  storage_path text not null,

  alt_text text,

  is_primary boolean not null default false,

  sort_order integer not null default 0,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

create index if not exists product_images_product_id_idx
on public.product_images(product_id);

create index if not exists product_images_sort_order_idx
on public.product_images(product_id, sort_order);

alter table public.product_images
enable row level security;

drop policy if exists "Public can view product images"
on public.product_images;

create policy "Public can view product images"
on public.product_images
for select
using (true);

drop policy if exists "Authenticated users manage product images"
on public.product_images;

create policy "Authenticated users manage product images"
on public.product_images
for all
to authenticated
using (true)
with check (true);