import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ApplicationQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio';
  options: any;
  required: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export function useSupabaseQuestions() {
  const [questions, setQuestions] = useState<ApplicationQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    if (!supabase) {
      console.warn('Supabase not available, using default questions');
      const defaultQuestions = [
        {
          id: '1',
          question: 'What is your Discord username?',
          type: 'text' as const,
          options: null,
          required: true,
          order_index: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          question: 'Why do you want to join Oakridge Operations Group?',
          type: 'textarea' as const,
          options: null,
          required: true,
          order_index: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          question: 'What is your experience with Roblox?',
          type: 'select' as const,
          options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
          required: true,
          order_index: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          question: 'Are you available for training sessions?',
          type: 'radio' as const,
          options: ['Yes', 'No', 'Sometimes'],
          required: true,
          order_index: 4,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setQuestions([
        ...defaultQuestions
      ]);
      console.log('Set default questions:', defaultQuestions);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching application questions from Supabase...');
      setLoading(true);
      const { data, error } = await supabase
        .from('application_questions')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching questions:', error);
        // Fall back to default questions if database fetch fails
        console.log('Falling back to default questions');
        const defaultQuestions = [
          {
            id: '1',
            question: 'What is your Discord username?',
            type: 'text' as const,
            options: null,
            required: true,
            order_index: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '2',
            question: 'Why do you want to join Oakridge Operations Group?',
            type: 'textarea' as const,
            options: null,
            required: true,
            order_index: 2,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '3',
            question: 'What is your experience with Roblox?',
            type: 'select' as const,
            options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
            required: true,
            order_index: 3,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: '4',
            question: 'Are you available for training sessions?',
            type: 'radio' as const,
            options: ['Yes', 'No', 'Sometimes'],
            required: true,
            order_index: 4,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        setQuestions([
          ...defaultQuestions
        ]);
        console.log('Set fallback questions:', defaultQuestions);
        setError(error.message);
      } else {
        console.log('Successfully fetched questions:', data);
        const questionsData = data || [];
        console.log('Questions data structure:', questionsData);
        setQuestions(questionsData);
        setError(null);
      }

    } catch (err) {
      console.error('Error in fetchQuestions:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      // Set default questions as final fallback
      const defaultQuestions = [
        {
          id: '1',
          question: 'What is your Discord username?',
          type: 'text' as const,
          options: null,
          required: true,
          order_index: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          question: 'Why do you want to join Oakridge Operations Group?',
          type: 'textarea' as const,
          options: null,
          required: true,
          order_index: 2,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          question: 'What is your experience with Roblox?',
          type: 'select' as const,
          options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
          required: true,
          order_index: 3,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '4',
          question: 'Are you available for training sessions?',
          type: 'radio' as const,
          options: ['Yes', 'No', 'Sometimes'],
          required: true,
          order_index: 4,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      setQuestions(defaultQuestions);
      console.log('Set error fallback questions:', defaultQuestions);
    } finally {
      setLoading(false);
    }
  };

  const updateQuestions = async (updatedQuestions: ApplicationQuestion[]) => {
    if (!supabase) {
      throw new Error('Supabase not available');
    }

    // Validate and sanitize input data
    const sanitizedQuestions = updatedQuestions.map((q, index) => {
      // Validate question text
      if (!q.question || typeof q.question !== 'string' || q.question.trim().length === 0) {
        throw new Error('Invalid question text provided');
      }
      
      // Validate question type
      const validTypes = ['text', 'textarea', 'select', 'radio'];
      if (!validTypes.includes(q.type)) {
        throw new Error('Invalid question type provided');
      }
      
      // Validate options for select/radio types
      if ((q.type === 'select' || q.type === 'radio') && q.options) {
        if (!Array.isArray(q.options)) {
          throw new Error('Options must be an array');
        }
        // Sanitize options
        const sanitizedOptions = q.options
          .filter(opt => typeof opt === 'string' && opt.trim().length > 0)
          .map(opt => opt.trim().substring(0, 200)); // Limit option length
        
        if (sanitizedOptions.length === 0) {
          throw new Error('At least one valid option is required for select/radio questions');
        }
        
        return {
          question: q.question.trim().substring(0, 500), // Limit question length
          type: q.type,
          options: sanitizedOptions,
          required: Boolean(q.required),
          order_index: Math.max(1, Math.min(1000, index + 1)) // Constrain order index
        };
      }
      
      return {
        question: q.question.trim().substring(0, 500),
        type: q.type,
        options: null,
        required: Boolean(q.required),
        order_index: Math.max(1, Math.min(1000, index + 1))
      };
    });
    try {
      // Delete all existing questions
      const { error: deleteError } = await supabase
        .from('application_questions')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) {
        console.error('Error deleting questions:', deleteError);
        throw deleteError;
      }

      // Insert new questions

      const { data, error } = await supabase
        .from('application_questions')
        .insert(sanitizedQuestions)
        .select();

      if (error) {
        console.error('Error updating questions:', error);
        throw error;
      }

      await fetchQuestions();
      return data;
    } catch (err) {
      console.error('Error in updateQuestions:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  return {
    questions,
    loading,
    error,
    updateQuestions,
    refetch: fetchQuestions
  };
}