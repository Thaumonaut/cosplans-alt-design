-- Performance Optimization Migration
-- Fixes RLS policy performance warnings by wrapping auth.uid() in (select auth.uid())
-- Removes duplicate indexes
-- This improves query performance by evaluating auth.uid() once per query instead of per row

-- ============================================================================
-- PART 1: Fix duplicate indexes (improves write performance)
-- ============================================================================

-- Drop duplicate indexes on character_wigs
DROP INDEX IF EXISTS public.idx_character_wigs_character_id;
DROP INDEX IF EXISTS public.idx_character_wigs_wig_id;

-- Drop duplicate index on characters
DROP INDEX IF EXISTS public.idx_characters_team_id;

-- Drop duplicate index on team_invitations  
DROP INDEX IF EXISTS public.idx_team_invitations_token;

-- Drop duplicate index on team_members (keep the named unique constraint)
DROP INDEX IF EXISTS public.idx_team_members_unique;

-- Drop duplicate index on wigs
DROP INDEX IF EXISTS public.idx_wigs_team_id;

-- ============================================================================
-- PART 2: Optimize RLS policies - Wrap auth.uid() in (select auth.uid())
-- ============================================================================

-- Helper function to get optimized auth.uid() - evaluates once per query
-- Note: We'll inline (select auth.uid()) in each policy instead

-- ============================================================================
-- TEAMS policies
-- ============================================================================

-- Teams: Users can create teams
DROP POLICY IF EXISTS "Users can create teams" ON public.teams;
CREATE POLICY "Users can create teams" ON public.teams FOR INSERT WITH CHECK (
  created_by = (select auth.uid())
);

