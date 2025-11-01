-- Fix team_members status for existing records
-- Some records might not have status='active' set explicitly, which causes RLS policy failures

-- Update all team_members records to have status='active' if they don't have a status set
-- This handles cases where the default wasn't applied or records were created before the default was added
UPDATE public.team_members 
SET status = 'active' 
WHERE status IS NULL OR status = '';

-- Also ensure all owner/editor roles have active status (for safety)
UPDATE public.team_members 
SET status = 'active' 
WHERE role IN ('owner', 'editor') AND status != 'active';

