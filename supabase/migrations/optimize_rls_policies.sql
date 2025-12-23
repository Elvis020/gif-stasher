-- Optimize RLS policies for performance
-- Replace auth.uid() with (select auth.uid()) to evaluate once per query instead of per row
-- This significantly improves query performance at scale

-- =====================================================
-- LINKS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own links" ON links;
DROP POLICY IF EXISTS "Users can create own links" ON links;
DROP POLICY IF EXISTS "Users can update own links" ON links;
DROP POLICY IF EXISTS "Users can delete own links" ON links;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can view own links"
  ON links FOR SELECT
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own links"
  ON links FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own links"
  ON links FOR UPDATE
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own links"
  ON links FOR DELETE
  USING (user_id = (select auth.uid()));

-- =====================================================
-- FOLDERS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own folders" ON folders;
DROP POLICY IF EXISTS "Users can create own folders" ON folders;
DROP POLICY IF EXISTS "Users can update own folders" ON folders;
DROP POLICY IF EXISTS "Users can delete own folders" ON folders;

-- Recreate with optimized auth function calls
CREATE POLICY "Users can view own folders"
  ON folders FOR SELECT
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create own folders"
  ON folders FOR INSERT
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own folders"
  ON folders FOR UPDATE
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own folders"
  ON folders FOR DELETE
  USING (user_id = (select auth.uid()));

-- Add comment explaining the optimization
COMMENT ON POLICY "Users can view own links" ON links IS
  'Optimized RLS: Uses (select auth.uid()) for better performance at scale';
COMMENT ON POLICY "Users can view own folders" ON folders IS
  'Optimized RLS: Uses (select auth.uid()) for better performance at scale';
