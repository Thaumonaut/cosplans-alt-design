-- Migration: Store money values as cents (integers) to avoid floating point errors
-- This is a modern best practice for handling money in applications

-- Update ideas table: convert estimated_cost from DECIMAL to INTEGER (cents)
ALTER TABLE ideas 
  ALTER COLUMN estimated_cost TYPE INTEGER USING (CASE WHEN estimated_cost IS NULL THEN NULL ELSE (estimated_cost * 100)::INTEGER END);

-- Update projects table: convert estimated_budget and spent_budget from DECIMAL to INTEGER (cents)
ALTER TABLE projects 
  ALTER COLUMN estimated_budget TYPE INTEGER USING (CASE WHEN estimated_budget IS NULL THEN NULL ELSE (estimated_budget * 100)::INTEGER END);

ALTER TABLE projects 
  ALTER COLUMN spent_budget TYPE INTEGER USING (CASE WHEN spent_budget IS NULL THEN NULL ELSE (spent_budget * 100)::INTEGER END);

-- Update resources table: convert cost from DECIMAL to INTEGER (cents)
ALTER TABLE resources 
  ALTER COLUMN cost TYPE INTEGER USING (CASE WHEN cost IS NULL THEN NULL ELSE (cost * 100)::INTEGER END);

-- Add comments to document this change
COMMENT ON COLUMN ideas.estimated_cost IS 'Cost stored in cents as integer to avoid floating point errors. Display: value / 100';
COMMENT ON COLUMN projects.estimated_budget IS 'Budget stored in cents as integer to avoid floating point errors. Display: value / 100';
COMMENT ON COLUMN projects.spent_budget IS 'Budget stored in cents as integer to avoid floating point errors. Display: value / 100';
COMMENT ON COLUMN resources.cost IS 'Cost stored in cents as integer to avoid floating point errors. Display: value / 100';

