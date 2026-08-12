-- =====================================================
-- MN Fashion House
-- Migration: 019_add_product_sku.sql
--
-- Purpose:
-- Add missing SKU column to products table.
--
-- Existing product data is preserved.
-- =====================================================

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS sku TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS
idx_products_sku_unique
ON public.products(sku)
WHERE sku IS NOT NULL;