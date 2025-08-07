import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface Course {
  id: string;
  title: string;
  description: string;
  estimated_time: number;
  created_by: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  modules?: Module[];
  quizzes?: Quiz[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  content: string;
  order_index: number;
  type: string;
  estimated_time: number;
  created_at: string;
  updated_at: string;
  metadata?: {
    videoUrl?: string;
    documentUrl?: string;
    imageUrl?: string;
    audioUrl?: string;
    codeLanguage?: string;
    interactiveType?: string;
    assignmentType?: string;
    difficulty?: string;
    tags?: string[];
    resources?: Array<{
      title: string;
      url: string;
      type: string;
    }>;
  };
  prerequisites?: string[];
  learningObjectives?: string[];
}

export interface Quiz {
  id: string;
  course_id: string;
  title: string;
  passing_score: number;
  order_index: number;
  created_at: string;
  updated_at: string;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question: string;
  type: 'multiple-choice' | 'short-answer';
  options: any;
  correct_answer: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export function useSupabaseCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCourses = async (forceLoad = false) => {
    if (!supabase) {
      console.warn('Supabase not available, setting empty courses');
      setCourses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching courses from Supabase...');
      
      // Optimize query - only fetch what we need and limit joins
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          estimated_time,
          created_by,
          is_published,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching courses:', error);
        setError(error.message);
        setCourses([]); // Set empty array on error
        return;
      }

      console.log('Raw course data from Supabase:', data);

      setCourses(data || []);
      setError(null);
    } catch (err) {
      console.error('Error in fetchCourses:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setCourses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const createCourse = async (courseData: {
    title: string;
    description: string;
    estimated_time: number;
    is_published: boolean;
    modules: any[];
    quizzes: any[];
  }) => {
    if (!supabase || !user) {
      throw new Error('Supabase not available or user not authenticated');
    }

    // Validate and sanitize course data
    if (!courseData.title || typeof courseData.title !== 'string' || courseData.title.trim().length === 0) {
      throw new Error('Course title is required');
    }
    
    if (!courseData.description || typeof courseData.description !== 'string' || courseData.description.trim().length === 0) {
      throw new Error('Course description is required');
    }
    
    if (typeof courseData.estimated_time !== 'number' || courseData.estimated_time < 1 || courseData.estimated_time > 10000) {
      throw new Error('Invalid estimated time');
    }
    
    // Sanitize course data
    const sanitizedCourseData = {
      title: courseData.title.trim().substring(0, 200),
      description: courseData.description.trim().substring(0, 2000),
      estimated_time: Math.max(1, Math.min(10000, Math.floor(courseData.estimated_time))),
      is_published: Boolean(courseData.is_published)
    };
    
    // Validate and sanitize modules
    const sanitizedModules = courseData.modules.map((module, index) => {
      if (!module.title || typeof module.title !== 'string' || module.title.trim().length === 0) {
        throw new Error(`Module ${index + 1} title is required`);
      }
      
      if (!module.content || typeof module.content !== 'string' || module.content.trim().length === 0) {
        throw new Error(`Module ${index + 1} content is required`);
      }
      
      return {
        title: module.title.trim().substring(0, 200),
        content: module.content.trim().substring(0, 100000), // 100KB limit per module
        type: 'text', // Fixed type for security
        estimatedTime: Math.max(1, Math.min(1000, Math.floor(module.estimatedTime || 10)))
      };
    });
    
    // Validate and sanitize quizzes
    const sanitizedQuizzes = courseData.quizzes.map((quiz, index) => {
      if (!quiz.title || typeof quiz.title !== 'string' || quiz.title.trim().length === 0) {
        throw new Error(`Quiz ${index + 1} title is required`);
      }
      
      const passingScore = Math.max(1, Math.min(100, Math.floor(quiz.passingScore || 70)));
      
      const sanitizedQuestions = (quiz.questions || []).map((question: any, qIndex: number) => {
        if (!question.question || typeof question.question !== 'string' || question.question.trim().length === 0) {
          throw new Error(`Quiz ${index + 1}, Question ${qIndex + 1} text is required`);
        }
        
        if (!['multiple-choice', 'short-answer'].includes(question.type)) {
          throw new Error(`Quiz ${index + 1}, Question ${qIndex + 1} has invalid type`);
        }
        
        if (!question.correctAnswer || typeof question.correctAnswer !== 'string' || question.correctAnswer.trim().length === 0) {
          throw new Error(`Quiz ${index + 1}, Question ${qIndex + 1} correct answer is required`);
        }
        
        let sanitizedOptions = null;
        if (question.type === 'multiple-choice' && question.options) {
          if (!Array.isArray(question.options)) {
            throw new Error(`Quiz ${index + 1}, Question ${qIndex + 1} options must be an array`);
          }
          sanitizedOptions = question.options
            .filter((opt: any) => typeof opt === 'string' && opt.trim().length > 0)
            .map((opt: string) => opt.trim().substring(0, 200))
            .slice(0, 10); // Max 10 options
          
          if (sanitizedOptions.length < 2) {
            throw new Error(`Quiz ${index + 1}, Question ${qIndex + 1} must have at least 2 options`);
          }
        }
        
        return {
          question: question.question.trim().substring(0, 500),
          type: question.type,
          options: sanitizedOptions,
          correctAnswer: question.correctAnswer.trim().substring(0, 500),
          points: Math.max(1, Math.min(100, Math.floor(question.points || 10)))
        };
      });
      
      return {
        title: quiz.title.trim().substring(0, 200),
        passingScore,
        questions: sanitizedQuestions
      };
    });
    try {
      // Create course
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .insert([{
          title: sanitizedCourseData.title,
          description: sanitizedCourseData.description,
          estimated_time: sanitizedCourseData.estimated_time,
          created_by: user.id,
          is_published: sanitizedCourseData.is_published
        }])
        .select()
        .single();

      if (courseError) {
        console.error('Error creating course:', courseError);
        throw courseError;
      }

      // Create modules
      if (sanitizedModules.length > 0) {
        const modulesData = sanitizedModules.map((module, index) => ({
          course_id: course.id,
          title: module.title,
          content: module.content,
          order_index: index,
          type: module.type,
          estimated_time: module.estimatedTime || 10
        }));

        const { error: modulesError } = await supabase
          .from('modules')
          .insert(modulesData);

        if (modulesError) {
          console.error('Error creating modules:', modulesError);
          throw modulesError;
        }
      }

      // Create quizzes
      if (sanitizedQuizzes.length > 0) {
        const quizzesData = sanitizedQuizzes.map((quiz, index) => ({
          course_id: course.id,
          title: quiz.title,
          passing_score: quiz.passingScore || 70,
          order_index: index
        }));

        const { data: createdQuizzes, error: quizzesError } = await supabase
          .from('quizzes')
          .insert(quizzesData)
          .select();

        if (quizzesError) {
          console.error('Error creating quizzes:', quizzesError);
          throw quizzesError;
        }

        // Create quiz questions
        for (const [quizIndex, quiz] of sanitizedQuizzes.entries()) {
          if (quiz.questions && quiz.questions.length > 0) {
            const questionsData = quiz.questions.map((question: any) => ({
              quiz_id: createdQuizzes[quizIndex].id,
              question: question.question,
              type: question.type,
              options: question.options,
              correct_answer: question.correctAnswer,
              points: question.points || 10
            }));

            const { error: questionsError } = await supabase
              .from('quiz_questions')
              .insert(questionsData);

            if (questionsError) {
              console.error('Error creating quiz questions:', questionsError);
              throw questionsError;
            }
          }
        }
      }

      await fetchCourses();
      return course;
    } catch (err) {
      console.error('Error in createCourse:', err);
      throw err;
    }
  };

  const updateCourse = async (courseId: string, courseData: {
    title: string;
    description: string;
    estimated_time: number;
    is_published: boolean;
  }) => {
    if (!supabase || !user) {
      throw new Error('Supabase not available or user not authenticated');
    }

    // Validate course ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!courseId || !uuidRegex.test(courseId)) {
      throw new Error('Invalid course ID format');
    }
    
    // Validate and sanitize course data
    if (!courseData.title || typeof courseData.title !== 'string' || courseData.title.trim().length === 0) {
      throw new Error('Course title is required');
    }
    
    if (!courseData.description || typeof courseData.description !== 'string' || courseData.description.trim().length === 0) {
      throw new Error('Course description is required');
    }
    
    if (typeof courseData.estimated_time !== 'number' || courseData.estimated_time < 1 || courseData.estimated_time > 10000) {
      throw new Error('Invalid estimated time');
    }
    
    const sanitizedData = {
      title: courseData.title.trim().substring(0, 200),
      description: courseData.description.trim().substring(0, 2000),
      estimated_time: Math.max(1, Math.min(10000, Math.floor(courseData.estimated_time))),
      is_published: Boolean(courseData.is_published)
    };
    try {
      const { data, error } = await supabase
        .from('courses')
        .update({
          title: sanitizedData.title,
          description: sanitizedData.description,
          estimated_time: sanitizedData.estimated_time,
          is_published: sanitizedData.is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)
        .select()
        .single();

      if (error) {
        console.error('Error updating course:', error);
        throw error;
      }

      await fetchCourses();
      return data;
    } catch (err) {
      console.error('Error in updateCourse:', err);
      throw err;
    }
  };

  const deleteCourse = async (courseId: string) => {
    if (!supabase || !user) {
      throw new Error('Supabase not available or user not authenticated');
    }

    // Validate course ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!courseId || !uuidRegex.test(courseId)) {
      throw new Error('Invalid course ID format');
    }
    try {
      // Delete course (modules and quizzes will be deleted via CASCADE)
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) {
        console.error('Error deleting course:', error);
        throw error;
      }

      // Send Discord webhook for course deletion
      try {
        const staffWebhookUrl = 'https://discord.com/api/webhooks/1402319981605290114/-KCOA_9a-PMM2qqZWqT4IF77WI-2xba27PwqFz1e4xm6-pzxc3eynXemllHslX2AZ_og';
        
        const webhookData = {
          embeds: [{
            title: '🗑️ Course Deleted',
            description: `${user.username} has deleted a course`,
            color: 0xff0000,
            fields: [
              {
                name: 'Course ID',
                value: courseId.slice(0, 8),
                inline: true
              },
              {
                name: 'Deleted By',
                value: user.username,
                inline: true
              },
              {
                name: 'Deletion Date',
                value: new Date().toLocaleString(),
                inline: true
              }
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Oakridge Education Portal'
            }
          }]
        };

        await fetch(staffWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData)
        });
      } catch (webhookError) {
        console.warn('Failed to send Discord webhook:', webhookError);
      }

      await fetchCourses();
    } catch (err) {
      console.error('Error in deleteCourse:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (supabase && user?.id) {
      fetchCourses();
    }
  }, [user?.id]);

  return {
    courses,
    loading,
    error,
    createCourse,
    updateCourse,
    deleteCourse,
    refetch: fetchCourses,
    fetchAllCourses: () => fetchCourses(true)
  };
}