-- =====================================================
-- MN Fashion House
-- Migration: 002_products_schema.sql
-- Products Module
-- =====================================================

-- =====================================================
-- Products
-- =====================================================

CREATE TABLE public.products (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,

    name TEXT NOT NULL,

    slug TEXT NOT NULL UNIQUE,

    brand TEXT,

    short_description TEXT,

    description TEXT,

    featured BOOLEAN NOT NULL DEFAULT FALSE,

    new_arrival BOOLEAN NOT NULL DEFAULT FALSE,

    status TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active','draft','inactive')),

    seo_title TEXT,

    seo_description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

CREATE INDEX idx_products_category
ON public.products(category_id);

CREATE INDEX idx_products_slug
ON public.products(slug);

CREATE TRIGGER products_updated_at
BEFORE UPDATE
ON public.products
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Product Images
-- =====================================================

CREATE TABLE public.product_images (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL
        REFERENCES public.products(id)
        ON DELETE CASCADE,

    image_url TEXT NOT NULL,

    alt_text TEXT,

    display_order INTEGER NOT NULL DEFAULT 0,

    is_primary BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

CREATE INDEX idx_product_images_product
ON public.product_images(product_id);

-- =====================================================
-- Product Variants
-- =====================================================

CREATE TABLE public.product_variants (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    product_id UUID NOT NULL
        REFERENCES public.products(id)
        ON DELETE CASCADE,

    sku TEXT NOT NULL UNIQUE,

    color TEXT NOT NULL,

    size TEXT NOT NULL,

    price NUMERIC(10,2) NOT NULL,

    discount_price NUMERIC(10,2),

    stock_quantity INTEGER NOT NULL DEFAULT 0
        CHECK (stock_quantity >= 0),

    barcode TEXT,

    weight NUMERIC(10,2),

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

CREATE INDEX idx_variants_product
ON public.product_variants(product_id);

CREATE INDEX idx_variants_sku
ON public.product_variants(sku);

CREATE TRIGGER variants_updated_at
BEFORE UPDATE
ON public.product_variants
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();