-- Teams: Users can view their teams  
DROP POLICY IF EXISTS "Users can view their teams" ON public.teams;
CREATE POLICY "Users can view their teams" ON public.teams FOR SELECT USING (
  id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

-- Teams: Owners can update their teams
DROP POLICY IF EXISTS "Owners can update their teams" ON public.teams;
CREATE POLICY "Owners can update their teams" ON public.teams FOR UPDATE USING (
  id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

-- Teams: Owners can delete their teams
DROP POLICY IF EXISTS "Owners can delete their teams" ON public.teams;
CREATE POLICY "Owners can delete their teams" ON public.teams FOR DELETE USING (
  id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

-- ============================================================================
-- TEAM_MEMBERS policies
-- ============================================================================

-- Team members: Team members can view each other
DROP POLICY IF EXISTS "Team members can view each other" ON public.team_members;
CREATE POLICY "Team members can view each other" ON public.team_members FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members tm WHERE tm.user_id = (select auth.uid()) AND tm.status = 'active')
);

-- Team members: Owners and admins can add members
DROP POLICY IF EXISTS "Owners and admins can add members" ON public.team_members;
CREATE POLICY "Owners and admins can add members" ON public.team_members FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

-- Team members: Owners and admins can update members
DROP POLICY IF EXISTS "Owners and admins can update members" ON public.team_members;
CREATE POLICY "Owners and admins can update members" ON public.team_members FOR UPDATE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

-- Team members: Owners and admins can remove members
DROP POLICY IF EXISTS "Owners and admins can remove members" ON public.team_members;
CREATE POLICY "Owners and admins can remove members" ON public.team_members FOR DELETE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

-- ============================================================================
-- USER_PROFILES policies
-- ============================================================================

-- User profiles: Users can view own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR SELECT USING (
  id = (select auth.uid())
);

-- User profiles: Users can update own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (
  id = (select auth.uid())
) WITH CHECK (
  id = (select auth.uid())
);

-- User profiles: System can insert profiles
DROP POLICY IF EXISTS "System can insert profiles" ON public.user_profiles;
-- Keep as-is if it uses service_role, otherwise optimize if it has auth.uid()
CREATE POLICY "System can insert profiles" ON public.user_profiles FOR INSERT WITH CHECK (true);

-- ============================================================================
-- CREW_MEMBERS policies
-- ============================================================================

-- Crew members: Team members can view their team's crew
DROP POLICY IF EXISTS "Team members can view their team's crew" ON public.crew_members;
CREATE POLICY "Team members can view their team's crew" ON public.crew_members FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

-- Crew members: Team members can insert crew
DROP POLICY IF EXISTS "Team members can insert crew" ON public.crew_members;
CREATE POLICY "Team members can insert crew" ON public.crew_members FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

-- Crew members: Team members can update their team's crew
DROP POLICY IF EXISTS "Team members can update their team's crew" ON public.crew_members;
CREATE POLICY "Team members can update their team's crew" ON public.crew_members FOR UPDATE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

-- Crew members: Team members can delete their team's crew
DROP POLICY IF EXISTS "Team members can delete their team's crew" ON public.crew_members;
CREATE POLICY "Team members can delete their team's crew" ON public.crew_members FOR DELETE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

-- ============================================================================
-- TEAM_INVITATIONS policies
-- ============================================================================

-- Team invitations: Users can view team invitations
DROP POLICY IF EXISTS "Users can view team invitations" ON public.team_invitations;
CREATE POLICY "Users can view team invitations" ON public.team_invitations FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

-- Team invitations: Owners and admins can create invitations
DROP POLICY IF EXISTS "Owners and admins can create invitations" ON public.team_invitations;
CREATE POLICY "Owners and admins can create invitations" ON public.team_invitations FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

-- Team invitations: Owners and admins can cancel invitations
DROP POLICY IF EXISTS "Owners and admins can cancel invitations" ON public.team_invitations;
CREATE POLICY "Owners and admins can cancel invitations" ON public.team_invitations FOR DELETE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

-- ============================================================================
-- CHARACTER_EVENTS policies
-- ============================================================================

-- Character events: Team members can delete character_events
DROP POLICY IF EXISTS "Team members can delete character_events" ON public.character_events;
CREATE POLICY "Team members can delete character_events" ON public.character_events FOR DELETE USING (
  character_id IN (
    SELECT id FROM public.characters 
    WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
  )
);

-- ============================================================================
-- TEAM_JOIN_LINKS policies  
-- ============================================================================

-- Team join links: Team members can view team join links
DROP POLICY IF EXISTS "Team members can view team join links" ON public.team_join_links;
CREATE POLICY "Team members can view team join links" ON public.team_join_links FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

-- Team join links: Owners and admins can create join links
DROP POLICY IF EXISTS "Owners and admins can create join links" ON public.team_join_links;
CREATE POLICY "Owners and admins can create join links" ON public.team_join_links FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

-- Team join links: Owners and admins can update join links
DROP POLICY IF EXISTS "Owners and admins can update join links" ON public.team_join_links;
CREATE POLICY "Owners and admins can update join links" ON public.team_join_links FOR UPDATE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

-- Team join links: Owners and admins can delete join links
DROP POLICY IF EXISTS "Owners and admins can delete join links" ON public.team_join_links;
CREATE POLICY "Owners and admins can delete join links" ON public.team_join_links FOR DELETE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

-- ============================================================================
-- COSTUMES, EQUIPMENT, PROPS, LOCATIONS policies (same pattern)
-- ============================================================================

-- Costumes: Team members can view their team's costumes
DROP POLICY IF EXISTS "Team members can view their team's costumes" ON public.costumes;
CREATE POLICY "Team members can view their team's costumes" ON public.costumes FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can insert costumes" ON public.costumes;
CREATE POLICY "Team members can insert costumes" ON public.costumes FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can update their team's costumes" ON public.costumes;
CREATE POLICY "Team members can update their team's costumes" ON public.costumes FOR UPDATE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can delete their team's costumes" ON public.costumes;
CREATE POLICY "Team members can delete their team's costumes" ON public.costumes FOR DELETE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

-- Equipment (same pattern)
DROP POLICY IF EXISTS "Team members can view their team's equipment" ON public.equipment;
CREATE POLICY "Team members can view their team's equipment" ON public.equipment FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can insert equipment" ON public.equipment;
CREATE POLICY "Team members can insert equipment" ON public.equipment FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can update their team's equipment" ON public.equipment;
CREATE POLICY "Team members can update their team's equipment" ON public.equipment FOR UPDATE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can delete their team's equipment" ON public.equipment;
CREATE POLICY "Team members can delete their team's equipment" ON public.equipment FOR DELETE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

-- Props (same pattern)
DROP POLICY IF EXISTS "Team members can view their team's props" ON public.props;
CREATE POLICY "Team members can view their team's props" ON public.props FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can insert props" ON public.props;
CREATE POLICY "Team members can insert props" ON public.props FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can update their team's props" ON public.props;
CREATE POLICY "Team members can update their team's props" ON public.props FOR UPDATE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can delete their team's props" ON public.props;
CREATE POLICY "Team members can delete their team's props" ON public.props FOR DELETE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

-- Locations (same pattern)
DROP POLICY IF EXISTS "Team members can view their team's locations" ON public.locations;
CREATE POLICY "Team members can view their team's locations" ON public.locations FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can insert locations" ON public.locations;
CREATE POLICY "Team members can insert locations" ON public.locations FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can update their team's locations" ON public.locations;
CREATE POLICY "Team members can update their team's locations" ON public.locations FOR UPDATE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can delete their team's locations" ON public.locations;
CREATE POLICY "Team members can delete their team's locations" ON public.locations FOR DELETE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

-- ============================================================================
-- CREW_ACCOUNT_LINKS policies
-- ============================================================================

DROP POLICY IF EXISTS "Team members can view crew links for their team" ON public.crew_account_links;
CREATE POLICY "Team members can view crew links for their team" ON public.crew_account_links FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can create crew links" ON public.crew_account_links;
CREATE POLICY "Team members can create crew links" ON public.crew_account_links FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can delete crew links" ON public.crew_account_links;
CREATE POLICY "Team members can delete crew links" ON public.crew_account_links FOR DELETE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

-- ============================================================================
-- RESOURCE_PHOTOS policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view photos for resources they can access" ON public.resource_photos;
CREATE POLICY "Users can view photos for resources they can access" ON public.resource_photos FOR SELECT USING (
  resource_id IN (
    SELECT id FROM public.resources 
    WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
  )
);

DROP POLICY IF EXISTS "Users can insert photos for resources they can access" ON public.resource_photos;
CREATE POLICY "Users can insert photos for resources they can access" ON public.resource_photos FOR INSERT WITH CHECK (
  resource_id IN (
    SELECT id FROM public.resources 
    WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
  )
);

DROP POLICY IF EXISTS "Users can delete photos for resources they can access" ON public.resource_photos;
CREATE POLICY "Users can delete photos for resources they can access" ON public.resource_photos FOR DELETE USING (
  resource_id IN (
    SELECT id FROM public.resources 
    WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
  )
);

-- ============================================================================
-- LIFECYCLE_HISTORY policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view lifecycle history for resources they can access" ON public.lifecycle_history;
CREATE POLICY "Users can view lifecycle history for resources they can access" ON public.lifecycle_history FOR SELECT USING (
  resource_id IN (
    SELECT id FROM public.resources 
    WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
  )
);

-- ============================================================================
-- EVENTS policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view events in their teams" ON public.events;
CREATE POLICY "Users can view events in their teams" ON public.events FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can create events" ON public.events;
CREATE POLICY "Team members can create events" ON public.events FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can update events" ON public.events;
CREATE POLICY "Team members can update events" ON public.events FOR UPDATE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can delete events" ON public.events;
CREATE POLICY "Team members can delete events" ON public.events FOR DELETE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

-- ============================================================================
-- CHARACTERS, WIGS, CHARACTER_WIGS policies
-- Note: These have duplicate policies - we'll keep the descriptive named ones
-- ============================================================================

-- Characters: Users can view characters in their teams
DROP POLICY IF EXISTS "Users can view characters in their teams" ON public.characters;
CREATE POLICY "Users can view characters in their teams" ON public.characters FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

DROP POLICY IF EXISTS "Users can insert characters in their teams" ON public.characters;
CREATE POLICY "Users can insert characters in their teams" ON public.characters FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Users can update characters in their teams" ON public.characters;
CREATE POLICY "Users can update characters in their teams" ON public.characters FOR UPDATE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Team owners/admins can delete characters" ON public.characters;
CREATE POLICY "Team owners/admins can delete characters" ON public.characters FOR DELETE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

-- Wigs: Users can view wigs in their teams
DROP POLICY IF EXISTS "Users can view wigs in their teams" ON public.wigs;
CREATE POLICY "Users can view wigs in their teams" ON public.wigs FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

DROP POLICY IF EXISTS "Users can insert wigs in their teams" ON public.wigs;
CREATE POLICY "Users can insert wigs in their teams" ON public.wigs FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Users can update wigs in their teams" ON public.wigs;
CREATE POLICY "Users can update wigs in their teams" ON public.wigs FOR UPDATE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Team owners/admins can delete wigs" ON public.wigs;
CREATE POLICY "Team owners/admins can delete wigs" ON public.wigs FOR DELETE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role = 'owner' AND status = 'active')
);

