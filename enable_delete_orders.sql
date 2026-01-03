-- Enable RLS on the orders table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users (Admins) to DELETE orders
CREATE POLICY "Allow authenticated users to delete orders"
ON orders
FOR DELETE
TO authenticated
USING (true);

-- Also ensure they can SELECT/UPDATE/INSERT (if not already set)
-- Typically you might need these too if you enabled RLS fresh:
CREATE POLICY "Allow authenticated users to select orders"
ON orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to update orders"
ON orders FOR UPDATE TO authenticated USING (true);

-- Allow public (anon) to insert orders (for customers)
CREATE POLICY "Allow public to insert orders"
ON orders FOR INSERT TO anon WITH CHECK (true);
