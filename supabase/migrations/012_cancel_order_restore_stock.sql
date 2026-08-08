create or replace function public.cancel_order_and_restore_stock(
    p_order_id uuid
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_order record;
    v_item record;
    v_stock_before integer;
    v_stock_after integer;
begin

    /*
     * Lock order
     */

    select
        id,
        order_number,
        order_status
    into v_order
    from public.orders
    where id = p_order_id
    for update;

    if not found then
        raise exception 'Order not found';
    end if;


    /*
     * Prevent invalid cancellation
     */

    if v_order.order_status = 'cancelled' then
        raise exception 'Order is already cancelled';
    end if;

    if v_order.order_status = 'delivered' then
        raise exception 'Delivered order cannot be cancelled';
    end if;


    /*
     * Restore stock for every item
     */

    for v_item in
        select
            product_id,
            quantity,
            product_name
        from public.order_items
        where order_id = p_order_id
    loop

        /*
         * Lock product
         */

        select stock_quantity
        into v_stock_before
        from public.products
        where id = v_item.product_id
        for update;

        if not found then
            raise exception
                'Product not found: %',
                v_item.product_name;
        end if;


        v_stock_after :=
            v_stock_before + v_item.quantity;


        /*
         * Restore product stock
         */

        update public.products
        set
            stock_quantity = v_stock_after,
            updated_at = now()
        where id = v_item.product_id;


        /*
         * Inventory history
         */

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
            v_item.product_id,
            v_item.quantity,
            v_stock_before,
            v_stock_after,
            'in',
            'Order ' ||
                v_order.order_number ||
                ' cancelled',
            auth.uid()
        );

    end loop;


    /*
     * Finally cancel order
     */

    update public.orders
    set
        order_status = 'cancelled',
        updated_at = now()
    where id = p_order_id;

end;
$$;