export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          discord_id: string | null
          username: string
          avatar: string | null
          role: 'applicant' | 'student' | 'staff' | 'admin'
          status: 'pending' | 'accepted' | 'denied'
          created_at: string
          updated_at: string
          last_active: string
        }
        Insert: {
          id: string
          discord_id?: string | null
          username: string
          avatar?: string | null
          role?: 'applicant' | 'student' | 'staff' | 'admin'
          status?: 'pending' | 'accepted' | 'denied'
          created_at?: string
          updated_at?: string
          last_active?: string
        }
        Update: {
          id?: string
          discord_id?: string | null
          username?: string
          avatar?: string | null
          role?: 'applicant' | 'student' | 'staff' | 'admin'
          status?: 'pending' | 'accepted' | 'denied'
          created_at?: string
          updated_at?: string
          last_active?: string
        }
      }
      application_questions: {
        Row: {
          id: string
          question: string
          type: 'text' | 'textarea' | 'select' | 'radio'
          options: Json | null
          required: boolean
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          type?: 'text' | 'textarea' | 'select' | 'radio'
          options?: Json | null
          required?: boolean
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          type?: 'text' | 'textarea' | 'select' | 'radio'
          options?: Json | null
          required?: boolean
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          responses: Json
          status: 'pending' | 'accepted' | 'denied'
          reviewed_by: string | null
          reviewed_at: string | null
          notes: string | null
          submitted_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          responses?: Json
          status?: 'pending' | 'accepted' | 'denied'
          reviewed_by?: string | null
          reviewed_at?: string | null
          notes?: string | null
          submitted_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          responses?: Json
          status?: 'pending' | 'accepted' | 'denied'
          reviewed_by?: string | null
          reviewed_at?: string | null
          notes?: string | null
          submitted_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          estimated_time: number
          created_by: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          estimated_time?: number
          created_by?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          estimated_time?: number
          created_by?: string | null
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          course_id: string
          title: string
          content: string
          order_index: number
          type: string
          estimated_time: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          content: string
          order_index: number
          type?: string
          estimated_time?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          content?: string
          order_index?: number
          type?: string
          estimated_time?: number
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          course_id: string
          title: string
          passing_score: number
          order_index: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          passing_score?: number
          order_index: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          passing_score?: number
          order_index?: number
          created_at?: string
          updated_at?: string
        }
      }
      quiz_questions: {
        Row: {
          id: string
          quiz_id: string
          question: string
          type: 'multiple-choice' | 'short-answer'
          options: Json | null
          correct_answer: string
          points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          question: string
          type?: 'multiple-choice' | 'short-answer'
          options?: Json | null
          correct_answer: string
          points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          question?: string
          type?: 'multiple-choice' | 'short-answer'
          options?: Json | null
          correct_answer?: string
          points?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          course_id: string
          completed_modules: Json
          overall_progress: number
          certificate_earned: boolean
          started_at: string
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          completed_modules?: Json
          overall_progress?: number
          certificate_earned?: boolean
          started_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          completed_modules?: Json
          overall_progress?: number
          certificate_earned?: boolean
          started_at?: string
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      quiz_results: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          score: number
          total_points: number
          passed: boolean
          answers: Json
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          quiz_id: string
          score: number
          total_points: number
          passed: boolean
          answers?: Json
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          quiz_id?: string
          score?: number
          total_points?: number
          passed?: boolean
          answers?: Json
          completed_at?: string
          created_at?: string
        }
      }
      certificates: {
        Row: {
          id: string
          certificate_id: string
          user_id: string
          course_id: string
          student_name: string
          course_name: string
          completion_date: string
          issued_date: string
          valid_until: string
          registry_number: string
          is_valid: boolean
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          certificate_id: string
          user_id: string
          course_id: string
          student_name: string
          course_name: string
          completion_date: string
          issued_date?: string
          valid_until: string
          registry_number: string
          is_valid?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          certificate_id?: string
          user_id?: string
          course_id?: string
          student_name?: string
          course_name?: string
          completion_date?: string
          issued_date?: string
          valid_until?: string
          registry_number?: string
          is_valid?: boolean
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: 'applicant' | 'student' | 'staff' | 'admin'
      user_status: 'pending' | 'accepted' | 'denied'
      application_status: 'pending' | 'accepted' | 'denied'
      question_type: 'text' | 'textarea' | 'select' | 'radio'
      quiz_question_type: 'multiple-choice' | 'short-answer'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}