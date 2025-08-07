/*
  # Initial Database Schema for Oakridge Education Portal

  1. New Tables
    - `profiles` - User profiles linked to auth.users
    - `applications` - User applications with responses
    - `application_questions` - Dynamic application questions
    - `courses` - Course information
    - `modules` - Course modules
    - `quizzes` - Course quizzes
    - `quiz_questions` - Quiz questions
    - `user_progress` - Student progress tracking
    - `quiz_results` - Quiz completion results

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users based on roles
    - Secure data access patterns

  3. Functions
    - Custom functions for role management
    - Triggers for automatic profile creation
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('applicant', 'student', 'staff', 'admin');
CREATE TYPE user_status AS ENUM ('pending', 'accepted', 'denied');
CREATE TYPE application_status AS ENUM ('pending', 'accepted', 'denied');
CREATE TYPE question_type AS ENUM ('text', 'textarea', 'select', 'radio');
CREATE TYPE quiz_question_type AS ENUM ('multiple-choice', 'short-answer');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  discord_id text UNIQUE,
  username text NOT NULL,
  avatar text,
  role user_role DEFAULT 'applicant',
  status user_status DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

-- Application questions table
CREATE TABLE IF NOT EXISTS application_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  type question_type NOT NULL DEFAULT 'text',
  options jsonb,
  required boolean DEFAULT true,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  responses jsonb NOT NULL DEFAULT '{}',
  status application_status DEFAULT 'pending',
  reviewed_by uuid REFERENCES profiles(id),
  reviewed_at timestamptz,
  notes text,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  estimated_time integer DEFAULT 60,
  created_by uuid REFERENCES profiles(id),
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  order_index integer NOT NULL,
  type text DEFAULT 'text',
  estimated_time integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  passing_score integer DEFAULT 70,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quiz questions table
CREATE TABLE IF NOT EXISTS quiz_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question text NOT NULL,
  type quiz_question_type NOT NULL DEFAULT 'multiple-choice',
  options jsonb,
  correct_answer text NOT NULL,
  points integer DEFAULT 10,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  completed_modules jsonb DEFAULT '[]',
  overall_progress integer DEFAULT 0,
  certificate_earned boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  score integer NOT NULL,
  total_points integer NOT NULL,
  passed boolean NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}',
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Staff and admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Admins can update user roles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Application questions policies
CREATE POLICY "Everyone can read application questions"
  ON application_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage application questions"
  ON application_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Applications policies
CREATE POLICY "Users can read own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff and admins can read all applications"
  ON applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

CREATE POLICY "Staff and admins can update applications"
  ON applications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Courses policies
CREATE POLICY "Students, staff and admins can read courses"
  ON courses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('student', 'staff', 'admin')
    )
  );

CREATE POLICY "Staff and admins can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Modules policies
CREATE POLICY "Students, staff and admins can read modules"
  ON modules FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('student', 'staff', 'admin')
    )
  );

CREATE POLICY "Staff and admins can manage modules"
  ON modules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Quizzes policies
CREATE POLICY "Students, staff and admins can read quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('student', 'staff', 'admin')
    )
  );

CREATE POLICY "Staff and admins can manage quizzes"
  ON quizzes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Quiz questions policies
CREATE POLICY "Students, staff and admins can read quiz questions"
  ON quiz_questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('student', 'staff', 'admin')
    )
  );

CREATE POLICY "Staff and admins can manage quiz questions"
  ON quiz_questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- User progress policies
CREATE POLICY "Users can read own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own progress"
  ON user_progress FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Staff and admins can read all progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Quiz results policies
CREATE POLICY "Users can read own quiz results"
  ON quiz_results FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create own quiz results"
  ON quiz_results FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Staff and admins can read all quiz results"
  ON quiz_results FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('staff', 'admin')
    )
  );

-- Functions and triggers
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, discord_id, username, avatar)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'provider_id',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to all tables
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER application_questions_updated_at
  BEFORE UPDATE ON application_questions
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER modules_updated_at
  BEFORE UPDATE ON modules
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER quizzes_updated_at
  BEFORE UPDATE ON quizzes
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insert default application questions
INSERT INTO application_questions (question, type, required, order_index) VALUES
('What is your Discord username?', 'text', true, 1),
('Why do you want to join Oakridge Operations Group?', 'textarea', true, 2),
('What is your experience with Roblox?', 'select', true, 3),
('Are you available for training sessions?', 'radio', true, 4);

-- Update the select and radio questions with options
UPDATE application_questions 
SET options = '["Beginner", "Intermediate", "Advanced", "Expert"]'::jsonb
WHERE question = 'What is your experience with Roblox?';

UPDATE application_questions 
SET options = '["Yes", "No", "Sometimes"]'::jsonb
WHERE question = 'Are you available for training sessions?';