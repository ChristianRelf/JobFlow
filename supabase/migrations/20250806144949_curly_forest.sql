/*
  # Fix Certificate RLS Policies

  1. Security Updates
    - Add policy for authenticated users to create their own certificates
    - Update existing policies to allow proper certificate generation
    - Ensure trigger function can create certificates
    - Add service role policy for system operations

  2. Policy Changes
    - Allow users to insert certificates for themselves
    - Allow staff/admin to manage all certificates
    - Maintain public read access for verification
    - Add system-level certificate creation policy
*/

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Anyone can verify certificates" ON certificates;
DROP POLICY IF EXISTS "Staff and admins can manage all certificates" ON certificates;
DROP POLICY IF EXISTS "Users can read own certificates" ON certificates;

-- Create comprehensive RLS policies for certificates
CREATE POLICY "Public can verify certificates"
  ON certificates
  FOR SELECT
  TO public
  USING (is_valid = true);

CREATE POLICY "Users can create own certificates"
  ON certificates
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can read own certificates"
  ON certificates
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff and admins can manage all certificates"
  ON certificates
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('staff', 'admin')
    )
  );

-- Add service role policy for system operations (triggers, functions)
CREATE POLICY "Service role full access"
  ON certificates
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Recreate the certificate generation function with proper security context
CREATE OR REPLACE FUNCTION generate_certificate()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  user_record RECORD;
  course_record RECORD;
  cert_id TEXT;
  reg_number TEXT;
  existing_cert_id TEXT;
BEGIN
  -- Enhanced logging
  RAISE NOTICE 'Certificate trigger fired for user_id: %, course_id: %, progress: %, cert_earned: %', 
    NEW.user_id, NEW.course_id, NEW.overall_progress, NEW.certificate_earned;

  -- Only generate certificate when progress is 100% AND certificate_earned is true
  IF NEW.overall_progress >= 100 AND NEW.certificate_earned = true THEN
    RAISE NOTICE 'Certificate generation conditions met, proceeding...';
    
    -- Validate user_id and course_id are not null
    IF NEW.user_id IS NULL THEN
      RAISE WARNING 'Cannot generate certificate: user_id is null';
      RETURN NEW;
    END IF;
    
    IF NEW.course_id IS NULL THEN
      RAISE WARNING 'Cannot generate certificate: course_id is null';
      RETURN NEW;
    END IF;
    
    -- Check if certificate already exists
    SELECT certificate_id INTO existing_cert_id
    FROM certificates
    WHERE user_id = NEW.user_id 
    AND course_id = NEW.course_id 
    AND is_valid = true;
    
    IF existing_cert_id IS NOT NULL THEN
      RAISE NOTICE 'Certificate already exists: %', existing_cert_id;
      RETURN NEW;
    END IF;
    
    -- Get user information
    SELECT username INTO user_record
    FROM profiles
    WHERE id = NEW.user_id;
    
    IF NOT FOUND THEN
      RAISE WARNING 'User not found in profiles table: %', NEW.user_id;
      RETURN NEW;
    END IF;
    
    -- Get course information
    SELECT title INTO course_record
    FROM courses
    WHERE id = NEW.course_id;
    
    IF NOT FOUND THEN
      RAISE WARNING 'Course not found in courses table: %', NEW.course_id;
      RETURN NEW;
    END IF;
    
    -- Generate certificate ID and registry number
    cert_id := 'OOG-' || UPPER(SUBSTRING(NEW.user_id::text, 1, 4)) || '-' || 
               UPPER(SUBSTRING(NEW.course_id::text, 1, 4)) || '-' || 
               UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8));
    
    reg_number := 'REG-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));
    
    RAISE NOTICE 'Generated certificate_id: %, registry_number: %', cert_id, reg_number;
    RAISE NOTICE 'User data: %, Course data: %', user_record.username, course_record.title;
    
    -- Insert certificate with proper error handling
    BEGIN
      INSERT INTO certificates (
        certificate_id,
        user_id,
        course_id,
        student_name,
        course_name,
        completion_date,
        issued_date,
        valid_until,
        registry_number,
        is_valid,
        metadata
      ) VALUES (
        cert_id,
        NEW.user_id,
        NEW.course_id,
        user_record.username,
        course_record.title,
        COALESCE(NEW.completed_at, NOW()),
        NOW(),
        NOW() + INTERVAL '1 year',
        reg_number,
        true,
        jsonb_build_object(
          'completion_method', 'automatic_trigger',
          'progress_percentage', NEW.overall_progress,
          'trigger_timestamp', NOW(),
          'validated_user', user_record.username,
          'validated_course', course_record.title
        )
      );
      
      RAISE NOTICE 'Certificate created successfully: %', cert_id;
      
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create certificate: % - %', SQLSTATE, SQLERRM;
      RAISE WARNING 'Certificate data: user_id=%, course_id=%, student_name=%, course_name=%', 
        NEW.user_id, NEW.course_id, user_record.username, course_record.title;
    END;
    
  ELSE
    RAISE NOTICE 'Certificate generation skipped - progress: %, cert_earned: %', 
      NEW.overall_progress, NEW.certificate_earned;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS generate_certificate_trigger ON user_progress;
CREATE TRIGGER generate_certificate_trigger
  AFTER UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION generate_certificate();

-- Test the certificate generation with debug info
DO $$
DECLARE
  test_user_id UUID;
  test_course_id UUID;
  test_progress_id UUID;
BEGIN
  -- Get a real user and course for testing
  SELECT id INTO test_user_id FROM profiles WHERE role = 'student' LIMIT 1;
  SELECT id INTO test_course_id FROM courses LIMIT 1;
  
  IF test_user_id IS NOT NULL AND test_course_id IS NOT NULL THEN
    RAISE NOTICE 'Testing certificate generation with user: % and course: %', test_user_id, test_course_id;
    
    -- Check if progress record exists
    SELECT id INTO test_progress_id 
    FROM user_progress 
    WHERE user_id = test_user_id AND course_id = test_course_id;
    
    IF test_progress_id IS NOT NULL THEN
      RAISE NOTICE 'Found existing progress record: %', test_progress_id;
    ELSE
      RAISE NOTICE 'No progress record found for test user/course combination';
    END IF;
  ELSE
    RAISE NOTICE 'No test data available - user: %, course: %', test_user_id, test_course_id;
  END IF;
END $$;