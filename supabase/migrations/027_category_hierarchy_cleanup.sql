-- =====================================================
-- MN Fashion House
-- Migration: 027_category_hierarchy_cleanup.sql
-- Category Hierarchy Cleanup
-- =====================================================

-- =====================================================
-- Move Panjabi under Men
-- =====================================================

UPDATE public.categories AS child
SET parent_id = parent.id
FROM public.categories AS parent
WHERE child.name = 'Panjabi'
  AND parent.name = 'Men'
  AND child.id <> parent.id;

-- =====================================================
-- Make sure main categories remain top-level
-- =====================================================

UPDATE public.categories
SET parent_id = NULL
WHERE name IN (
  'Men',
  'Women',
  'Kids',
  'Others'
);