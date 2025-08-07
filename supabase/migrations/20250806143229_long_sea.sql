/*
  # Fix Certificate Generation Foreign Key Error

  1. Database Changes
    - Fix the certificate generation trigger function to use actual user_id from NEW record
    - Remove hardcoded test user IDs that don't exist in profiles table
    - Add proper validation to ensure user exists before creating certificate
    - Enhanced error handling and logging

  2. Certificate Generation
    - Use NEW.user_id from the trigger context (the actual user completing the course)
    - Validate that both user and course exist before certificate creation
    - Generate proper certificate IDs based on actual data
    - Add comprehensive logging for debugging

  3. Security
    - Maintain RLS policies on certificates table
    - Ensure only valid users can generate certificates
    - Prevent duplicate certificate creation
*/

-- Drop and recreate the certificate generation function with proper user_id handling
DROP FUNCTION IF EXISTS generate_certificate() CASCADE;

CREATE OR REPLACE FUNCTION generate_certificate()
RETURNS TRIGGER AS $$
DECLARE
    course_record RECORD;
    user_record RECORD;
    cert_id TEXT;
    reg_number TEXT;
BEGIN
    -- Enhanced logging
    RAISE LOG 'Certificate generation trigger fired for user_id: %, course_id: %, certificate_earned: %, overall_progress: %', 
        NEW.user_id, NEW.course_id, NEW.certificate_earned, NEW.overall_progress;

    -- Only generate certificate if conditions are met
    IF NEW.certificate_earned = true AND NEW.overall_progress >= 100 THEN
        RAISE LOG 'Certificate generation conditions met, proceeding...';
        
        -- Validate that user exists
        SELECT * INTO user_record FROM profiles WHERE id = NEW.user_id;
        IF NOT FOUND THEN
            RAISE WARNING 'User with id % not found in profiles table', NEW.user_id;
            RETURN NEW;
        END IF;
        
        -- Validate that course exists
        SELECT * INTO course_record FROM courses WHERE id = NEW.course_id;
        IF NOT FOUND THEN
            RAISE WARNING 'Course with id % not found in courses table', NEW.course_id;
            RETURN NEW;
        END IF;
        
        RAISE LOG 'Found user: % and course: %', user_record.username, course_record.title;
        
        -- Check if certificate already exists
        IF EXISTS (
            SELECT 1 FROM certificates 
            WHERE user_id = NEW.user_id 
            AND course_id = NEW.course_id 
            AND is_valid = true
        ) THEN
            RAISE LOG 'Certificate already exists for user % and course %', NEW.user_id, NEW.course_id;
            RETURN NEW;
        END IF;
        
        -- Generate certificate ID and registry number using actual user and course data
        cert_id := 'OOG-' || 
                   UPPER(SUBSTRING(NEW.user_id::text, 1, 4)) || '-' ||
                   UPPER(SUBSTRING(NEW.course_id::text, 1, 4)) || '-' ||
                   UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8));
        
        reg_number := 'REG-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8));
        
        RAISE LOG 'Generated certificate_id: %, registry_number: %', cert_id, reg_number;
        
        -- Insert certificate with actual user data
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
                NEW.user_id,  -- Use the actual user_id from the trigger
                NEW.course_id,
                user_record.username,
                course_record.title,
                COALESCE(NEW.completed_at, NOW()),
                NOW(),
                NOW() + INTERVAL '1 year',
                reg_number,
                true,
                jsonb_build_object(
                    'completion_method', 'course_completion',
                    'progress_percentage', NEW.overall_progress,
                    'trigger_execution', 'automatic',
                    'generated_at', NOW()
                )
            );
            
            RAISE LOG 'Certificate successfully created with ID: %', cert_id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to create certificate: % %', SQLSTATE, SQLERRM;
            RAISE LOG 'Certificate creation failed for user_id: %, course_id: %, error: %', 
                NEW.user_id, NEW.course_id, SQLERRM;
        END;
        
    ELSE
        RAISE LOG 'Certificate generation conditions not met: certificate_earned=%, overall_progress=%', 
            NEW.certificate_earned, NEW.overall_progress;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS generate_certificate_trigger ON user_progress;
CREATE TRIGGER generate_certificate_trigger
    AFTER UPDATE ON user_progress
    FOR EACH ROW
    EXECUTE FUNCTION generate_certificate();

-- Add some test certificates with actual user IDs (if they exist)
-- Note: These will only insert if the user_id exists in profiles table
DO $$
DECLARE
    test_user_id UUID;
    test_course_id UUID;
BEGIN
    -- Try to find an actual user and course for testing
    SELECT id INTO test_user_id FROM profiles WHERE role IN ('student', 'admin') LIMIT 1;
    SELECT id INTO test_course_id FROM courses LIMIT 1;
    
    IF test_user_id IS NOT NULL AND test_course_id IS NOT NULL THEN
        -- Insert test certificate only if user and course exist
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
            'OOG-TEST-CERT-12345678',
            test_user_id,
            test_course_id,
            (SELECT username FROM profiles WHERE id = test_user_id),
            (SELECT title FROM courses WHERE id = test_course_id),
            NOW() - INTERVAL '1 day',
            NOW() - INTERVAL '1 day',
            NOW() + INTERVAL '1 year',
            'REG-TEST12345',
            true,
            '{"completion_method": "test_certificate", "test_data": true}'::jsonb
        ) ON CONFLICT (certificate_id) DO NOTHING;
        
        RAISE LOG 'Test certificate created for user: %, course: %', test_user_id, test_course_id;
    ELSE
        RAISE LOG 'No valid user or course found for test certificate creation';
    END IF;
END $$;