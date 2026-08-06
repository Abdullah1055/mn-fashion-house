-- =====================================================
-- MN Fashion House
-- Migration: 003_orders_schema.sql
-- Orders Module
-- =====================================================

-- =====================================================
-- Orders
-- =====================================================

CREATE TABLE public.orders (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_number TEXT NOT NULL UNIQUE,

    customer_name TEXT NOT NULL,

    customer_phone TEXT NOT NULL,

    customer_email TEXT,

    delivery_address TEXT NOT NULL,

    district TEXT NOT NULL,

    notes TEXT,

    payment_method TEXT NOT NULL DEFAULT 'cod'
        CHECK (payment_method IN ('cod')),

    payment_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (payment_status IN ('pending','paid','failed','refunded')),

    order_status TEXT NOT NULL DEFAULT 'pending'
        CHECK (
            order_status IN (
                'pending',
                'confirmed',
                'processing',
                'shipped',
                'delivered',
                'cancelled'
            )
        ),

    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,

    delivery_charge NUMERIC(10,2) NOT NULL DEFAULT 0,

    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,

    total NUMERIC(10,2) NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

CREATE INDEX idx_orders_phone
ON public.orders(customer_phone);

CREATE INDEX idx_orders_status
ON public.orders(order_status);

CREATE INDEX idx_orders_created_at
ON public.orders(created_at DESC);

CREATE TRIGGER orders_updated_at
BEFORE UPDATE
ON public.orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Order Items
-- =====================================================

CREATE TABLE public.order_items (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    order_id UUID NOT NULL
        REFERENCES public.orders(id)
        ON DELETE CASCADE,

    product_id UUID NOT NULL
        REFERENCES public.products(id)
        ON DELETE RESTRICT,

    variant_id UUID
        REFERENCES public.product_variants(id)
        ON DELETE SET NULL,

    product_name TEXT NOT NULL,

    sku TEXT,

    color TEXT,

    size TEXT,

    quantity INTEGER NOT NULL
        CHECK (quantity > 0),

    unit_price NUMERIC(10,2) NOT NULL,

    line_total NUMERIC(10,2) NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

CREATE INDEX idx_order_items_order
ON public.order_items(order_id);

CREATE INDEX idx_order_items_product
ON public.order_items(product_id);