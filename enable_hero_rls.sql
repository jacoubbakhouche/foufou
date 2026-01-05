-- Enable Row Level Security (RLS) on the table
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow everyone (public) to SELECT (view) the settings
-- This allows the Hero component to fetch data for all visitors
DROP POLICY IF EXISTS "Allow public read access" ON hero_settings;
CREATE POLICY "Allow public read access" ON hero_settings
  FOR SELECT USING (true);

-- Policy 2: Allow authenticated users (Admins) to INSERT/UPDATE
-- This permits saving changes from the Admin Dashboard
DROP POLICY IF EXISTS "Allow admin insert/update" ON hero_settings;
CREATE POLICY "Allow admin insert/update" ON hero_settings
  FOR ALL TO authenticated USING (true) WITH CHECK (true);
