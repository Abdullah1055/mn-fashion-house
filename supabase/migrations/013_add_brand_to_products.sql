alter table public.products
add column if not exists brand_id uuid
references public.brands(id)
on delete set null;

create index if not exists products_brand_id_idx
on public.products(brand_id);