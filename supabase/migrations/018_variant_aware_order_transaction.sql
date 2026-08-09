-- =====================================================
-- MN Fashion House
-- Migration: 018_variant_aware_order_transaction.sql
--
-- Purpose:
-- Upgrade order transaction to support product variants.
--
-- Supports:
-- 1. Normal product orders
-- 2. Variant orders
-- 3. Variant stock deduction
-- 4. Product stock deduction
-- 5. Variant price
-- 6. Product fallback price
-- 7. Order item variant information
-- 8. Inventory history
-- =====================================================


CREATE OR REPLACE FUNCTION public.create_order_with_stock(
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
RETURNS uuid
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
    v_order_id uuid;
    v_item jsonb;

    v_product record;
    v_variant record;

    v_product_id uuid;
    v_variant_id uuid;

    v_quantity integer;

    v_stock_before integer;
    v_stock_after integer;

    v_unit_price numeric;
    v_purchase_cost numeric;

    v_item_subtotal numeric;

    v_calculated_subtotal numeric := 0;
BEGIN

    -- =================================================
    -- Basic validation
    -- =================================================

    IF jsonb_array_length(p_items) = 0 THEN
        RAISE EXCEPTION
            'Order must contain at least one product';
    END IF;


    IF p_subtotal < 0
       OR p_discount_amount < 0
       OR p_shipping_amount < 0
       OR p_total_amount < 0 THEN

        RAISE EXCEPTION
            'Invalid order amount';
    END IF;


    IF p_discount_amount > p_subtotal THEN
        RAISE EXCEPTION
            'Discount cannot be greater than subtotal';
    END IF;


    -- =================================================
    -- Process items first
    --
    -- This calculates the real subtotal from database
    -- prices and validates stock before creating order.
    -- =================================================

    FOR v_item IN
        SELECT *
        FROM jsonb_array_elements(p_items)
    LOOP

        v_product_id :=
            (v_item->>'product_id')::uuid;

        v_variant_id := NULL;

        IF NULLIF(
            trim(coalesce(v_item->>'variant_id', '')),
            ''
        ) IS NOT NULL THEN

            v_variant_id :=
                (v_item->>'variant_id')::uuid;

        END IF;


        v_quantity :=
            (v_item->>'quantity')::integer;


        IF v_quantity IS NULL
           OR v_quantity <= 0 THEN

            RAISE EXCEPTION
                'Invalid product quantity';
        END IF;


        -- =============================================
        -- Variant order
        -- =============================================

        IF v_variant_id IS NOT NULL THEN

            SELECT
                pv.id,
                pv.product_id,
                pv.sku,
                pv.size,
                pv.color,
                pv.purchase_cost,
                pv.regular_price,
                pv.sale_price,
                pv.stock_quantity,
                pv.is_active
            INTO v_variant
            FROM public.product_variants pv
            WHERE pv.id = v_variant_id
            FOR UPDATE;


            IF NOT FOUND THEN
                RAISE EXCEPTION
                    'Product variant not found';
            END IF;


            IF v_variant.product_id <> v_product_id THEN
                RAISE EXCEPTION
                    'Selected variant does not belong to the selected product';
            END IF;


            IF NOT v_variant.is_active THEN
                RAISE EXCEPTION
                    'Selected product variant is inactive';
            END IF;


            v_stock_before :=
                v_variant.stock_quantity;


            IF v_stock_before < v_quantity THEN
                RAISE EXCEPTION
                    'Insufficient stock for selected product variant';
            END IF;


            v_stock_after :=
                v_stock_before - v_quantity;


            -- Variant price first, product price fallback
            SELECT
                p.id,
                p.name,
                p.sku,
                p.purchase_cost,
                p.regular_price,
                p.sale_price
            INTO v_product
            FROM public.products p
            WHERE p.id = v_product_id
            FOR UPDATE;


            IF NOT FOUND THEN
                RAISE EXCEPTION
                    'Product not found';
            END IF;


            v_unit_price :=
                COALESCE(
                    v_variant.sale_price,
                    v_variant.regular_price,
                    v_product.sale_price,
                    v_product.regular_price,
                    0
                );


            v_purchase_cost :=
                COALESCE(
                    v_variant.purchase_cost,
                    v_product.purchase_cost,
                    0
                );


        -- =============================================
        -- Normal product order
        -- =============================================

        ELSE

            SELECT
                p.id,
                p.name,
                p.sku,
                p.purchase_cost,
                p.regular_price,
                p.sale_price,
                p.stock_quantity
            INTO v_product
            FROM public.products p
            WHERE p.id = v_product_id
            FOR UPDATE;


            IF NOT FOUND THEN
                RAISE EXCEPTION
                    'Product not found';
            END IF;


            v_stock_before :=
                v_product.stock_quantity;


            IF v_stock_before < v_quantity THEN
                RAISE EXCEPTION
                    'Insufficient stock for product: %',
                    v_product.name;
            END IF;


            v_stock_after :=
                v_stock_before - v_quantity;


            v_unit_price :=
                COALESCE(
                    v_product.sale_price,
                    v_product.regular_price,
                    0
                );


            v_purchase_cost :=
                COALESCE(
                    v_product.purchase_cost,
                    0
                );

        END IF;


        -- =============================================
        -- Calculate item subtotal
        -- =============================================

        v_item_subtotal :=
            v_unit_price * v_quantity;


        v_calculated_subtotal :=
            v_calculated_subtotal +
            v_item_subtotal;


        -- =============================================
        -- Store calculated values temporarily in the
        -- JSON item for the second processing pass.
        -- =============================================

    END LOOP;


    -- =================================================
    -- Verify subtotal supplied by application
    -- =================================================

    IF ABS(
        v_calculated_subtotal - p_subtotal
    ) > 0.01 THEN

        RAISE EXCEPTION
            'Order subtotal does not match product prices';
    END IF;


    -- =================================================
    -- Create order
    -- =================================================

    INSERT INTO public.orders (
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
    VALUES (
        p_order_number,
        p_customer_name,
        p_customer_phone,
        NULLIF(TRIM(p_customer_email), ''),
        NULLIF(TRIM(p_shipping_address), ''),
        p_subtotal,
        p_discount_amount,
        p_shipping_amount,
        p_total_amount,
        p_payment_method,
        'pending',
        'pending',
        NULLIF(TRIM(p_notes), '')
    )
    RETURNING id
    INTO v_order_id;


    -- =================================================
    -- Second pass:
    -- Insert order items + deduct stock
    -- =================================================

    FOR v_item IN
        SELECT *
        FROM jsonb_array_elements(p_items)
    LOOP

        v_product_id :=
            (v_item->>'product_id')::uuid;

        v_variant_id := NULL;

        IF NULLIF(
            trim(coalesce(v_item->>'variant_id', '')),
            ''
        ) IS NOT NULL THEN

            v_variant_id :=
                (v_item->>'variant_id')::uuid;

        END IF;


        v_quantity :=
            (v_item->>'quantity')::integer;


        -- =============================================
        -- Variant item
        -- =============================================

        IF v_variant_id IS NOT NULL THEN

            SELECT
                pv.id,
                pv.product_id,
                pv.sku,
                pv.size,
                pv.color,
                pv.purchase_cost,
                pv.regular_price,
                pv.sale_price,
                pv.stock_quantity,
                pv.is_active
            INTO v_variant
            FROM public.product_variants pv
            WHERE pv.id = v_variant_id
            FOR UPDATE;


            SELECT
                p.id,
                p.name,
                p.sku,
                p.purchase_cost,
                p.regular_price,
                p.sale_price
            INTO v_product
            FROM public.products p
            WHERE p.id = v_product_id
            FOR UPDATE;


            v_unit_price :=
                COALESCE(
                    v_variant.sale_price,
                    v_variant.regular_price,
                    v_product.sale_price,
                    v_product.regular_price,
                    0
                );


            v_purchase_cost :=
                COALESCE(
                    v_variant.purchase_cost,
                    v_product.purchase_cost,
                    0
                );


            INSERT INTO public.order_items (
                order_id,
                product_id,
                variant_id,
                product_name,
                sku,
                color,
                size,
                quantity,
                unit_price,
                purchase_cost,
                line_total,
                subtotal
            )
            VALUES (
                v_order_id,
                v_product.id,
                v_variant.id,
                v_product.name,
                v_variant.sku,
                v_variant.color,
                v_variant.size,
                v_quantity,
                v_unit_price,
                v_purchase_cost,
                v_unit_price * v_quantity,
                v_unit_price * v_quantity
            );


            -- Deduct variant stock

            v_stock_before :=
                v_variant.stock_quantity;

            v_stock_after :=
                v_stock_before - v_quantity;


            UPDATE public.product_variants
            SET
                stock_quantity = v_stock_after,
                updated_at = now()
            WHERE id = v_variant.id;


            -- Inventory history

            INSERT INTO public.inventory_logs (
                product_id,
                quantity_change,
                stock_before,
                stock_after,
                movement_type,
                reason,
                created_by
            )
            VALUES (
                v_product.id,
                -v_quantity,
                v_stock_before,
                v_stock_after,
                'out',
                'Order ' || p_order_number ||
                ' - Variant ' || v_variant.id,
                auth.uid()
            );


        -- =============================================
        -- Normal product item
        -- =============================================

        ELSE

            SELECT
                p.id,
                p.name,
                p.sku,
                p.purchase_cost,
                p.regular_price,
                p.sale_price,
                p.stock_quantity
            INTO v_product
            FROM public.products p
            WHERE p.id = v_product_id
            FOR UPDATE;


            v_unit_price :=
                COALESCE(
                    v_product.sale_price,
                    v_product.regular_price,
                    0
                );


            v_purchase_cost :=
                COALESCE(
                    v_product.purchase_cost,
                    0
                );


            INSERT INTO public.order_items (
                order_id,
                product_id,
                variant_id,
                product_name,
                sku,
                color,
                size,
                quantity,
                unit_price,
                purchase_cost,
                line_total,
                subtotal
            )
            VALUES (
                v_order_id,
                v_product.id,
                NULL,
                v_product.name,
                v_product.sku,
                NULL,
                NULL,
                v_quantity,
                v_unit_price,
                v_purchase_cost,
                v_unit_price * v_quantity,
                v_unit_price * v_quantity
            );


            -- Deduct product stock

            v_stock_before :=
                v_product.stock_quantity;

            v_stock_after :=
                v_stock_before - v_quantity;


            UPDATE public.products
            SET
                stock_quantity = v_stock_after,
                updated_at = now()
            WHERE id = v_product.id;


            -- Inventory history

            INSERT INTO public.inventory_logs (
                product_id,
                quantity_change,
                stock_before,
                stock_after,
                movement_type,
                reason,
                created_by
            )
            VALUES (
                v_product.id,
                -v_quantity,
                v_stock_before,
                v_stock_after,
                'out',
                'Order ' || p_order_number,
                auth.uid()
            );

        END IF;

    END LOOP;


    RETURN v_order_id;


EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;