-- Add image_url column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create a storage bucket for post images if it doesn't exist
-- Note: You might need to create the bucket 'post-images' in the Supabase Dashboard if this fails.
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the storage bucket
-- Allow public access to view images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'post-images' );

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'post-images' AND
  auth.role() = 'authenticated'
);

-- Allow anonymous uploads (if you want to allow non-logged in users to post images, 
-- though your app seems to allow anon posts but maybe not anon uploads? 
-- Let's allow anon uploads for now to match the "anon post" vibe if that's what you want,
-- OR restrict to authenticated. Based on your PostForm, you allow "anonymous" nickname but maybe the user is actually logged in?
-- Your header shows Login button, so users might be anon.
-- If users are truly anon (no Supabase Auth session), you need to enable anon uploads.)

-- For now, let's assume we want to allow anyone to upload for the rant nature
CREATE POLICY "Anyone can upload images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'post-images' );