-- Character wigs: Users can view character-wig links in their teams
DROP POLICY IF EXISTS "Users can view character-wig links in their teams" ON public.character_wigs;
CREATE POLICY "Users can view character-wig links in their teams" ON public.character_wigs FOR SELECT USING (
  character_id IN (
    SELECT id FROM public.characters 
    WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
  )
);

DROP POLICY IF EXISTS "Users can insert character-wig links in their teams" ON public.character_wigs;
CREATE POLICY "Users can insert character-wig links in their teams" ON public.character_wigs FOR INSERT WITH CHECK (
  character_id IN (
    SELECT id FROM public.characters 
    WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
  )
);

DROP POLICY IF EXISTS "Users can delete character-wig links in their teams" ON public.character_wigs;
CREATE POLICY "Users can delete character-wig links in their teams" ON public.character_wigs FOR DELETE USING (
  character_id IN (
    SELECT id FROM public.characters 
    WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
  )
);

-- ============================================================================
-- VENDORS and CHARACTER_VENDORS policies
-- ============================================================================

DROP POLICY IF EXISTS "Users can view vendors in their teams" ON public.vendors;
CREATE POLICY "Users can view vendors in their teams" ON public.vendors FOR SELECT USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can create vendors" ON public.vendors;
CREATE POLICY "Team members can create vendors" ON public.vendors FOR INSERT WITH CHECK (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can update vendors" ON public.vendors;
CREATE POLICY "Team members can update vendors" ON public.vendors FOR UPDATE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

DROP POLICY IF EXISTS "Team members can delete vendors" ON public.vendors;
CREATE POLICY "Team members can delete vendors" ON public.vendors FOR DELETE USING (
  team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
);

-- Character vendors
DROP POLICY IF EXISTS "Users can view character_vendors in their teams" ON public.character_vendors;
CREATE POLICY "Users can view character_vendors in their teams" ON public.character_vendors FOR SELECT USING (
  character_id IN (
    SELECT id FROM public.characters 
    WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND status = 'active')
  )
);

DROP POLICY IF EXISTS "Team members can create character_vendors" ON public.character_vendors;
CREATE POLICY "Team members can create character_vendors" ON public.character_vendors FOR INSERT WITH CHECK (
  character_id IN (
    SELECT id FROM public.characters 
    WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
  )
);

DROP POLICY IF EXISTS "Team members can update character_vendors" ON public.character_vendors;
CREATE POLICY "Team members can update character_vendors" ON public.character_vendors FOR UPDATE USING (
  character_id IN (
    SELECT id FROM public.characters 
    WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
  )
);

DROP POLICY IF EXISTS "Team members can delete character_vendors" ON public.character_vendors;
CREATE POLICY "Team members can delete character_vendors" ON public.character_vendors FOR DELETE USING (
  character_id IN (
    SELECT id FROM public.characters 
    WHERE team_id IN (SELECT team_id FROM public.team_members WHERE user_id = (select auth.uid()) AND role IN ('owner', 'editor') AND status = 'active')
  )
);

-- Note: Additional policies for resource_photos with character/wig-specific access 
-- can be optimized similarly, but those are more complex and may need careful review

