


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."calculate_project_progress"("project_uuid" "uuid") RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  project_task_completion DECIMAL;
  resource_completion DECIMAL;
  total_resources INTEGER;
  result INTEGER;
BEGIN
  SELECT COALESCE((COUNT(*) FILTER (WHERE completed = TRUE)::DECIMAL / NULLIF(COUNT(*), 0)), 0)
    INTO project_task_completion
  FROM public.tasks
  WHERE project_id = project_uuid AND resource_id IS NULL;

  SELECT COUNT(*) INTO total_resources
  FROM public.project_resources
  WHERE project_id = project_uuid;

  IF total_resources > 0 THEN
    SELECT AVG((
      CASE pr.status
        WHEN 'needed' THEN 0
        WHEN 'acquired' THEN 0.25
        WHEN 'in-progress' THEN 0.5
        WHEN 'completed' THEN 1.0
      END + COALESCE((
        SELECT COUNT(*) FILTER (WHERE completed = TRUE)::DECIMAL / NULLIF(COUNT(*), 0)
        FROM public.tasks t
        WHERE t.resource_id = pr.resource_id
      ), 0)) / 2)
    INTO resource_completion
    FROM public.project_resources pr
    WHERE pr.project_id = project_uuid;
  ELSE
    resource_completion := 0;
  END IF;

  IF total_resources = 0 THEN
    result := ROUND(project_task_completion * 100);
  ELSIF NOT EXISTS (SELECT 1 FROM public.tasks WHERE project_id = project_uuid AND resource_id IS NULL) THEN
    result := ROUND(resource_completion * 100);
  ELSE
    result := ROUND(((project_task_completion + resource_completion) / 2) * 100);
  END IF;

  RETURN result;
END;
$$;


