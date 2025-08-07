import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface UserProgress {
  id: string;
  user_id: string;
  course_id: string;
  completed_modules: any;
  overall_progress: number;
  certificate_earned: boolean;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuizResult {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  total_points: number;
  passed: boolean;
  answers: any;
  completed_at: string;
  created_at: string;
}

export function useSupabaseProgress() {
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProgress = async (fetchAllUsers = false) => {
    if (!supabase) {
      console.log('fetchProgress: Supabase not available, using empty state');
      setUserProgress([]);
      setQuizResults([]);
      setLoading(false);
      return;
    }

    if (!user?.id && !fetchAllUsers) {
      console.log('fetchProgress: User not available, waiting...');
      setUserProgress([]);
      setQuizResults([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching progress for user:', fetchAllUsers ? 'all users' : user?.id);
      
      // Optimize progress query - fetch only essential fields
      let progressQuery = supabase
        .from('user_progress')
        .select(`
          id,
          user_id,
          course_id,
          completed_modules,
          overall_progress,
          certificate_earned,
          started_at,
          completed_at,
          created_at,
          updated_at
        `);
      
      if (!fetchAllUsers && user?.id) {
        progressQuery = progressQuery.eq('user_id', user.id);
      }
      
      const { data: progressData, error: progressError } = await progressQuery
        .order('created_at', { ascending: false });

      if (progressError) {
        console.error('Error fetching progress:', progressError);
        setError(progressError.message);
        setUserProgress([]);
        setQuizResults([]);
        return;
      }

      console.log('User progress data:', progressData);

      // Optimize quiz results query - only fetch if needed
      let quizData: any[] = [];
      if (progressData && progressData.length > 0) {
        let quizQuery = supabase
        .from('quiz_results')
          .select(`
            id,
            user_id,
            quiz_id,
            score,
            total_points,
            passed,
            completed_at,
            created_at
          `);
      
        if (!fetchAllUsers && user?.id) {
          quizQuery = quizQuery.eq('user_id', user.id);
        }
      
        const { data: quizResults, error: quizError } = await quizQuery
          .order('completed_at', { ascending: false });

        if (quizError) {
          console.error('Error fetching quiz results:', quizError);
          setError(quizError.message);
          setUserProgress(progressData || []);
          setQuizResults([]);
          return;
        }
        
        quizData = quizResults || [];
      }

      console.log('Quiz results data:', quizData);

      setUserProgress(progressData || []);
      setQuizResults(quizData);
      setError(null);
    } catch (err) {
      console.error('Error in fetchProgress:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setUserProgress([]);
      setQuizResults([]);
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId: string) => {
    if (!supabase || !user) {
      console.error('enrollInCourse: Missing requirements', { supabase: !!supabase, user: !!user });
      throw new Error('Supabase not available or user not authenticated');
    }

    // Validate course ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!courseId || !uuidRegex.test(courseId)) {
      throw new Error('Invalid course ID format');
    }
    try {
      console.log('Enrolling user in course:', { userId: user.id, courseId });
      
      // Check if already enrolled
      const { data: existingProgress } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();
      
      if (existingProgress) {
        console.log('User already enrolled in course');
        await fetchProgress();
        return existingProgress;
      }
      
      const { data, error } = await supabase
        .from('user_progress')
        .insert([{
          user_id: user.id,
          course_id: courseId,
          completed_modules: [],
          overall_progress: 0,
          certificate_earned: false,
          started_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error enrolling in course:', error);
        console.error('Enrollment error details:', error.details, error.hint);
        throw error;
      }

      await fetchProgress();
      return data;
    } catch (err) {
      console.error('Error in enrollInCourse:', err);
      throw err;
    }
  };

  const updateProgress = async (courseId: string, completedModules: string[], overallProgress: number, awardCertificate: boolean = false) => {
    if (!supabase || !user) {
      console.error('updateProgress: Missing requirements', { supabase: !!supabase, user: !!user });
      throw new Error('Supabase not available or user not authenticated');
    }

    // Validate inputs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!courseId || !uuidRegex.test(courseId)) {
      throw new Error('Invalid course ID format');
    }
    
    if (!Array.isArray(completedModules)) {
      throw new Error('Completed modules must be an array');
    }
    
    // Validate each module ID
    const sanitizedModules = completedModules.filter(moduleId => 
      typeof moduleId === 'string' && uuidRegex.test(moduleId)
    );
    
    if (typeof overallProgress !== 'number' || overallProgress < 0 || overallProgress > 100) {
      throw new Error('Invalid progress value');
    }
    
    const sanitizedProgress = Math.max(0, Math.min(100, Math.floor(overallProgress)));

    try {
      console.log('🔄 Updating progress:', { 
        courseId, 
        userId: user.id,
        completedModules: sanitizedModules, 
        overallProgress: sanitizedProgress, 
        awardCertificate 
      });
      
      const updateData: any = {
        completed_modules: sanitizedModules,
        overall_progress: sanitizedProgress,
        updated_at: new Date().toISOString()
      };

      // Only award certificate if explicitly requested (after quiz is passed)
      if (awardCertificate) {
        console.log('🏆 AWARDING CERTIFICATE - setting certificate_earned to true and completed_at');
        updateData.certificate_earned = true;
        updateData.completed_at = new Date().toISOString();
      }

      console.log('📤 Update data being sent to database:', updateData);
      console.log('🔍 Current user context:', { id: user.id, username: user.username });

      const { data, error } = await supabase
        .from('user_progress')
        .update(updateData)
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .select()
        .single();

      if (error) {
        console.error('❌ ERROR updating progress:', error);
        console.error('📋 Progress update error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          updateData: updateData,
          userId: user.id,
          courseId: courseId
        });
        throw error;
      }

      console.log('✅ Progress updated successfully:', data);
      
      // If certificate was awarded, check if it was generated in database
      if (awardCertificate && data.certificate_earned) {
        console.log('🔍 CERTIFICATE AWARDED - checking database generation...');
        
        // Wait for trigger to fire and check certificate generation
        const checkCertificateGeneration = async (attempt = 1, maxAttempts = 5) => {
          try {
            console.log(`🔍 Certificate check attempt ${attempt} for user:`, user.id, 'course:', courseId);
            console.log(`🔍 Searching for certificates with user_id: ${user.id} AND course_id: ${courseId}`);
            
            // Wait longer for first attempt to let trigger fire
            if (attempt === 1) {
              await new Promise(resolve => setTimeout(resolve, 3000)); // Increased wait time
            }
            
            const { data: certificates, error: certError } = await supabase
              .from('certificates')
              .select('*')
              .eq('user_id', user.id)
              .eq('course_id', courseId)
              .eq('is_valid', true);
            
            if (certError) {
              console.error('❌ Error querying certificates:', certError);
              return false;
            } else {
              console.log(`📜 Certificate query result (attempt ${attempt}):`, certificates);
              console.log(`📊 Found ${certificates?.length || 0} certificates for this user/course combination`);
              if (certificates && certificates.length > 0) {
                console.log('✅ CERTIFICATE FOUND IN DATABASE:', certificates[0]);
                console.log('🎉 Certificate details:', {
                  id: certificates[0].certificate_id,
                  registry: certificates[0].registry_number,
                  student: certificates[0].student_name,
                  course: certificates[0].course_name,
                  issued: certificates[0].issued_date
                });
                return true;
              } else {
                console.warn(`⚠️ NO CERTIFICATE FOUND on attempt ${attempt}`);
                
                // Debug: Check if there are ANY certificates for this user
                const { data: allUserCerts } = await supabase
                  .from('certificates')
                  .select('*')
                  .eq('user_id', user.id);
                
                console.log(`🔍 All certificates for user ${user.id}:`, allUserCerts);
                
                // If this is not the last attempt, wait and retry
                if (attempt < maxAttempts) {
                  console.log(`⏳ Waiting 4 seconds before attempt ${attempt + 1}...`);
                  await new Promise(resolve => setTimeout(resolve, 4000)); // Increased wait time
                  return await checkCertificateGeneration(attempt + 1, maxAttempts);
                }
                return false;
              }
            }
          } catch (error) {
            console.error(`❌ Error checking certificate (attempt ${attempt}):`, error);
            return false;
          }
        };
        
        // Check for certificate generation
        const certificateResult = await checkCertificateGeneration();
        
        if (!certificateResult) {
          console.warn('⚠️ Certificate not found after all attempts - creating manual fallback');
          try {
            // Get course name for manual certificate
            const { data: courseData } = await supabase
              .from('courses')
              .select('title')
              .eq('id', courseId)
              .single();
            
            const manualCert = await createManualCertificate(user.id, courseId, user.username, courseData?.title || 'Course');
            console.log('✅ Manual certificate created successfully:', manualCert);
          } catch (manualError) {
            console.error('❌ Manual certificate creation also failed:', manualError);
            throw new Error(`Certificate generation failed: ${manualError instanceof Error ? manualError.message : 'Unknown error'}`);
          }
        } else {
          console.log('🎉 Certificate generation completed successfully!');
        }
      }


      await fetchProgress();
      return data;
    } catch (err) {
      console.error('❌ CRITICAL ERROR in updateProgress:', err);
      console.error('📋 Full error context:', {
        error: err,
        userId: user.id,
        courseId: courseId,
        completedModules: sanitizedModules,
        overallProgress: sanitizedProgress,
        awardCertificate: awardCertificate
      });
      throw err;
    }
  };

  const createManualCertificate = async (userId: string, courseId: string, username: string, courseName: string = 'Course') => {
    if (!supabase) return;
    
    console.log('🔧 Creating manual certificate with params:', { userId, courseId, username, courseName });
    
    // Validate that user exists in profiles table first
    const { data: userExists, error: userCheckError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', userId)
      .single();
    
    if (userCheckError || !userExists) {
      console.error('❌ User not found in profiles table:', userId, userCheckError);
      throw new Error(`User ${userId} not found in profiles table`);
    }
    
    console.log('✅ User validated:', userExists);
    
    // Validate that course exists
    const { data: courseExists, error: courseCheckError } = await supabase
      .from('courses')
      .select('id, title')
      .eq('id', courseId)
      .single();
    
    if (courseCheckError || !courseExists) {
      console.error('❌ Course not found in courses table:', courseId, courseCheckError);
      throw new Error(`Course ${courseId} not found in courses table`);
    }
    
    console.log('✅ Course validated:', courseExists);
    
    // Check if certificate already exists
    const { data: existingCert, error: existingError } = await supabase
      .from('certificates')
      .select('certificate_id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('is_valid', true)
      .maybeSingle();
    
    if (existingCert) {
      console.log('✅ Certificate already exists:', existingCert.certificate_id);
      return existingCert;
    }
    
    try {
      const fallbackCertId = `OOG-${userId.slice(0, 4).toUpperCase()}-${courseId.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      const fallbackRegNumber = `REG-${Date.now().toString(36).toUpperCase()}`;
      
      console.log('🔧 Generated certificate ID:', fallbackCertId);
      console.log('🔧 Generated registry number:', fallbackRegNumber);
      
      // Use service role for certificate creation to bypass RLS
      const { data: { session } } = await supabase.auth.getSession();
      const serviceRoleClient = supabase;
      
      const certificateData = {
        certificate_id: fallbackCertId,
        user_id: userId,
        course_id: courseId,
        student_name: userExists.username,
        course_name: courseExists.title,
        completion_date: new Date().toISOString(),
        issued_date: new Date().toISOString(),
        valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        registry_number: fallbackRegNumber,
        is_valid: true,
        metadata: {
          completion_method: 'manual_creation',
          progress_percentage: 100,
          created_by_fallback: true,
          manual_creation_timestamp: new Date().toISOString(),
          validated_user: userExists.username,
          validated_course: courseExists.title
        }
      };
      
      console.log('🔧 Certificate data to insert:', certificateData);
      
      const { data: manualCert, error: manualError } = await serviceRoleClient
        .from('certificates')
        .insert([certificateData])
        .select()
        .single();
      
      if (manualError) {
        console.error('❌ Manual certificate creation failed:', manualError);
        console.error('❌ Manual certificate error details:', {
          message: manualError.message,
          details: manualError.details,
          hint: manualError.hint,
          code: manualError.code,
          certificateData: certificateData
        });
        throw manualError;
      } else {
        console.log('✅ MANUAL CERTIFICATE CREATED:', manualCert);
        console.log('✅ Manual certificate details:', {
          id: manualCert.certificate_id,
          registry: manualCert.registry_number,
          student: manualCert.student_name,
          course: manualCert.course_name
        });
        
        
        // Verify the certificate was actually inserted
        const { data: verifyInsert, error: verifyError } = await serviceRoleClient
          .from('certificates')
          .select('certificate_id, user_id, course_id')
          .eq('certificate_id', manualCert.certificate_id)
          .single();
        
        if (verifyInsert) {
          console.log('✅ Certificate insertion verified:', verifyInsert);
        } else {
          console.error('❌ Certificate insertion verification failed:', verifyError);
        }
        
        return manualCert;
      }
    } catch (error) {
      console.error('❌ Error in createManualCertificate:', error);
      throw error;
    }
  };

  const submitQuizResult = async (quizResult: {
    quiz_id: string;
    score: number;
    total_points: number;
    passed: boolean;
    answers: any;
  }) => {
    if (!supabase || !user) {
      console.error('submitQuizResult: Missing requirements', { supabase: !!supabase, user: !!user });
      throw new Error('Supabase not available or user not authenticated');
    }

    // Validate inputs
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!quizResult.quiz_id || !uuidRegex.test(quizResult.quiz_id)) {
      throw new Error('Invalid quiz ID format');
    }
    
    if (typeof quizResult.score !== 'number' || quizResult.score < 0) {
      throw new Error('Invalid score value');
    }
    
    if (typeof quizResult.total_points !== 'number' || quizResult.total_points < 0) {
      throw new Error('Invalid total points value');
    }
    
    // Sanitize quiz result data
    const sanitizedQuizResult = {
      quiz_id: quizResult.quiz_id,
      score: Math.max(0, Math.floor(quizResult.score)),
      total_points: Math.max(0, Math.floor(quizResult.total_points)),
      passed: Boolean(quizResult.passed),
      answers: typeof quizResult.answers === 'object' && quizResult.answers !== null ? quizResult.answers : {}
    };
    try {
      console.log('Submitting quiz result:', quizResult);
      
      const { data, error } = await supabase
        .from('quiz_results')
        .insert([{
          user_id: user.id,
          ...sanitizedQuizResult,
          completed_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error submitting quiz result:', error);
        console.error('Quiz submission error details:', error.details, error.hint);
        throw error;
      }

      await fetchProgress();
      return data;
    } catch (err) {
      console.error('Error in submitQuizResult:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (supabase && user?.id) {
      fetchProgress();
    }
  }, [user?.id]);

  return {
    userProgress,
    quizResults,
    loading,
    error,
    enrollInCourse,
    updateProgress,
    submitQuizResult,
    refetch: fetchProgress,
    fetchAllProgress: () => fetchProgress(true)
  };
}