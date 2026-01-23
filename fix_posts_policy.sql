-- Fix RLS policies for posts table

-- Enable RLS on posts table (ensure it is enabled)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read posts (SELECT)
DROP POLICY IF EXISTS "Enable read access for all users" ON posts;
CREATE POLICY "Enable read access for all users" ON posts FOR SELECT USING (true);

-- Allow anyone to insert posts (INSERT) - for anonymous posting
DROP POLICY IF EXISTS "Enable insert for everyone" ON posts;
CREATE POLICY "Enable insert for everyone" ON posts FOR INSERT WITH CHECK (true);

-- Allow authenticated users (admins) to update/delete (optional, adjusting based on needs)
-- Assuming admins might want to delete posts
DROP POLICY IF EXISTS "Authenticated users can delete posts" ON posts;
CREATE POLICY "Authenticated users can delete posts" ON posts FOR DELETE USING (auth.role() = 'authenticated');
