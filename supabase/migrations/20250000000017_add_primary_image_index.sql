-- Add primary_image_index column to ideas table
-- This stores which image (by index) should be displayed as the primary/header image

ALTER TABLE public.ideas 
  ADD COLUMN IF NOT EXISTS primary_image_index INTEGER DEFAULT 0 CHECK (primary_image_index >= 0);

COMMENT ON COLUMN public.ideas.primary_image_index IS 'Index of the primary/header image in the images array (0-based). Defaults to 0 (first image).';