ALTER FUNCTION "public"."calculate_project_progress"("project_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_orphaned_test_schemas"("max_age_hours" integer DEFAULT 1) RETURNS "text"[]
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  schema_name TEXT;
  schema_timestamp BIGINT;
  cutoff_timestamp BIGINT;
  dropped_schemas TEXT[] := '{}';
BEGIN
  -- Calculate cutoff timestamp (current time - max_age_hours)
  cutoff_timestamp := EXTRACT(EPOCH FROM NOW())::BIGINT * 1000 - (max_age_hours * 60 * 60 * 1000);

  -- Iterate through all test schemas
  FOR schema_name IN
    SELECT s.schema_name::TEXT
    FROM information_schema.schemata s
    WHERE s.schema_name LIKE 'test_%'
  LOOP
    -- Extract timestamp from schema name (format: test_<timestamp>_<random>)
    BEGIN
      schema_timestamp := substring(schema_name FROM 'test_(\d+)_')::BIGINT;
      
      -- If schema is older than cutoff, drop it
      IF schema_timestamp < cutoff_timestamp THEN
        EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', schema_name);
        dropped_schemas := array_append(dropped_schemas, schema_name);
        RAISE NOTICE 'Dropped orphaned test schema: % (age: % hours)', 
          schema_name, 
          ROUND((cutoff_timestamp - schema_timestamp)::NUMERIC / (60 * 60 * 1000), 2);
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Could not parse timestamp from schema name: %', schema_name;
        CONTINUE;
    END;
  END LOOP;

  RETURN dropped_schemas;
END;
$$;


ALTER FUNCTION "public"."cleanup_orphaned_test_schemas"("max_age_hours" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."clone_schema_structure"("source_schema" "text", "target_schema" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  table_record RECORD;
  sequence_record RECORD;
BEGIN
  -- Validate target schema is a test schema
  IF target_schema NOT LIKE 'test_%' THEN
    RAISE EXCEPTION 'Target schema must start with test_ prefix. Got: %', target_schema;
  END IF;

  -- Clone all tables from source schema
  FOR table_record IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = source_schema
    ORDER BY tablename
  LOOP
    -- Create table with same structure (INCLUDING ALL copies defaults, constraints, indexes)
    EXECUTE format(
      'CREATE TABLE IF NOT EXISTS %I.%I (LIKE %I.%I INCLUDING ALL)',
      target_schema, table_record.tablename,
      source_schema, table_record.tablename
    );
    
    RAISE NOTICE 'Cloned table: %.% -> %.%', 
      source_schema, table_record.tablename,
      target_schema, table_record.tablename;
  END LOOP;

  -- Clone sequences (for auto-increment IDs)
  FOR sequence_record IN
    SELECT sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema = source_schema
  LOOP
    EXECUTE format(
      'CREATE SEQUENCE IF NOT EXISTS %I.%I',
      target_schema, sequence_record.sequence_name
    );
    
    RAISE NOTICE 'Cloned sequence: %.% -> %.%',
      source_schema, sequence_record.sequence_name,
      target_schema, sequence_record.sequence_name;
  END LOOP;

  RAISE NOTICE 'Schema structure cloned from % to %', source_schema, target_schema;
END;
$$;


ALTER FUNCTION "public"."clone_schema_structure"("source_schema" "text", "target_schema" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_test_schema"("schema_name" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Validate schema name starts with 'test_' for safety
  IF schema_name NOT LIKE 'test_%' THEN
    RAISE EXCEPTION 'Schema name must start with test_ prefix. Got: %', schema_name;
  END IF;

  -- Create the schema
  EXECUTE format('CREATE SCHEMA IF NOT EXISTS %I', schema_name);
  
  -- Grant usage permissions (adjust based on your setup)
  EXECUTE format('GRANT USAGE ON SCHEMA %I TO PUBLIC', schema_name);
  EXECUTE format('GRANT CREATE ON SCHEMA %I TO PUBLIC', schema_name);
  
  RAISE NOTICE 'Created test schema: %', schema_name;
END;
$$;


ALTER FUNCTION "public"."create_test_schema"("schema_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."drop_test_schema"("schema_name" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Safety check: only allow dropping test schemas
  IF schema_name NOT LIKE 'test_%' THEN
    RAISE EXCEPTION 'Only test schemas (test_*) can be dropped via this function. Got: %', schema_name;
  END IF;

  -- Drop schema and all its contents (CASCADE removes all tables, sequences, etc.)
  EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', schema_name);
  
  RAISE NOTICE 'Dropped test schema: %', schema_name;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail (cleanup failures shouldn't break tests)
    RAISE WARNING 'Failed to drop test schema %: %', schema_name, SQLERRM;
END;
$$;


ALTER FUNCTION "public"."drop_test_schema"("schema_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_team_role"("team_uuid" "uuid", "user_uuid" "uuid") RETURNS "text"
    LANGUAGE "sql" STABLE SECURITY DEFINER
    AS $$
  SELECT role FROM public.team_members
  WHERE team_id = team_uuid AND user_id = user_uuid AND status = 'active'
$$;


ALTER FUNCTION "public"."get_user_team_role"("team_uuid" "uuid", "user_uuid" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."list_test_schemas"() RETURNS "text"[]
    LANGUAGE "sql" SECURITY DEFINER
    AS $$
  SELECT array_agg(schema_name::TEXT ORDER BY schema_name)
  FROM information_schema.schemata
  WHERE schema_name LIKE 'test_%';
$$;


ALTER FUNCTION "public"."list_test_schemas"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "entity_type" "text" NOT NULL,
    "entity_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "comments_entity_type_check" CHECK (("entity_type" = ANY (ARRAY['idea'::"text", 'project'::"text", 'resource'::"text", 'tool'::"text", 'photoshoot'::"text"])))
);


ALTER TABLE "public"."comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."crew_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "photoshoot_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "role" "text" NOT NULL,
    "contact" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "crew_members_role_valid" CHECK (("role" = ANY (ARRAY['photographer'::"text", 'assistant'::"text", 'makeup'::"text", 'other'::"text"])))
);


ALTER TABLE "public"."crew_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ideas" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "character" "text" NOT NULL,
    "series" "text" NOT NULL,
    "description" "text",
    "difficulty" "text" NOT NULL,
    "estimated_cost" numeric(10,2),
    "images" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "notes" "text",
    "status" "text" DEFAULT 'saved'::"text" NOT NULL,
    "converted_project_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "ideas_difficulty_valid" CHECK (("difficulty" = ANY (ARRAY['beginner'::"text", 'intermediate'::"text", 'advanced'::"text"]))),
    CONSTRAINT "ideas_status_valid" CHECK (("status" = ANY (ARRAY['saved'::"text", 'converted'::"text"])))
);


ALTER TABLE "public"."ideas" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photoshoot_projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "photoshoot_id" "uuid" NOT NULL,
    "project_id" "uuid" NOT NULL,
    "added_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."photoshoot_projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."photoshoots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "date" "date",
    "location" "text",
    "description" "text",
    "status" "text" DEFAULT 'planning'::"text" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "photoshoots_status_valid" CHECK (("status" = ANY (ARRAY['planning'::"text", 'scheduled'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."photoshoots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."project_resources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "resource_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "status" "text" DEFAULT 'needed'::"text" NOT NULL,
    "notes" "text",
    "added_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "project_resources_quantity_check" CHECK (("quantity" > 0)),
    CONSTRAINT "project_resources_status_check" CHECK (("status" = ANY (ARRAY['needed'::"text", 'acquired'::"text", 'in-progress'::"text", 'completed'::"text"])))
);


ALTER TABLE "public"."project_resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."projects" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "from_idea_id" "uuid",
    "character" "text" NOT NULL,
    "series" "text" NOT NULL,
    "status" "text" NOT NULL,
    "progress" integer DEFAULT 0 NOT NULL,
    "estimated_budget" numeric(10,2),
    "spent_budget" numeric(10,2) DEFAULT 0 NOT NULL,
    "deadline" "date",
    "description" "text",
    "cover_image" "text",
    "reference_images" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "projects_progress_check" CHECK ((("progress" >= 0) AND ("progress" <= 100))),
    CONSTRAINT "projects_spent_budget_check" CHECK (("spent_budget" >= (0)::numeric)),
    CONSTRAINT "projects_status_valid" CHECK (("status" = ANY (ARRAY['planning'::"text", 'in-progress'::"text", 'completed'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."projects" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."resources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "images" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "cost" numeric(10,2),
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "notes" "text",
    "metadata" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "resources_category_valid" CHECK ((("metadata" ->> 'category'::"text") = ANY (ARRAY['prop'::"text", 'fabric'::"text", 'wig'::"text", 'pattern'::"text", 'costume-piece'::"text", 'accessory'::"text", 'material'::"text"])))
);


ALTER TABLE "public"."resources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."shots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "photoshoot_id" "uuid" NOT NULL,
    "description" "text" NOT NULL,
    "pose" "text",
    "reference_image" "text",
    "completed" boolean DEFAULT false NOT NULL,
    "final_photos" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "order_index" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."shots" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tasks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "project_id" "uuid" NOT NULL,
    "resource_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "completed" boolean DEFAULT false NOT NULL,
    "due_date" "date",
    "priority" "text" DEFAULT 'medium'::"text" NOT NULL,
    "assigned_to" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tasks_priority_valid" CHECK (("priority" = ANY (ARRAY['low'::"text", 'medium'::"text", 'high'::"text"])))
);


ALTER TABLE "public"."tasks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text" NOT NULL,
    "invited_by" "uuid",
    "invited_at" timestamp with time zone,
    "joined_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "team_members_role_valid" CHECK (("role" = ANY (ARRAY['owner'::"text", 'editor'::"text", 'viewer'::"text"]))),
    CONSTRAINT "team_members_status_valid" CHECK (("status" = ANY (ARRAY['invited'::"text", 'active'::"text", 'inactive'::"text"])))
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "type" "text" DEFAULT 'personal'::"text" NOT NULL,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "teams_type_valid" CHECK (("type" = ANY (ARRAY['personal'::"text", 'private'::"text"])))
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."tools" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "team_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "images" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "notes" "text",
    "metadata" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "tools_category_valid" CHECK ((("metadata" ->> 'category'::"text") = ANY (ARRAY['crafting-tool'::"text", 'shoot-equipment'::"text"])))
);


ALTER TABLE "public"."tools" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "name" "text",
    "avatar_url" "text",
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."crew_members"
    ADD CONSTRAINT "crew_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ideas"
    ADD CONSTRAINT "ideas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photoshoot_projects"
    ADD CONSTRAINT "photoshoot_projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."photoshoot_projects"
    ADD CONSTRAINT "photoshoot_projects_unique" UNIQUE ("photoshoot_id", "project_id");



ALTER TABLE ONLY "public"."photoshoots"
    ADD CONSTRAINT "photoshoots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_resources"
    ADD CONSTRAINT "project_resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."project_resources"
    ADD CONSTRAINT "project_resources_unique" UNIQUE ("project_id", "resource_id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."shots"
    ADD CONSTRAINT "shots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_unique" UNIQUE ("team_id", "user_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."tools"
    ADD CONSTRAINT "tools_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_comments_entity" ON "public"."comments" USING "btree" ("entity_type", "entity_id");



CREATE INDEX "idx_comments_user" ON "public"."comments" USING "btree" ("user_id");



CREATE INDEX "idx_crew_members_photoshoot" ON "public"."crew_members" USING "btree" ("photoshoot_id");



CREATE INDEX "idx_ideas_difficulty" ON "public"."ideas" USING "btree" ("team_id", "difficulty");



CREATE INDEX "idx_ideas_status" ON "public"."ideas" USING "btree" ("team_id", "status");



CREATE INDEX "idx_ideas_tags" ON "public"."ideas" USING "gin" ("tags");



CREATE INDEX "idx_ideas_team" ON "public"."ideas" USING "btree" ("team_id");



CREATE INDEX "idx_photoshoot_projects_photoshoot" ON "public"."photoshoot_projects" USING "btree" ("photoshoot_id");



CREATE INDEX "idx_photoshoot_projects_project" ON "public"."photoshoot_projects" USING "btree" ("project_id");



CREATE INDEX "idx_photoshoots_date" ON "public"."photoshoots" USING "btree" ("team_id", "date");



CREATE INDEX "idx_photoshoots_status" ON "public"."photoshoots" USING "btree" ("team_id", "status");



CREATE INDEX "idx_photoshoots_team" ON "public"."photoshoots" USING "btree" ("team_id");



CREATE INDEX "idx_project_resources_project" ON "public"."project_resources" USING "btree" ("project_id");



CREATE INDEX "idx_project_resources_resource" ON "public"."project_resources" USING "btree" ("resource_id");



CREATE INDEX "idx_projects_deadline" ON "public"."projects" USING "btree" ("team_id", "deadline");



CREATE INDEX "idx_projects_status" ON "public"."projects" USING "btree" ("team_id", "status");



CREATE INDEX "idx_projects_tags" ON "public"."projects" USING "gin" ("tags");



CREATE INDEX "idx_projects_team" ON "public"."projects" USING "btree" ("team_id");



CREATE INDEX "idx_resources_category" ON "public"."resources" USING "btree" ("team_id", (("metadata" ->> 'category'::"text")));



CREATE INDEX "idx_resources_tags" ON "public"."resources" USING "gin" ("tags");



CREATE INDEX "idx_resources_team" ON "public"."resources" USING "btree" ("team_id");



CREATE INDEX "idx_shots_photoshoot" ON "public"."shots" USING "btree" ("photoshoot_id", "order_index");



CREATE INDEX "idx_tasks_assigned" ON "public"."tasks" USING "btree" ("assigned_to");



CREATE INDEX "idx_tasks_due_date" ON "public"."tasks" USING "btree" ("due_date");



CREATE INDEX "idx_tasks_project" ON "public"."tasks" USING "btree" ("project_id");



CREATE INDEX "idx_tasks_resource" ON "public"."tasks" USING "btree" ("resource_id");



CREATE INDEX "idx_team_members_team" ON "public"."team_members" USING "btree" ("team_id");



CREATE INDEX "idx_team_members_user" ON "public"."team_members" USING "btree" ("user_id");



CREATE INDEX "idx_teams_created_by" ON "public"."teams" USING "btree" ("created_by");



CREATE INDEX "idx_tools_category" ON "public"."tools" USING "btree" ("team_id", (("metadata" ->> 'category'::"text")));



CREATE INDEX "idx_tools_tags" ON "public"."tools" USING "gin" ("tags");



CREATE INDEX "idx_tools_team" ON "public"."tools" USING "btree" ("team_id");



CREATE OR REPLACE TRIGGER "update_comments_updated_at" BEFORE UPDATE ON "public"."comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_ideas_updated_at" BEFORE UPDATE ON "public"."ideas" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_photoshoots_updated_at" BEFORE UPDATE ON "public"."photoshoots" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_projects_updated_at" BEFORE UPDATE ON "public"."projects" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_resources_updated_at" BEFORE UPDATE ON "public"."resources" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tasks_updated_at" BEFORE UPDATE ON "public"."tasks" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_team_members_updated_at" BEFORE UPDATE ON "public"."team_members" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_teams_updated_at" BEFORE UPDATE ON "public"."teams" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_tools_updated_at" BEFORE UPDATE ON "public"."tools" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."comments"
    ADD CONSTRAINT "comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."crew_members"
    ADD CONSTRAINT "crew_members_photoshoot_id_fkey" FOREIGN KEY ("photoshoot_id") REFERENCES "public"."photoshoots"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ideas"
    ADD CONSTRAINT "ideas_converted_project_fk" FOREIGN KEY ("converted_project_id") REFERENCES "public"."projects"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."ideas"
    ADD CONSTRAINT "ideas_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photoshoot_projects"
    ADD CONSTRAINT "photoshoot_projects_photoshoot_id_fkey" FOREIGN KEY ("photoshoot_id") REFERENCES "public"."photoshoots"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photoshoot_projects"
    ADD CONSTRAINT "photoshoot_projects_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."photoshoots"
    ADD CONSTRAINT "photoshoots_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_resources"
    ADD CONSTRAINT "project_resources_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."project_resources"
    ADD CONSTRAINT "project_resources_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_from_idea_id_fkey" FOREIGN KEY ("from_idea_id") REFERENCES "public"."ideas"("id");



ALTER TABLE ONLY "public"."projects"
    ADD CONSTRAINT "projects_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."resources"
    ADD CONSTRAINT "resources_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."shots"
    ADD CONSTRAINT "shots_photoshoot_id_fkey" FOREIGN KEY ("photoshoot_id") REFERENCES "public"."photoshoots"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."tasks"
    ADD CONSTRAINT "tasks_resource_id_fkey" FOREIGN KEY ("resource_id") REFERENCES "public"."resources"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id");



ALTER TABLE ONLY "public"."tools"
    ADD CONSTRAINT "tools_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "comments_insert" ON "public"."comments" FOR INSERT WITH CHECK (
CASE "entity_type"
    WHEN 'project'::"text" THEN ("entity_id" IN ( SELECT "projects"."id"
       FROM "public"."projects"
      WHERE ("projects"."team_id" IN ( SELECT "team_members"."team_id"
               FROM "public"."team_members"
              WHERE ("team_members"."user_id" = "auth"."uid"())))))
    WHEN 'resource'::"text" THEN ("entity_id" IN ( SELECT "resources"."id"
       FROM "public"."resources"
      WHERE ("resources"."team_id" IN ( SELECT "team_members"."team_id"
               FROM "public"."team_members"
              WHERE ("team_members"."user_id" = "auth"."uid"())))))
    WHEN 'idea'::"text" THEN ("entity_id" IN ( SELECT "ideas"."id"
       FROM "public"."ideas"
      WHERE ("ideas"."team_id" IN ( SELECT "team_members"."team_id"
               FROM "public"."team_members"
              WHERE ("team_members"."user_id" = "auth"."uid"())))))
    WHEN 'tool'::"text" THEN ("entity_id" IN ( SELECT "tools"."id"
       FROM "public"."tools"
      WHERE ("tools"."team_id" IN ( SELECT "team_members"."team_id"
               FROM "public"."team_members"
              WHERE ("team_members"."user_id" = "auth"."uid"())))))
    WHEN 'photoshoot'::"text" THEN ("entity_id" IN ( SELECT "photoshoots"."id"
       FROM "public"."photoshoots"
      WHERE ("photoshoots"."team_id" IN ( SELECT "team_members"."team_id"
               FROM "public"."team_members"
              WHERE ("team_members"."user_id" = "auth"."uid"())))))
    ELSE false
END);



CREATE POLICY "comments_select" ON "public"."comments" FOR SELECT USING (
CASE "entity_type"
    WHEN 'project'::"text" THEN ("entity_id" IN ( SELECT "projects"."id"
       FROM "public"."projects"
      WHERE ("projects"."team_id" IN ( SELECT "team_members"."team_id"
               FROM "public"."team_members"
              WHERE ("team_members"."user_id" = "auth"."uid"())))))
    WHEN 'resource'::"text" THEN ("entity_id" IN ( SELECT "resources"."id"
       FROM "public"."resources"
      WHERE ("resources"."team_id" IN ( SELECT "team_members"."team_id"
               FROM "public"."team_members"
              WHERE ("team_members"."user_id" = "auth"."uid"())))))
    WHEN 'idea'::"text" THEN ("entity_id" IN ( SELECT "ideas"."id"
       FROM "public"."ideas"
      WHERE ("ideas"."team_id" IN ( SELECT "team_members"."team_id"
               FROM "public"."team_members"
              WHERE ("team_members"."user_id" = "auth"."uid"())))))
    WHEN 'tool'::"text" THEN ("entity_id" IN ( SELECT "tools"."id"
       FROM "public"."tools"
      WHERE ("tools"."team_id" IN ( SELECT "team_members"."team_id"
               FROM "public"."team_members"
              WHERE ("team_members"."user_id" = "auth"."uid"())))))
    WHEN 'photoshoot'::"text" THEN ("entity_id" IN ( SELECT "photoshoots"."id"
       FROM "public"."photoshoots"
      WHERE ("photoshoots"."team_id" IN ( SELECT "team_members"."team_id"
               FROM "public"."team_members"
              WHERE ("team_members"."user_id" = "auth"."uid"())))))
    ELSE false
END);



ALTER TABLE "public"."crew_members" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ideas" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "ideas_delete" ON "public"."ideas" FOR DELETE USING (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("team_members"."status" = 'active'::"text")))));



CREATE POLICY "ideas_insert" ON "public"."ideas" FOR INSERT WITH CHECK (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("team_members"."status" = 'active'::"text")))));



CREATE POLICY "ideas_select" ON "public"."ideas" FOR SELECT USING (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"text")))));



CREATE POLICY "ideas_update" ON "public"."ideas" FOR UPDATE USING (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("team_members"."status" = 'active'::"text")))));



