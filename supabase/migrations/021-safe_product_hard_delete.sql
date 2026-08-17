/*
  Safe Product Hard Delete

  Product can be permanently deleted while
  historical order items remain intact.

  Historical order item keeps:
  - product_name
  - sku
  - quantity
  - unit_price
  - purchase_cost
  - subtotal

  Only the old product reference becomes NULL.
*/


/* =========================================================
   1. Allow order_items.product_id to become NULL
========================================================= */

alter table public.order_items
alter column product_id
drop not null;


/* =========================================================
   2. Replace existing product foreign key
========================================================= */

do $$
declare
    constraint_name text;
begin

    select tc.constraint_name
    into constraint_name
    from information_schema.table_constraints tc
    join information_schema.key_column_usage kcu
      on tc.constraint_name = kcu.constraint_name
     and tc.table_schema = kcu.table_schema
    where tc.table_schema = 'public'
      and tc.table_name = 'order_items'
      and tc.constraint_type = 'FOREIGN KEY'
      and kcu.column_name = 'product_id'
    limit 1;

    if constraint_name is not null then
        execute format(
            'alter table public.order_items drop constraint %I',
            constraint_name
        );
    end if;

end
$$;


/* =========================================================
   3. Add safe foreign key
========================================================= */

alter table public.order_items
add constraint order_items_product_id_fkey
foreign key (product_id)
references public.products(id)
on delete set null;