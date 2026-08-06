-- =====================================================
-- MN Fashion House
-- Initial Database Schema
-- Version: 1.0
-- =====================================================

-- =====================================================
-- Extensions
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- Update Timestamp Function
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- =====================================================
-- Profiles
-- =====================================================

CREATE TABLE public.profiles (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    full_name TEXT NOT NULL,

    email TEXT UNIQUE NOT NULL,

    phone TEXT,

    avatar_url TEXT,

    role TEXT NOT NULL DEFAULT 'admin',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()

);

CREATE TRIGGER profiles_updated_at
BEFORE UPDATE
ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Categories
-- =====================================================

CREATE TABLE public.categories (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,

    slug TEXT UNIQUE NOT NULL,

    description TEXT,

    image_url TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    sort_order INTEGER DEFAULT 0,

    seo_title TEXT,

    seo_description TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),

    updated_at TIMESTAMPTZ DEFAULT NOW()

);

CREATE TRIGGER categories_updated_at
BEFORE UPDATE
ON categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();