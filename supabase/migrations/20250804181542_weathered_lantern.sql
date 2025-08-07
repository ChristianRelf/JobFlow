/*
  # Fix infinite recursion in profiles RLS policies

  1. Security Changes
    - Drop existing problematic policies that cause recursion
    - Create new simplified policies that don't reference profiles table within policies
    - Ensure policies use auth.uid() directly without subqueries to profiles table

  2. Policy Changes
    - Users can read/update their own profile using direct auth.uid() comparison
    - Service role maintains full access
    - Staff/admin access simplified to avoid recursion
*/

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile during signup" ON profiles;
DROP POLICY IF EXISTS "Staff and admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;

-- Create new non-recursive policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Service role gets full access (no recursion risk)
CREATE POLICY "Service role full access"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- For staff/admin access, we'll handle this in the application layer
-- to avoid recursion issues with checking roles within RLS policies