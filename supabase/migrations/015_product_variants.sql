create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),

  product_id uuid not null
    references public.products(id)
    on delete cascade,

  sku text unique,

  size text,

  color text,

  purchase_cost numeric(10,2),

  regular_price numeric(10,2),

  sale_price numeric(10,2),

  stock_quantity integer not null default 0,

  low_stock_threshold integer not null default 5,

  is_active boolean not null default true,

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

create index if not exists product_variants_product_id_idx
on public.product_variants(product_id);

create index if not exists product_variants_size_idx
on public.product_variants(size);

create index if not exists product_variants_color_idx
on public.product_variants(color);

alter table public.product_variants
enable row level security;

drop policy if exists "Public can view active product variants"
on public.product_variants;

create policy "Public can view active product variants"
on public.product_variants
for select
using (is_active = true);

drop policy if exists "Authenticated users manage product variants"
on public.product_variants;

create policy "Authenticated users manage product variants"
on public.product_variants
for all
to authenticated
using (true)
with check (true);