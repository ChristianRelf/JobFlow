/*
  # Fix certificate generation function with webhook notifications

  1. Database Changes
    - Drop existing trigger safely
    - Recreate generate_certificate function with webhook support
    - Recreate trigger on user_progress table
  
  2. Webhook Integration
    - Add Discord webhook notification when certificates are generated
    - Include comprehensive certificate details in webhook payload
    - Handle webhook errors gracefully without affecting certificate generation
  
  3. Security
    - Maintain existing RLS policies
    - Ensure proper error handling
    - Add logging for debugging
*/

-- Drop the trigger first
DROP TRIGGER IF EXISTS generate_certificate_trigger ON user_progress;

-- Drop and recreate the function with webhook support
DROP FUNCTION IF EXISTS generate_certificate();

CREATE OR REPLACE FUNCTION generate_certificate()
RETURNS TRIGGER AS $$
DECLARE
  course_record RECORD;
  user_record RECORD;
  cert_id TEXT;
  reg_number TEXT;
  webhook_payload JSONB;
  webhook_response TEXT;
BEGIN
  -- Only generate certificate when certificate_earned changes to true
  IF NEW.certificate_earned = true AND (OLD.certificate_earned IS NULL OR OLD.certificate_earned = false) THEN
    
    -- Get course information
    SELECT title INTO course_record FROM courses WHERE id = NEW.course_id;
    
    -- Get user information
    SELECT username, avatar INTO user_record FROM profiles WHERE id = NEW.user_id;
    
    -- Generate unique certificate ID and registry number
    cert_id := 'OOG-' || 
               UPPER(SUBSTRING(NEW.user_id::text, 1, 4)) || '-' ||
               UPPER(SUBSTRING(NEW.course_id::text, 1, 4)) || '-' ||
               UPPER(SUBSTRING(MD5(NEW.user_id::text || NEW.course_id::text || NOW()::text), 1, 8));
    
    reg_number := 'REG-' || UPPER(SUBSTRING(MD5(cert_id || NOW()::text), 1, 12));
    
    -- Insert certificate
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
        'completion_method', 'course_completion',
        'progress_percentage', NEW.overall_progress,
        'trigger_generated', true,
        'generation_timestamp', NOW()
      )
    );
    
    -- Prepare webhook payload
    webhook_payload := jsonb_build_object(
      'embeds', jsonb_build_array(
        jsonb_build_object(
          'title', '🎓 Certificate Generated',
          'description', 'A new certificate has been automatically generated',
          'color', 65280,
          'fields', jsonb_build_array(
            jsonb_build_object('name', 'Student', 'value', user_record.username, 'inline', true),
            jsonb_build_object('name', 'Course', 'value', course_record.title, 'inline', true),
            jsonb_build_object('name', 'Certificate ID', 'value', cert_id, 'inline', true),
            jsonb_build_object('name', 'Registry Number', 'value', reg_number, 'inline', true),
            jsonb_build_object('name', 'Progress', 'value', NEW.overall_progress || '%', 'inline', true),
            jsonb_build_object('name', 'Completion Date', 'value', TO_CHAR(COALESCE(NEW.completed_at, NOW()), 'YYYY-MM-DD'), 'inline', true),
            jsonb_build_object('name', 'Verification URL', 'value', 'https://oakridge.app/verify?id=' || cert_id, 'inline', false)
          ),
          'timestamp', TO_CHAR(NOW(), 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
          'footer', jsonb_build_object('text', 'Oakridge Education Portal'),
          'thumbnail', jsonb_build_object('url', COALESCE(user_record.avatar, 'https://cdn.discordapp.com/embed/avatars/0.png'))
        )
      )
    );
    
    -- Send webhook notification (don't fail if webhook fails)
    BEGIN
      SELECT content INTO webhook_response
      FROM http_post(
        'https://discord.com/api/webhooks/1402665179522531479/sEfVbBbTUiuavOv8QExrWPae_F_Tqo6z1tvYGmd2VmIdUcAgxZKoMFm6YSD5AipcyukO',
        webhook_payload::text,
        'application/json'
      );
      
      -- Log successful webhook
      RAISE NOTICE 'Certificate webhook sent successfully for certificate: %', cert_id;
      
    EXCEPTION WHEN OTHERS THEN
      -- Log webhook failure but don't fail the certificate generation
      RAISE WARNING 'Failed to send certificate webhook for %: %', cert_id, SQLERRM;
    END;
    
    -- Log certificate generation
    RAISE NOTICE 'Certificate generated: % for user % completing course %', cert_id, user_record.username, course_record.title;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER generate_certificate_trigger
  AFTER UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION generate_certificate();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION generate_certificate() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_certificate() TO service_role;