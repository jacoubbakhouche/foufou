-- Run this in Supabase SQL Editor

-- 1. Create a new storage bucket called 'hero-slider' (if it doesn't exist)
insert into storage.buckets (id, name, public)
values ('hero-slider', 'hero-slider', true)
on conflict (id) do nothing;

-- 2. Allow public access (Unique Policy Name)
create policy "Hero Slider Public Access"
  on storage.objects for select
  using ( bucket_id = 'hero-slider' );

-- 3. Allow authenticated users to upload (Unique Policy Name)
create policy "Hero Slider Upload Limit"
  on storage.objects for insert
  with check ( bucket_id = 'hero-slider' and auth.role() = 'authenticated' );

-- 4. Allow admins to delete (Unique Policy Name)
create policy "Hero Slider Delete Limit"
  on storage.objects for delete
  using ( bucket_id = 'hero-slider' and auth.role() = 'authenticated' );