ALTER TABLE "public"."photoshoot_projects" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."photoshoots" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "photoshoots_delete" ON "public"."photoshoots" FOR DELETE USING (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("team_members"."status" = 'active'::"text")))));



CREATE POLICY "photoshoots_insert" ON "public"."photoshoots" FOR INSERT WITH CHECK (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("team_members"."status" = 'active'::"text")))));



CREATE POLICY "photoshoots_select" ON "public"."photoshoots" FOR SELECT USING (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"text")))));



CREATE POLICY "photoshoots_update" ON "public"."photoshoots" FOR UPDATE USING (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("team_members"."status" = 'active'::"text")))));



ALTER TABLE "public"."project_resources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."projects" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "projects_delete" ON "public"."projects" FOR DELETE USING (("public"."get_user_team_role"("team_id", "auth"."uid"()) = ANY (ARRAY['owner'::"text", 'editor'::"text"])));



CREATE POLICY "projects_insert" ON "public"."projects" FOR INSERT WITH CHECK (("public"."get_user_team_role"("team_id", "auth"."uid"()) = ANY (ARRAY['owner'::"text", 'editor'::"text"])));



CREATE POLICY "projects_select" ON "public"."projects" FOR SELECT USING (("public"."get_user_team_role"("team_id", "auth"."uid"()) = ANY (ARRAY['owner'::"text", 'editor'::"text", 'viewer'::"text"])));



