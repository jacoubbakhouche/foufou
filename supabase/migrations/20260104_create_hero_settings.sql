-- Create hero_settings table
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

-- Add RLS policies
alter table public.hero_settings enable row level security;

-- Allow read access to everyone
create policy "Enable read access for all users"
  on public.hero_settings for select
  using (true);

-- Allow insert/update/delete only for authenticated users (admins)
-- Note: In a real app we'd check for admin role, but for now strict auth is okay
create policy "Enable modifications for authenticated users"
  on public.hero_settings for all
  using (auth.role() = 'authenticated');

-- Insert default row if not exists
insert into public.hero_settings (
    promo_text_fr, promo_text_ar, 
    title_line1_fr, title_line1_ar,
    title_line2_fr, title_line2_ar,
    description_fr, description_ar,
    button_text_fr, button_text_ar,
    images
)
select 
    'Nouvelle Collection 2024', 'تشكيلة جديدة 2024',
    'Découvrez', 'اكتشف',
    'L''Élégance Véritable', 'الأناقة الحقيقية',
    'Explorez notre collection de mode exclusive conçue pour mettre en valeur votre style unique. Des pièces tendance aux classiques intemporels.', 'استكشف تشكيلتنا الحصرية المصممة لتبرز أسلوبك الفريد. من أحدث الصيحات إلى الكلاسيكيات الخالدة.',
    'Acheter maintenant', 'تسوّق الآن',
    ARRAY['/slider/1.jpg', '/slider/2.jpg', '/slider/3.jpg']
where not exists (select 1 from public.hero_settings);
