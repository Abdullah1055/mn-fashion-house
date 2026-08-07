create table if not exists public.products (

    id uuid primary key default gen_random_uuid(),

    category_id uuid not null
    references public.categories(id)
    on delete restrict,

    name text not null,

    slug text unique not null,

    short_description text,

    description text,

    sku text unique,

    purchase_cost numeric(10,2) not null default 0,

    regular_price numeric(10,2) not null,

    sale_price numeric(10,2),

    stock_quantity integer not null default 0,

    low_stock_threshold integer not null default 10,

    is_featured boolean default false,

    is_active boolean default true,

    seo_title text,

    seo_description text,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);