CREATE POLICY "projects_update" ON "public"."projects" FOR UPDATE USING (("public"."get_user_team_role"("team_id", "auth"."uid"()) = ANY (ARRAY['owner'::"text", 'editor'::"text"])));



ALTER TABLE "public"."resources" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "resources_delete" ON "public"."resources" FOR DELETE USING (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("team_members"."status" = 'active'::"text")))));



CREATE POLICY "resources_insert" ON "public"."resources" FOR INSERT WITH CHECK (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("team_members"."status" = 'active'::"text")))));



CREATE POLICY "resources_select" ON "public"."resources" FOR SELECT USING (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"text")))));



CREATE POLICY "resources_update" ON "public"."resources" FOR UPDATE USING (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("team_members"."status" = 'active'::"text")))));



ALTER TABLE "public"."shots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tasks_delete" ON "public"."tasks" FOR DELETE USING (("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE ("projects"."team_id" IN ( SELECT "team_members"."team_id"
           FROM "public"."team_members"
          WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("team_members"."status" = 'active'::"text")))))));



CREATE POLICY "tasks_insert" ON "public"."tasks" FOR INSERT WITH CHECK (("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE ("projects"."team_id" IN ( SELECT "team_members"."team_id"
           FROM "public"."team_members"
          WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("team_members"."status" = 'active'::"text")))))));



