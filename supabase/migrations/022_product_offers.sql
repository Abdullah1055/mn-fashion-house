create table if not exists public.product_offers (

    id uuid primary key default gen_random_uuid(),

    product_id uuid not null
        references public.products(id)
        on delete cascade,

    discount_percentage numeric(5,2) not null
        check (
            discount_percentage > 0
            and discount_percentage < 100
        ),

    is_active boolean not null default true,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint product_offers_product_unique
        unique (product_id)
);


create index if not exists
idx_product_offers_product_id
on public.product_offers(product_id);


create index if not exists
idx_product_offers_active
on public.product_offers(is_active);


alter table public.product_offers
enable row level security;


create policy "Authenticated users can view product offers"
on public.product_offers
for select
to authenticated
using (true);


create policy "Authenticated users can create product offers"
on public.product_offers
for insert
to authenticated
with check (true);


create policy "Authenticated users can update product offers"
on public.product_offers
for update
to authenticated
using (true)
with check (true);


create policy "Authenticated users can delete product offers"
on public.product_offers
for delete
to authenticated
using (true);