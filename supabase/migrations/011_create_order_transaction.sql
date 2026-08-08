create or replace function public.create_order_with_stock(
    p_order_number text,
    p_customer_name text,
    p_customer_phone text,
    p_customer_email text,
    p_shipping_address text,
    p_subtotal numeric,
    p_discount_amount numeric,
    p_shipping_amount numeric,
    p_total_amount numeric,
    p_payment_method text,
    p_notes text,
    p_items jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
    v_order_id uuid;
    v_item jsonb;
    v_product record;
    v_quantity integer;
    v_stock_before integer;
    v_stock_after integer;
    v_unit_price numeric;
    v_purchase_cost numeric;
begin

    if jsonb_array_length(p_items) = 0 then
        raise exception 'Order must contain at least one product';
    end if;

    if p_subtotal < 0
       or p_discount_amount < 0
       or p_shipping_amount < 0
       or p_total_amount < 0 then
        raise exception 'Invalid order amount';
    end if;

    if p_discount_amount > p_subtotal then
        raise exception 'Discount cannot be greater than subtotal';
    end if;

    /*
     * Create order
     */

    insert into public.orders (
        order_number,
        customer_name,
        customer_phone,
        customer_email,
        shipping_address,
        subtotal,
        discount_amount,
        shipping_amount,
        total_amount,
        payment_method,
        payment_status,
        order_status,
        notes
    )
    values (
        p_order_number,
        p_customer_name,
        p_customer_phone,
        nullif(trim(p_customer_email), ''),
        nullif(trim(p_shipping_address), ''),
        p_subtotal,
        p_discount_amount,
        p_shipping_amount,
        p_total_amount,
        p_payment_method,
        'pending',
        'pending',
        nullif(trim(p_notes), '')
    )
    returning id
    into v_order_id;


    /*
     * Process each order item
     */

    for v_item in
        select * from jsonb_array_elements(p_items)
    loop

        v_quantity :=
            (v_item->>'quantity')::integer;

        if v_quantity <= 0 then
            raise exception 'Invalid product quantity';
        end if;


        /*
         * Lock product row
         */

        select
            id,
            name,
            sku,
            purchase_cost,
            regular_price,
            sale_price,
            stock_quantity
        into v_product
        from public.products
        where id = (v_item->>'product_id')::uuid
        for update;


        if not found then
            raise exception 'Product not found';
        end if;


        /*
         * Check stock
         */

        v_stock_before :=
            v_product.stock_quantity;

        if v_stock_before < v_quantity then
            raise exception
                'Insufficient stock for product: %',
                v_product.name;
        end if;


        v_stock_after :=
            v_stock_before - v_quantity;


        /*
         * Determine selling price
         */

        v_unit_price :=
            coalesce(
                v_product.sale_price,
                v_product.regular_price
            );

        v_purchase_cost :=
            v_product.purchase_cost;


        /*
         * Insert order item
         */

        insert into public.order_items (
            order_id,
            product_id,
            product_name,
            sku,
            quantity,
            unit_price,
            purchase_cost,
            subtotal
        )
        values (
            v_order_id,
            v_product.id,
            v_product.name,
            v_product.sku,
            v_quantity,
            v_unit_price,
            v_purchase_cost,
            v_unit_price * v_quantity
        );


        /*
         * Deduct stock
         */

        update public.products
        set
            stock_quantity = v_stock_after,
            updated_at = now()
        where id = v_product.id;


        /*
         * Create inventory history
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
            v_product.id,
            -v_quantity,
            v_stock_before,
            v_stock_after,
            'out',
            'Order ' || p_order_number,
            auth.uid()
        );

    end loop;


    return v_order_id;

exception
    when others then
        raise;
end;
$$;