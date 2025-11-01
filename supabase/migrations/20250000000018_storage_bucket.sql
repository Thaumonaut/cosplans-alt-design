-- Create public storage bucket for images and basic policies

-- Create bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('cosplay-images', 'cosplay-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for the bucket
DO $$
BEGIN
  -- Allow authenticated users to upload to bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can upload images'
  ) THEN
    CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'cosplay-images');
  END IF;

  -- Allow authenticated users to read from bucket (public read via signed urls or auth)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Authenticated users can read images'
  ) THEN
    CREATE POLICY "Authenticated users can read images"
    ON storage.objects FOR SELECT TO authenticated
    USING (bucket_id = 'cosplay-images');
  END IF;

  -- Allow users to delete own images (owner column managed by Supabase Storage)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Users can delete own images'
  ) THEN
    CREATE POLICY "Users can delete own images"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'cosplay-images' AND (auth.uid() = owner));
  END IF;
END$$;


