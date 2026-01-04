-- Run this script in the Supabase SQL Editor

-- 1. Create the table
create table if not exists public.hero_settings (
  id uuid default gen_random_uuid() primary key,
  promo_text_fr text,
  promo_text_ar text,
  title_line1_fr text,
  title_line1_ar text,
  title_line2_fr text,
  title_line2_ar text,
  description_fr text,
  description_ar text,
  button_text_fr text,
  button_text_ar text,
  images text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Security
alter table public.hero_settings enable row level security;

-- 3. Create Policies
-- Allow everyone to read
create policy "Enable read access for all users"
  on public.hero_settings for select
  using (true);

-- Allow admins to edit
create policy "Enable modifications for authenticated users"
  on public.hero_settings for all
  using (auth.role() = 'authenticated');

-- 4. Insert Default Data (Safe Insert)
insert into public.hero_settings (
    promo_text_fr, promo_text_ar, 
    title_line1_fr, title_line1_ar,
    title_line2_fr, title_line2_ar,
    description_fr, description_ar,
    button_text_fr, button_text_ar,
    images
)
select 
    'Nouvelle Collection', 'تشكيلة جديدة',
    'Découvrez', 'اكتشف',
    'L''Élégance Véritable', 'الأناقة الحقيقية',
    'Explorez notre collection de mode exclusive.', 'استكشف تشكيلتنا الحصرية.',
    'Acheter maintenant', 'تسوّق الآن',
    ARRAY['/slider/1.jpg', '/slider/2.jpg', '/slider/3.jpg']
where not exists (select 1 from public.hero_settings);
