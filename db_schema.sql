-- [Previous content remains unchanged]

-- 7. Add policy for authenticated users (admins) to delete posts
-- Note: In a real production app, you should check for a specific role claim or email.
-- For this demo, we allow any authenticated user to delete posts (assuming only admins log in to /admin).
-- Ideally, create a 'profiles' table with an 'is_admin' column.

drop policy if exists "Authenticated users can delete posts" on posts;
create policy "Authenticated users can delete posts" 
  on posts 
  for delete 
  using ( auth.role() = 'authenticated' );

-- Allow authenticated users to view all posts (already covered by public policy, but good to be explicit for dashboard)
-- No change needed for select as public policy covers it.
