/*
  # Fix user creation process

  1. Database Changes
    - Update profiles table to handle user creation properly
    - Add trigger to automatically create profiles when auth users are created
    - Fix any foreign key constraints

  2. Security
    - Ensure RLS policies allow profile creation
    - Add proper permissions for new user registration
*/

-- First, let's make sure the profiles table can handle new users properly
-- Remove the foreign key constraint if it's causing issues
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Recreate the foreign key constraint with proper cascade
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, role, status)
  VALUES (
    new.id,
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      new.raw_user_meta_data->>'preferred_username',
      new.raw_user_meta_data->>'global_name',
      new.raw_user_meta_data->>'username',
      'User' || substr(new.id::text, 1, 8)
    ),
    'applicant',
    'pending'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update RLS policies to allow profile creation during signup
DROP POLICY IF EXISTS "Users can create own profile during signup" ON profiles;
CREATE POLICY "Users can create own profile during signup"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow service role to create profiles (for the trigger)
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
CREATE POLICY "Service role can manage profiles"
  ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);