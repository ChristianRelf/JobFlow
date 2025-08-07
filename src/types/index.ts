export interface User {
  id: string;
  discordId: string;
  username: string;
  avatar: string;
  role: 'applicant' | 'student' | 'staff' | 'admin';
  status: 'pending' | 'accepted' | 'denied';
  createdAt: string;
  lastActive: string;
}

export interface Application {
  id: string;
  userId: string;
  responses: Record<string, string>;
  status: 'pending' | 'accepted' | 'denied';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
  submittedAt: string;
}

export interface ApplicationQuestion {
  id: string;
  question: string;
  type: 'text' | 'textarea' | 'select' | 'radio';
  options?: string[];
  required: boolean;
  order: number;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  quizzes: Quiz[];
  createdBy: string;
  createdAt: string;
  isPublished: boolean;
  estimatedTime: number; // in minutes
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  content: string;
  order: number;
  type: 'text' | 'video' | 'document' | 'interactive' | 'assignment' | 'quiz' | 'presentation' | 'code' | 'image' | 'audio';
  estimatedTime: number;
  metadata?: {
    videoUrl?: string;
    documentUrl?: string;
    imageUrl?: string;
    audioUrl?: string;
    codeLanguage?: string;
    interactiveType?: 'simulation' | 'game' | 'exercise' | 'poll';
    assignmentType?: 'essay' | 'project' | 'practical' | 'research';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    tags?: string[];
    resources?: Array<{
      title: string;
      url: string;
      type: 'link' | 'download' | 'reference';
    }>;
  };
  prerequisites?: string[];
  learningObjectives?: string[];
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  questions: QuizQuestion[];
  passingScore: number;
  order: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'short-answer';
  options?: string[];
  correctAnswer: string;
  points: number;
}

export interface UserProgress {
  userId: string;
  courseId: string;
  completedModules: string[];
  quizResults: QuizResult[];
  overallProgress: number;
  certificateEarned: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalPoints: number;
  passed: boolean;
  completedAt: string;
  answers: Record<string, string>;
}

export interface SiteConfig {
  siteName: string;
  subdomain: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  allowRegistration: boolean;
  requireApproval: boolean;
}