create table if not exists public.inventory_logs (

    id uuid primary key default gen_random_uuid(),

    product_id uuid not null
    references public.products(id)
    on delete cascade,

    quantity_change integer not null,

    stock_before integer not null,

    stock_after integer not null,

    movement_type text not null
    check (
        movement_type in ('in', 'out', 'adjustment')
    ),

    reason text,

    created_by uuid
    references auth.users(id)
    on delete set null,

    created_at timestamptz default now()
);

create index if not exists
idx_inventory_logs_product_id
on public.inventory_logs(product_id);

create index if not exists
idx_inventory_logs_created_at
on public.inventory_logs(created_at desc);

alter table public.inventory_logs
enable row level security;

create policy "Authenticated users can view inventory logs"
on public.inventory_logs
for select
to authenticated
using (true);

create policy "Authenticated users can create inventory logs"
on public.inventory_logs
for insert
to authenticated
with check (true);