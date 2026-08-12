-- =====================================================
-- MN Fashion House
-- Migration: 020_align_product_images_storage.sql
--
-- Purpose:
-- Align product_images with the current
-- Supabase Storage based image architecture.
--
-- Existing image records are preserved.
-- =====================================================

ALTER TABLE public.product_images
ADD COLUMN IF NOT EXISTS storage_path TEXT;

-- Existing records, if any, may not have a storage path.
-- New uploads will always populate this field.

CREATE INDEX IF NOT EXISTS
idx_product_images_storage_path
ON public.product_images(storage_path);