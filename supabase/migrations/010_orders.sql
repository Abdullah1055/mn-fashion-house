create table if not exists public.orders (

    id uuid primary key default gen_random_uuid(),

    order_number text not null unique,

    customer_name text not null,

    customer_phone text not null,

    customer_email text,

    shipping_address text,

    subtotal numeric(12,2) not null default 0,

    discount_amount numeric(12,2) not null default 0,

    shipping_amount numeric(12,2) not null default 0,

    total_amount numeric(12,2) not null default 0,

    payment_method text not null default 'cash_on_delivery'
    check (
        payment_method in (
            'cash_on_delivery',
            'online',
            'bank_transfer'
        )
    ),

    payment_status text not null default 'pending'
    check (
        payment_status in (
            'pending',
            'paid',
            'failed',
            'refunded'
        )
    ),

    order_status text not null default 'pending'
    check (
        order_status in (
            'pending',
            'confirmed',
            'processing',
            'shipped',
            'delivered',
            'cancelled'
        )
    ),

    notes text,

    created_at timestamptz default now(),

    updated_at timestamptz default now()
);


create table if not exists public.order_items (

    id uuid primary key default gen_random_uuid(),

    order_id uuid not null
    references public.orders(id)
    on delete cascade,

    product_id uuid not null
    references public.products(id)
    on delete restrict,

    product_name text not null,

    sku text,

    quantity integer not null
    check (quantity > 0),

    unit_price numeric(12,2) not null,

    purchase_cost numeric(12,2) not null default 0,

    subtotal numeric(12,2) not null,

    created_at timestamptz default now()
);


create index if not exists
idx_orders_order_number
on public.orders(order_number);


create index if not exists
idx_orders_created_at
on public.orders(created_at desc);


create index if not exists
idx_orders_status
on public.orders(order_status);


create index if not exists
idx_orders_payment_status
on public.orders(payment_status);


create index if not exists
idx_order_items_order_id
on public.order_items(order_id);


create index if not exists
idx_order_items_product_id
on public.order_items(product_id);


alter table public.orders
enable row level security;

alter table public.order_items
enable row level security;


create policy "Authenticated users can view orders"
on public.orders
for select
to authenticated
using (true);


create policy "Authenticated users can create orders"
on public.orders
for insert
to authenticated
with check (true);


create policy "Authenticated users can update orders"
on public.orders
for update
to authenticated
using (true)
with check (true);


create policy "Authenticated users can view order items"
on public.order_items
for select
to authenticated
using (true);


create policy "Authenticated users can create order items"
on public.order_items
for insert
to authenticated
with check (true);


create policy "Authenticated users can update order items"
on public.order_items
for update
to authenticated
using (true)
with check (true);