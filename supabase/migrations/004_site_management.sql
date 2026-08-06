-- =====================================================
-- MN Fashion House
-- Migration: 004_site_management.sql
-- Site Management Module
-- =====================================================

-- =====================================================
-- Banners
-- =====================================================

CREATE TABLE public.banners (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,

    subtitle TEXT,

    image_url TEXT NOT NULL,

    button_text TEXT,

    button_link TEXT,

    display_order INTEGER NOT NULL DEFAULT 0,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    starts_at TIMESTAMPTZ,

    ends_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

CREATE INDEX idx_banners_active
ON public.banners(is_active);

CREATE TRIGGER banners_updated_at
BEFORE UPDATE
ON public.banners
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Offers
-- =====================================================

CREATE TABLE public.offers (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    title TEXT NOT NULL,

    description TEXT,

    discount_type TEXT NOT NULL DEFAULT 'percentage'
        CHECK (discount_type IN ('percentage','fixed')),

    discount_value NUMERIC(10,2) NOT NULL,

    banner_image_url TEXT,

    coupon_code TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    starts_at TIMESTAMPTZ,

    ends_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

CREATE INDEX idx_offers_active
ON public.offers(is_active);

CREATE TRIGGER offers_updated_at
BEFORE UPDATE
ON public.offers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Settings
-- =====================================================

CREATE TABLE public.settings (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    store_name TEXT NOT NULL,

    phone TEXT,

    email TEXT,

    address TEXT,

    facebook_url TEXT,

    instagram_url TEXT,

    whatsapp_number TEXT,

    logo_url TEXT,

    favicon_url TEXT,

    seo_title TEXT,

    seo_description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

CREATE TRIGGER settings_updated_at
BEFORE UPDATE
ON public.settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();