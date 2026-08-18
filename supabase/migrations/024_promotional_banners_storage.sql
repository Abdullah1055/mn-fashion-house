-- =========================================================
-- 024 - Promotional Banner Storage
-- =========================================================

-- Create storage bucket
insert into storage.buckets (
    id,
    name,
    public
)
values (
    'promotional-banners',
    'promotional-banners',
    true
)
on conflict (id) do nothing;


-- =========================================================
-- VIEW
-- Public users can view promotional banner images
-- =========================================================

create policy "Public can view promotional banner images"
on storage.objects
for select
to public
using (
    bucket_id = 'promotional-banners'
);


-- =========================================================
-- UPLOAD
-- Authenticated admin users can upload images
-- =========================================================

create policy "Authenticated users can upload promotional banner images"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'promotional-banners'
);


-- =========================================================
-- UPDATE
-- Authenticated users can update banner images
-- =========================================================

create policy "Authenticated users can update promotional banner images"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'promotional-banners'
)
with check (
    bucket_id = 'promotional-banners'
);


-- =========================================================
-- DELETE
-- Authenticated users can delete banner images
-- =========================================================

create policy "Authenticated users can delete promotional banner images"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'promotional-banners'
);