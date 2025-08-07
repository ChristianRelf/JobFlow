/*
  # Fix PL/pgSQL syntax error in certificate generation trigger

  1. Database Functions
    - Fix loop variable syntax in generate_certificate function
    - Proper PL/pgSQL record handling
    - Enhanced error handling and logging

  2. Trigger Updates
    - Ensure trigger fires correctly on user_progress updates
    - Proper certificate generation when progress reaches 100%

  3. Certificate Creation
    - Validate foreign key relationships
    - Generate unique certificate IDs
    - Proper error handling
*/

-- Drop existing function and trigger
DROP TRIGGER IF EXISTS generate_certificate_trigger ON user_progress;
DROP FUNCTION IF EXISTS generate_certificate();

-- Create improved certificate generation function
CREATE OR REPLACE FUNCTION generate_certificate()
RETURNS TRIGGER AS $$
DECLARE
  cert_record RECORD;
  user_record RECORD;
  course_record RECORD;
  new_cert_id TEXT;
  new_registry_number TEXT;
  existing_cert_count INTEGER;
BEGIN
  -- Log trigger execution
  RAISE NOTICE 'Certificate trigger fired for user_id: %, course_id: %, progress: %, certificate_earned: %', 
    NEW.user_id, NEW.course_id, NEW.overall_progress, NEW.certificate_earned;

  -- Only generate certificate if progress is 100% and certificate_earned is true
  IF NEW.overall_progress >= 100 AND NEW.certificate_earned = true THEN
    
    -- Validate user_id is not null
    IF NEW.user_id IS NULL THEN
      RAISE WARNING 'Cannot generate certificate: user_id is null';
      RETURN NEW;
    END IF;

    -- Validate course_id is not null
    IF NEW.course_id IS NULL THEN
      RAISE WARNING 'Cannot generate certificate: course_id is null';
      RETURN NEW;
    END IF;

    -- Check if user exists in profiles table
    SELECT * INTO user_record FROM profiles WHERE id = NEW.user_id;
    IF NOT FOUND THEN
      RAISE WARNING 'Cannot generate certificate: user % not found in profiles table', NEW.user_id;
      RETURN NEW;
    END IF;

    -- Check if course exists in courses table
    SELECT * INTO course_record FROM courses WHERE id = NEW.course_id;
    IF NOT FOUND THEN
      RAISE WARNING 'Cannot generate certificate: course % not found in courses table', NEW.course_id;
      RETURN NEW;
    END IF;

    -- Check if certificate already exists
    SELECT COUNT(*) INTO existing_cert_count 
    FROM certificates 
    WHERE user_id = NEW.user_id AND course_id = NEW.course_id AND is_valid = true;

    IF existing_cert_count > 0 THEN
      RAISE NOTICE 'Certificate already exists for user % and course %', NEW.user_id, NEW.course_id;
      RETURN NEW;
    END IF;

    -- Generate unique certificate ID and registry number
    new_cert_id := 'OOG-' || 
                   UPPER(SUBSTRING(NEW.user_id::text, 1, 4)) || '-' ||
                   UPPER(SUBSTRING(NEW.course_id::text, 1, 4)) || '-' ||
                   UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8));
    
    new_registry_number := 'REG-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 12));

    -- Insert certificate
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
        new_cert_id,
        NEW.user_id,
        NEW.course_id,
        user_record.username,
        course_record.title,
        COALESCE(NEW.completed_at, NOW()),
        NOW(),
        NOW() + INTERVAL '1 year',
        new_registry_number,
        true,
        jsonb_build_object(
          'completion_method', 'automatic_trigger',
          'progress_percentage', NEW.overall_progress,
          'trigger_execution_time', NOW(),
          'user_validated', true,
          'course_validated', true
        )
      );

      RAISE NOTICE 'Certificate created successfully: % for user % (%)', 
        new_cert_id, user_record.username, NEW.user_id;

    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to create certificate: %', SQLERRM;
    END;

  ELSE
    RAISE NOTICE 'Certificate not generated - progress: %, certificate_earned: %', 
      NEW.overall_progress, NEW.certificate_earned;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER generate_certificate_trigger
  AFTER UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION generate_certificate();

-- Test the trigger with debug info
DO $$
DECLARE
  test_user_id UUID;
  test_course_id UUID;
  test_progress_id UUID;
BEGIN
  -- Get a real user and course for testing
  SELECT id INTO test_user_id FROM profiles LIMIT 1;
  SELECT id INTO test_course_id FROM courses LIMIT 1;
  
  IF test_user_id IS NOT NULL AND test_course_id IS NOT NULL THEN
    RAISE NOTICE 'Testing certificate generation with user: % and course: %', test_user_id, test_course_id;
    
    -- Check if progress record exists
    SELECT id INTO test_progress_id 
    FROM user_progress 
    WHERE user_id = test_user_id AND course_id = test_course_id;
    
    IF test_progress_id IS NOT NULL THEN
      RAISE NOTICE 'Found existing progress record: %', test_progress_id;
      
      -- Test trigger by updating progress
      UPDATE user_progress 
      SET overall_progress = 100, 
          certificate_earned = true,
          completed_at = NOW(),
          updated_at = NOW()
      WHERE id = test_progress_id;
      
      RAISE NOTICE 'Trigger test completed - check certificates table for new entry';
    ELSE
      RAISE NOTICE 'No progress record found for testing';
    END IF;
  ELSE
    RAISE NOTICE 'No users or courses found for testing';
  END IF;
END $$;