CREATE POLICY "tasks_select" ON "public"."tasks" FOR SELECT USING (("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE ("projects"."team_id" IN ( SELECT "team_members"."team_id"
           FROM "public"."team_members"
          WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"text")))))));



CREATE POLICY "tasks_update" ON "public"."tasks" FOR UPDATE USING (("project_id" IN ( SELECT "projects"."id"
   FROM "public"."projects"
  WHERE ("projects"."team_id" IN ( SELECT "team_members"."team_id"
           FROM "public"."team_members"
          WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("team_members"."status" = 'active'::"text")))))));



ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "team_members_delete" ON "public"."team_members" FOR DELETE USING (("team_id" IN ( SELECT "team_members_1"."team_id"
   FROM "public"."team_members" "team_members_1"
  WHERE (("team_members_1"."user_id" = "auth"."uid"()) AND ("team_members_1"."role" = 'owner'::"text") AND ("team_members_1"."status" = 'active'::"text")))));



CREATE POLICY "team_members_insert" ON "public"."team_members" FOR INSERT WITH CHECK (("team_id" IN ( SELECT "team_members_1"."team_id"
   FROM "public"."team_members" "team_members_1"
  WHERE (("team_members_1"."user_id" = "auth"."uid"()) AND ("team_members_1"."role" = 'owner'::"text") AND ("team_members_1"."status" = 'active'::"text")))));



