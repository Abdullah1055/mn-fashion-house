create table if not exists public.product_images (

    id uuid primary key default gen_random_uuid(),

    product_id uuid not null
    references public.products(id)
    on delete cascade,

    image_url text not null,

    alt_text text,

    is_primary boolean default false,

    sort_order integer default 0,

    created_at timestamptz default now()

);

create index if not exists
idx_product_images_product
on public.product_images(product_id);