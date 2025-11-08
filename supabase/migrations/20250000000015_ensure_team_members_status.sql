-- Ensure team_members has status column (add if missing)
-- This migration is safe to run multiple times

-- Check if status column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'team_members' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.team_members 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
        
        -- Add constraint if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public' 
            AND constraint_name = 'team_members_status_valid'
        ) THEN
            ALTER TABLE public.team_members 
            ADD CONSTRAINT team_members_status_valid 
            CHECK (status IN ('invited','active','inactive'));
        END IF;
    END IF;
END $$;

-- Ensure all team owners have active membership records
INSERT INTO public.team_members (team_id, user_id, role, joined_at)
SELECT id, created_by, 'owner', created_at
FROM public.teams
WHERE created_by IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = teams.id AND tm.user_id = teams.created_by
  )
ON CONFLICT (team_id, user_id) 
DO UPDATE SET 
  role = 'owner'
  -- Only update status if the column exists
  -- (This will fail if column doesn't exist, but the migration above should have added it)
;

-- Update existing team_members to have status='active' if status column exists
UPDATE public.team_members 
SET status = 'active' 
WHERE status IS NULL OR status = '' OR (role IN ('owner', 'editor') AND status != 'active');

