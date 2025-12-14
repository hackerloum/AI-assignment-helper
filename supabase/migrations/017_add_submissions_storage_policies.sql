-- Storage policies for submissions bucket
-- This allows authenticated users to upload and manage their own files

-- Enable RLS on storage.objects (if not already enabled)
-- Note: This is typically enabled by default, but we'll ensure it

-- Policy: Allow authenticated users to upload files to their own folder
CREATE POLICY "Users can upload to own submissions folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to read their own files
CREATE POLICY "Users can read own submissions"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to update their own files (for replacing files)
CREATE POLICY "Users can update own submissions"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own files
CREATE POLICY "Users can delete own submissions"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'submissions' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow public read access (since bucket is public)
-- This allows anyone to read files via public URLs
CREATE POLICY "Public can read submissions"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'submissions');

