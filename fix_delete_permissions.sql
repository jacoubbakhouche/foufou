-- First, drop existing policies to avoid conflicts or duplicates
DROP POLICY IF EXISTS "Allow authenticated users to delete orders" ON orders;
DROP POLICY IF EXISTS "Allow public to insert orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to select orders" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users to update orders" ON orders;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON orders;

-- Ensure RLS is enabled
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 1. DELETE POLICY: Allow ANY authenticated user to delete
CREATE POLICY "Enable delete for authenticated users"
ON orders FOR DELETE
TO authenticated
USING (true);

-- 2. INSERT POLICY: Allow ANYONE (including anonymous) to insert orders
CREATE POLICY "Enable insert for everyone"
ON orders FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 3. SELECT POLICY: Allow authenticated users to see all orders
CREATE POLICY "Enable select for authenticated users"
ON orders FOR SELECT
TO authenticated
USING (true);

-- 4. UPDATE POLICY: Allow authenticated users to update (status etc)
CREATE POLICY "Enable update for authenticated users"
ON orders FOR UPDATE
TO authenticated
USING (true);
