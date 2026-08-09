-- =====================================================
-- MN Fashion House
-- Migration: 016_align_product_variants.sql
-- Purpose:
-- Align existing product_variants table with
-- the current Product Variant module.
-- =====================================================


-- =====================================================
-- Add current application columns
-- =====================================================

ALTER TABLE public.product_variants
ADD COLUMN IF NOT EXISTS purchase_cost NUMERIC(10,2);

ALTER TABLE public.product_variants
ADD COLUMN IF NOT EXISTS regular_price NUMERIC(10,2);

ALTER TABLE public.product_variants
ADD COLUMN IF NOT EXISTS sale_price NUMERIC(10,2);

ALTER TABLE public.product_variants
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER
NOT NULL DEFAULT 5;


-- =====================================================
-- Existing old columns are kept.
--
-- Old:
-- price
-- discount_price
--
-- New:
-- regular_price
-- sale_price
--
-- Copy existing values so no data is lost.
-- =====================================================

UPDATE public.product_variants
SET regular_price = price
WHERE regular_price IS NULL;


UPDATE public.product_variants
SET sale_price = discount_price
WHERE sale_price IS NULL
  AND discount_price IS NOT NULL;


-- =====================================================
-- Current application allows optional SKU,
-- Size and Color.
-- =====================================================

ALTER TABLE public.product_variants
ALTER COLUMN sku DROP NOT NULL;

ALTER TABLE public.product_variants
ALTER COLUMN size DROP NOT NULL;

ALTER TABLE public.product_variants
ALTER COLUMN color DROP NOT NULL;


-- =====================================================
-- Old price column remains for backward compatibility.
-- Make it nullable because current application uses
-- regular_price instead.
-- =====================================================

ALTER TABLE public.product_variants
ALTER COLUMN price DROP NOT NULL;


-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS
product_variants_product_id_idx
ON public.product_variants(product_id);

CREATE INDEX IF NOT EXISTS
product_variants_size_idx
ON public.product_variants(size);

CREATE INDEX IF NOT EXISTS
product_variants_color_idx
ON public.product_variants(color);


-- =====================================================
-- Row Level Security
-- =====================================================

ALTER TABLE public.product_variants
ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- Public read policy
-- =====================================================

DROP POLICY IF EXISTS
"Public can view active product variants"
ON public.product_variants;

CREATE POLICY
"Public can view active product variants"
ON public.product_variants
FOR SELECT
USING (is_active = true);


-- =====================================================
-- Authenticated admin management policy
-- =====================================================

DROP POLICY IF EXISTS
"Authenticated users manage product variants"
ON public.product_variants;

CREATE POLICY
"Authenticated users manage product variants"
ON public.product_variants
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);