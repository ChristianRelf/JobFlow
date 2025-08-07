/*
  # Create certificates system

  1. New Tables
    - `certificates`
      - `id` (uuid, primary key)
      - `certificate_id` (text, unique) - Public certificate identifier
      - `user_id` (uuid) - References profiles(id)
      - `course_id` (uuid) - References courses(id)
      - `student_name` (text) - Student name at time of completion
      - `course_name` (text) - Course name at time of completion
      - `completion_date` (timestamp) - When course was completed
      - `issued_date` (timestamp) - When certificate was issued
      - `valid_until` (timestamp) - Certificate expiration date
      - `registry_number` (text, unique) - Additional verification number
      - `is_valid` (boolean) - Whether certificate is still valid
      - `metadata` (jsonb) - Additional certificate data
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `certificates` table
    - Add policy for public certificate verification
    - Add policies for authenticated users to manage their certificates
    - Add policies for staff/admin to manage all certificates

  3. Functions
    - Create function to automatically generate certificates when courses are completed
    - Create trigger to call function when user_progress.certificate_earned = true

  4. Sample Data
    - Insert founder certificate for chrxs_dev
*/

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  certificate_id text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  student_name text NOT NULL,
  course_name text NOT NULL,
  completion_date timestamptz NOT NULL,
  issued_date timestamptz DEFAULT now(),
  valid_until timestamptz NOT NULL,
  registry_number text UNIQUE NOT NULL,
  is_valid boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can verify certificates"
  ON certificates
  FOR SELECT
  TO public
  USING (is_valid = true);

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
  );

-- Create updated_at trigger
CREATE TRIGGER certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Create function to generate certificate
CREATE OR REPLACE FUNCTION generate_certificate()
RETURNS TRIGGER AS $$
DECLARE
  student_profile profiles%ROWTYPE;
  course_record courses%ROWTYPE;
  cert_id text;
  reg_number text;
  user_prefix text;
  course_prefix text;
  random_suffix text;
BEGIN
  -- Only generate certificate if certificate_earned is being set to true
  IF NEW.certificate_earned = true AND (OLD.certificate_earned IS NULL OR OLD.certificate_earned = false) THEN
    
    -- Get student profile
    SELECT * INTO student_profile
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- Get course details
    SELECT * INTO course_record
    FROM courses
    WHERE id = NEW.course_id;
    
    -- Generate certificate ID components
    user_prefix := UPPER(SUBSTRING(REPLACE(student_profile.id::text, '-', ''), 1, 4));
    course_prefix := UPPER(SUBSTRING(REPLACE(course_record.id::text, '-', ''), 1, 4));
    random_suffix := UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 8));
    
    -- Create certificate ID
    cert_id := 'OOG-' || user_prefix || '-' || course_prefix || '-' || random_suffix;
    
    -- Create registry number
    reg_number := 'REG-' || random_suffix;
    
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
      student_profile.username,
      course_record.title,
      COALESCE(NEW.completed_at, now()),
      now(),
      now() + interval '1 year',
      reg_number,
      true,
      jsonb_build_object(
        'course_estimated_time', course_record.estimated_time,
        'completion_progress', NEW.overall_progress,
        'issued_by', 'system'
      )
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic certificate generation
DROP TRIGGER IF EXISTS generate_certificate_trigger ON user_progress;
CREATE TRIGGER generate_certificate_trigger
  AFTER UPDATE ON user_progress
  FOR EACH ROW
  EXECUTE FUNCTION generate_certificate();

-- Insert founder certificate for chrxs_dev
DO $$
DECLARE
  chrxs_user_id uuid;
  sample_course_id uuid;
BEGIN
  -- Get chrxs_dev user ID (if exists)
  SELECT id INTO chrxs_user_id
  FROM profiles
  WHERE username = 'chrxs_dev'
  LIMIT 1;
  
  -- Create a sample course if none exists
  INSERT INTO courses (
    id,
    title,
    description,
    estimated_time,
    is_published,
    created_by
  ) VALUES (
    gen_random_uuid(),
    'Nuclear Operations Fundamentals',
    'Comprehensive training in nuclear reactor operations, safety protocols, and emergency procedures.',
    120,
    true,
    chrxs_user_id
  )
  ON CONFLICT DO NOTHING
  RETURNING id INTO sample_course_id;
  
  -- If course already exists, get its ID
  IF sample_course_id IS NULL THEN
    SELECT id INTO sample_course_id
    FROM courses
    WHERE title = 'Nuclear Operations Fundamentals'
    LIMIT 1;
  END IF;
  
  -- Insert founder certificate if chrxs_dev exists
  IF chrxs_user_id IS NOT NULL AND sample_course_id IS NOT NULL THEN
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
      'OOG-661D-3777-ME00E1BL',
      chrxs_user_id,
      sample_course_id,
      'chrxs_dev',
      'Nuclear Operations Fundamentals',
      '2024-12-15T10:00:00Z',
      '2024-12-15T10:00:00Z',
      '2026-01-15T10:00:00Z',
      'REG-ME00E1BL',
      true,
      jsonb_build_object(
        'course_estimated_time', 120,
        'completion_progress', 100,
        'issued_by', 'system',
        'special_recognition', 'Founder Certificate'
      )
    )
    ON CONFLICT (certificate_id) DO UPDATE SET
      student_name = EXCLUDED.student_name,
      course_name = EXCLUDED.course_name,
      metadata = EXCLUDED.metadata,
      updated_at = now();
  END IF;
END $$;