CREATE POLICY "team_members_select" ON "public"."team_members" FOR SELECT USING (("team_id" IN ( SELECT "tm"."team_id"
   FROM "public"."team_members" "tm"
  WHERE (("tm"."user_id" = "auth"."uid"()) AND ("tm"."status" = 'active'::"text")))));



CREATE POLICY "team_members_update" ON "public"."team_members" FOR UPDATE USING (("team_id" IN ( SELECT "team_members_1"."team_id"
   FROM "public"."team_members" "team_members_1"
  WHERE (("team_members_1"."user_id" = "auth"."uid"()) AND ("team_members_1"."role" = 'owner'::"text") AND ("team_members_1"."status" = 'active'::"text")))));



ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "teams_delete" ON "public"."teams" FOR DELETE USING (("id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = 'owner'::"text") AND ("team_members"."status" = 'active'::"text")))));



CREATE POLICY "teams_select" ON "public"."teams" FOR SELECT USING (("id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"text")))));



CREATE POLICY "teams_update" ON "public"."teams" FOR UPDATE USING (("id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = 'owner'::"text") AND ("team_members"."status" = 'active'::"text")))));



ALTER TABLE "public"."tools" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "tools_delete" ON "public"."tools" FOR DELETE USING (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("team_members"."status" = 'active'::"text")))));



CREATE POLICY "tools_insert" ON "public"."tools" FOR INSERT WITH CHECK (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("team_members"."status" = 'active'::"text")))));



