-- =====================================================
-- MN Fashion House
-- Migration: 017_align_products_and_order_items.sql
--
-- Purpose:
-- Align the live products and order_items tables with
-- the current application architecture.
--
-- Existing columns/data are preserved.
-- =====================================================


-- =====================================================
-- PART 1
-- Align PRODUCTS table
-- =====================================================

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS purchase_cost NUMERIC(12,2)
DEFAULT 0;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS regular_price NUMERIC(12,2)
DEFAULT 0;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sale_price NUMERIC(12,2);

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER
DEFAULT 0;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER
DEFAULT 5;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN
DEFAULT false;

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS is_active BOOLEAN
DEFAULT true;


-- =====================================================
-- Backfill application fields from existing fields
-- =====================================================

UPDATE public.products
SET is_featured = COALESCE(featured, false)
WHERE is_featured IS NULL;


UPDATE public.products
SET is_active = (
    COALESCE(status, 'active') = 'active'
)
WHERE is_active IS NULL;


-- =====================================================
-- Normalize NULL values for numeric fields
-- =====================================================

UPDATE public.products
SET purchase_cost = 0
WHERE purchase_cost IS NULL;


UPDATE public.products
SET regular_price = 0
WHERE regular_price IS NULL;


UPDATE public.products
SET stock_quantity = 0
WHERE stock_quantity IS NULL;


UPDATE public.products
SET low_stock_threshold = 5
WHERE low_stock_threshold IS NULL;


-- =====================================================
-- Make required application fields NOT NULL
-- =====================================================

ALTER TABLE public.products
ALTER COLUMN purchase_cost SET DEFAULT 0;

ALTER TABLE public.products
ALTER COLUMN purchase_cost SET NOT NULL;


ALTER TABLE public.products
ALTER COLUMN regular_price SET DEFAULT 0;

ALTER TABLE public.products
ALTER COLUMN regular_price SET NOT NULL;


ALTER TABLE public.products
ALTER COLUMN stock_quantity SET DEFAULT 0;

ALTER TABLE public.products
ALTER COLUMN stock_quantity SET NOT NULL;


ALTER TABLE public.products
ALTER COLUMN low_stock_threshold SET DEFAULT 5;

ALTER TABLE public.products
ALTER COLUMN low_stock_threshold SET NOT NULL;


ALTER TABLE public.products
ALTER COLUMN is_featured SET DEFAULT false;

ALTER TABLE public.products
ALTER COLUMN is_featured SET NOT NULL;


ALTER TABLE public.products
ALTER COLUMN is_active SET DEFAULT true;

ALTER TABLE public.products
ALTER COLUMN is_active SET NOT NULL;


-- =====================================================
-- PART 2
-- Align ORDER ITEMS table
-- =====================================================

ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS unit_price NUMERIC(12,2)
DEFAULT 0;

ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS purchase_cost NUMERIC(12,2)
DEFAULT 0;

ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12,2)
DEFAULT 0;


-- =====================================================
-- Backfill subtotal from existing line_total
-- =====================================================

UPDATE public.order_items
SET subtotal = line_total
WHERE subtotal IS NULL;


-- =====================================================
-- Backfill unit price from existing line_total
-- =====================================================

UPDATE public.order_items
SET unit_price =
    CASE
        WHEN quantity > 0
        THEN line_total / quantity
        ELSE 0
    END
WHERE unit_price IS NULL
   OR unit_price = 0;


-- =====================================================
-- Backfill purchase cost from products
-- =====================================================

UPDATE public.order_items oi
SET purchase_cost = COALESCE(
    (
        SELECT p.purchase_cost
        FROM public.products p
        WHERE p.id = oi.product_id
    ),
    0
)
WHERE oi.purchase_cost IS NULL
   OR oi.purchase_cost = 0;


-- =====================================================
-- Required order item fields
-- =====================================================

ALTER TABLE public.order_items
ALTER COLUMN unit_price SET DEFAULT 0;

ALTER TABLE public.order_items
ALTER COLUMN unit_price SET NOT NULL;


ALTER TABLE public.order_items
ALTER COLUMN purchase_cost SET DEFAULT 0;

ALTER TABLE public.order_items
ALTER COLUMN purchase_cost SET NOT NULL;


ALTER TABLE public.order_items
ALTER COLUMN subtotal SET DEFAULT 0;

ALTER TABLE public.order_items
ALTER COLUMN subtotal SET NOT NULL;


-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS
idx_products_is_active
ON public.products(is_active);


CREATE INDEX IF NOT EXISTS
idx_products_category_id
ON public.products(category_id);


CREATE INDEX IF NOT EXISTS
idx_order_items_variant_id
ON public.order_items(variant_id);