create or replace function public.adjust_product_stock(
    p_product_id uuid,
    p_quantity_change integer,
    p_movement_type text,
    p_reason text default null
)
returns public.inventory_logs
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_stock_before integer;
    v_stock_after integer;
    v_user_id uuid;
    v_log public.inventory_logs;
begin
    if p_quantity_change = 0 then
        raise exception 'Quantity change cannot be zero';
    end if;

    if p_movement_type not in ('in', 'out', 'adjustment') then
        raise exception 'Invalid movement type';
    end if;

    v_user_id := auth.uid();

    if v_user_id is null then
        raise exception 'Authentication required';
    end if;

    select stock_quantity
    into v_stock_before
    from public.products
    where id = p_product_id
    for update;

    if not found then
        raise exception 'Product not found';
    end if;

    v_stock_after :=
        v_stock_before + p_quantity_change;

    if v_stock_after < 0 then
        raise exception 'Insufficient stock';
    end if;

    update public.products
    set
        stock_quantity = v_stock_after,
        updated_at = now()
    where id = p_product_id;

    insert into public.inventory_logs (
        product_id,
        quantity_change,
        stock_before,
        stock_after,
        movement_type,
        reason,
        created_by
    )
    values (
        p_product_id,
        p_quantity_change,
        v_stock_before,
        v_stock_after,
        p_movement_type,
        nullif(trim(p_reason), ''),
        v_user_id
    )
    returning *
    into v_log;

    return v_log;
end;
$$;