CREATE POLICY "tools_select" ON "public"."tools" FOR SELECT USING (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."status" = 'active'::"text")))));



CREATE POLICY "tools_update" ON "public"."tools" FOR UPDATE USING (("team_id" IN ( SELECT "team_members"."team_id"
   FROM "public"."team_members"
  WHERE (("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = ANY (ARRAY['owner'::"text", 'editor'::"text"])) AND ("team_members"."status" = 'active'::"text")))));



ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "users_select" ON "public"."users" FOR SELECT USING (("id" = "auth"."uid"()));



CREATE POLICY "users_update" ON "public"."users" FOR UPDATE USING (("id" = "auth"."uid"())) WITH CHECK (("id" = "auth"."uid"()));



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_project_progress"("project_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_project_progress"("project_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_project_progress"("project_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_orphaned_test_schemas"("max_age_hours" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_orphaned_test_schemas"("max_age_hours" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_orphaned_test_schemas"("max_age_hours" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."clone_schema_structure"("source_schema" "text", "target_schema" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."clone_schema_structure"("source_schema" "text", "target_schema" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."clone_schema_structure"("source_schema" "text", "target_schema" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_test_schema"("schema_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_test_schema"("schema_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_test_schema"("schema_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."drop_test_schema"("schema_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."drop_test_schema"("schema_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."drop_test_schema"("schema_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_team_role"("team_uuid" "uuid", "user_uuid" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_team_role"("team_uuid" "uuid", "user_uuid" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_team_role"("team_uuid" "uuid", "user_uuid" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."list_test_schemas"() TO "anon";
GRANT ALL ON FUNCTION "public"."list_test_schemas"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."list_test_schemas"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."comments" TO "anon";
GRANT ALL ON TABLE "public"."comments" TO "authenticated";
GRANT ALL ON TABLE "public"."comments" TO "service_role";



GRANT ALL ON TABLE "public"."crew_members" TO "anon";
GRANT ALL ON TABLE "public"."crew_members" TO "authenticated";
GRANT ALL ON TABLE "public"."crew_members" TO "service_role";



GRANT ALL ON TABLE "public"."ideas" TO "anon";
GRANT ALL ON TABLE "public"."ideas" TO "authenticated";
GRANT ALL ON TABLE "public"."ideas" TO "service_role";



GRANT ALL ON TABLE "public"."photoshoot_projects" TO "anon";
GRANT ALL ON TABLE "public"."photoshoot_projects" TO "authenticated";
GRANT ALL ON TABLE "public"."photoshoot_projects" TO "service_role";



GRANT ALL ON TABLE "public"."photoshoots" TO "anon";
GRANT ALL ON TABLE "public"."photoshoots" TO "authenticated";
GRANT ALL ON TABLE "public"."photoshoots" TO "service_role";



GRANT ALL ON TABLE "public"."project_resources" TO "anon";
GRANT ALL ON TABLE "public"."project_resources" TO "authenticated";
GRANT ALL ON TABLE "public"."project_resources" TO "service_role";



GRANT ALL ON TABLE "public"."projects" TO "anon";
GRANT ALL ON TABLE "public"."projects" TO "authenticated";
GRANT ALL ON TABLE "public"."projects" TO "service_role";



GRANT ALL ON TABLE "public"."resources" TO "anon";
GRANT ALL ON TABLE "public"."resources" TO "authenticated";
GRANT ALL ON TABLE "public"."resources" TO "service_role";



GRANT ALL ON TABLE "public"."shots" TO "anon";
GRANT ALL ON TABLE "public"."shots" TO "authenticated";
GRANT ALL ON TABLE "public"."shots" TO "service_role";



GRANT ALL ON TABLE "public"."tasks" TO "anon";
GRANT ALL ON TABLE "public"."tasks" TO "authenticated";
GRANT ALL ON TABLE "public"."tasks" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON TABLE "public"."tools" TO "anon";
GRANT ALL ON TABLE "public"."tools" TO "authenticated";
GRANT ALL ON TABLE "public"."tools" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







