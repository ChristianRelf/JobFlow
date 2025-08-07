import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSupabaseCourses } from '../hooks/useSupabaseCourses';
import { useSupabaseProgress } from '../hooks/useSupabaseProgress';
import MarkdownRenderer from '../components/MarkdownRenderer';
import Certificate from '../components/Certificate';
import { 
  BookOpen, 
  Clock, 
  ArrowLeft, 
  Play, 
  CheckCircle,
  Award,
  Users,
  FileText,
  ChevronRight,
  ChevronLeft,
  Target,
  AlertCircle,
  Trophy,
  Star,
  Calendar,
  HelpCircle,
  Zap,
  BookMarked,
  GraduationCap,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Eye,
  Lock,
  Unlock
} from 'lucide-react';

const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useSupabaseCourses();
  const { 
    userProgress, 
    quizResults, 
    enrollInCourse, 
    updateProgress, 
    submitQuizResult,
    loading: progressLoading 
  } = useSupabaseProgress();

  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [showCertificate, setShowCertificate] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'overview' | 'module' | 'quiz'>('overview');
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [lastQuizResult, setLastQuizResult] = useState<any>(null);

  // Reset certificate view when navigating away
  useEffect(() => {
    return () => {
      setShowCertificate(false);
    };
  }, []);

  const course = courses.find(c => c.id === id);
  const progress = userProgress.find(p => p.course_id === id && p.user_id === user?.id);
  const isEnrolled = !!progress;
  const isCompleted = progress ? (progress.certificate_earned || progress.overall_progress >= 100) : false;

  // Auto-enroll students when they view a course
  useEffect(() => {
    const autoEnroll = async () => {
      if (course && user?.role === 'student' && !isEnrolled && !isEnrolling) {
        try {
          setIsEnrolling(true);
          await enrollInCourse(course.id);
        } catch (error) {
          console.error('Auto-enrollment failed:', error);
          setError('Failed to enroll in course. Please try refreshing the page.');
        } finally {
          setIsEnrolling(false);
        }
      }
    };

    autoEnroll();
  }, [course?.id, user?.id, user?.role, isEnrolled, enrollInCourse, isEnrolling]);

  const handleEnroll = async () => {
    if (!course || !user) return;

    setIsEnrolling(true);
    setError(null);

    try {
      await enrollInCourse(course.id);
    } catch (error) {
      console.error('Enrollment failed:', error);
      setError('Failed to enroll in course. Please try again.');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleModuleComplete = async (moduleIndex: number) => {
    if (!course || !user || !progress) return;

    const module = course.modules?.[moduleIndex];
    if (!module) return;

    const completedModules = Array.isArray(progress.completed_modules) 
      ? progress.completed_modules 
      : [];

    if (!completedModules.includes(module.id)) {
      const newCompletedModules = [...completedModules, module.id];
      const totalModules = course.modules?.length || 1;
      const newProgress = Math.round((newCompletedModules.length / totalModules) * 100);
      
      try {
        await updateProgress(course.id, newCompletedModules, newProgress);
        
        // Smooth transition to next module or quiz
        setTimeout(() => {
          if (moduleIndex < (course.modules?.length || 0) - 1) {
            setCurrentModuleIndex(moduleIndex + 1);
            setViewMode('module');
          } else if (course.quizzes && course.quizzes.length > 0) {
            setCurrentQuizIndex(0);
            setViewMode('quiz');
          } else {
            setViewMode('overview');
          }
        }, 1000);
      } catch (error) {
        console.error('Error updating progress:', error);
        setError('Failed to update progress. Please try again.');
      }
    }
  };

  const handleQuizSubmit = async (quiz: any) => {
    if (!course || !user || !quiz) return;

    setIsSubmittingQuiz(true);
    setError(null);

    try {
      // Calculate score
      let correctAnswers = 0;
      const totalQuestions = quiz.questions?.length || 0;
      
      quiz.questions?.forEach((question: any) => {
        const userAnswer = quizAnswers[question.id];
        if (userAnswer === question.correct_answer) {
          correctAnswers++;
        }
      });

      const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
      const totalPoints = quiz.questions?.reduce((sum: number, q: any) => sum + (q.points || 10), 0) || 0;
      const earnedPoints = Math.round((correctAnswers / totalQuestions) * totalPoints);
      const passed = score >= (quiz.passing_score || 70);

      // Submit quiz result
      await submitQuizResult({
        quiz_id: quiz.id,
        score: earnedPoints,
        total_points: totalPoints,
        passed,
        answers: quizAnswers
      });
      
      // Store result for display
      setLastQuizResult({
        score,
        earnedPoints,
        totalPoints,
        passed,
        correctAnswers,
        totalQuestions,
        passingScore: quiz.passing_score || 70
      });

      // If quiz passed, check if certificate should be awarded
      if (passed && progress) {
        const completedModules = Array.isArray(progress.completed_modules) 
          ? progress.completed_modules 
          : [];
        
        const totalModules = course.modules?.length || 0;
        const allModulesCompleted = completedModules.length >= totalModules;
        
        if (allModulesCompleted) {
          await updateProgress(course.id, completedModules, 100, true);
          
          // Show certificate after completion
          setTimeout(() => {
            setShowCertificate(true);
          }, 3000);
        } else {
          await updateProgress(course.id, completedModules, Math.round((completedModules.length / totalModules) * 100));
        }
      }

      setShowQuizResults(true);
      setQuizAnswers({});
      
      // Auto-close results after 5 seconds
      setTimeout(() => {
        setShowQuizResults(false);
        setCurrentQuizIndex(null);
        setViewMode('overview');
      }, 5000);
      
    } catch (error) {
      console.error('Error submitting quiz:', error);
      const errorMessage = `Failed to submit quiz: ${error instanceof Error ? error.message : 'Unknown error'}`;
      setError(errorMessage);
    } finally {
      setIsSubmittingQuiz(false);
    }
  };

  // Show loading state
  if (coursesLoading || progressLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#1c2341] border-t-transparent mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-[#1c2341] animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Course</h2>
          <p className="text-gray-600">Preparing your learning experience...</p>
        </div>
      </div>
    );
  }

  // Show error if course not found
  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="bg-red-100 p-4 rounded-full w-fit mx-auto mb-6">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
            <p className="text-gray-600 mb-6">The course you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/courses')}
              className="w-full px-6 py-3 bg-[#1c2341] text-white font-semibold rounded-xl hover:bg-[#2a3454] transition-all duration-200 transform hover:scale-105"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show certificate view
  if (showCertificate && isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 shadow-lg">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🎉 Congratulations!</h1>
            <p className="text-xl text-gray-600">You've earned your certificate!</p>
          </div>
          
          <div className="mb-8 text-center">
            <button
              onClick={() => setShowCertificate(false)}
              className="inline-flex items-center px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Course
            </button>
          </div>
          
          <Certificate
            courseName={course.title}
            studentName={user?.username || 'Student'}
            completionDate={progress?.completed_at || new Date().toISOString()}
            userId={user?.id}
            courseId={course.id}
          />
        </div>
      </div>
    );
  }

  const modules = course.modules || [];
  const quizzes = course.quizzes || [];
  const currentModule = modules[currentModuleIndex];
  const currentQuiz = currentQuizIndex !== null ? quizzes[currentQuizIndex] : null;

  const completedModules = Array.isArray(progress?.completed_modules) 
    ? progress.completed_modules 
    : [];

  const isModuleCompleted = (moduleIndex: number) => {
    const module = modules[moduleIndex];
    return module ? completedModules.includes(module.id) : false;
  };

  const canAccessModule = (moduleIndex: number) => {
    if (moduleIndex === 0) return true;
    return isModuleCompleted(moduleIndex - 1);
  };

  // Quiz Results Modal
  if (showQuizResults && lastQuizResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <div className={`px-8 py-6 text-center ${
            lastQuizResult.passed 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-red-500 to-pink-600'
          }`}>
            <div className="text-white">
              {lastQuizResult.passed ? (
                <div className="space-y-3">
                  <div className="bg-white/20 p-3 rounded-full w-fit mx-auto">
                    <Trophy className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold">🎉 Quiz Passed!</h2>
                  <p className="text-green-100">Excellent work!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-white/20 p-3 rounded-full w-fit mx-auto">
                    <RotateCcw className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold">Try Again</h2>
                  <p className="text-red-100">Don't give up!</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="p-8">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {lastQuizResult.score}%
                </div>
                <p className="text-gray-600">
                  {lastQuizResult.correctAnswers} of {lastQuizResult.totalQuestions} correct
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Points Earned:</span>
                  <span className="font-semibold text-gray-900">
                    {lastQuizResult.earnedPoints} / {lastQuizResult.totalPoints}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                  <span className="text-gray-600">Passing Score:</span>
                  <span className="font-semibold text-gray-900">{lastQuizResult.passingScore}%</span>
                </div>
              </div>

              {lastQuizResult.passed && isCompleted && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center justify-center text-yellow-800">
                    <Award className="h-5 w-5 mr-2" />
                    <span className="font-semibold">Certificate Earned!</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowQuizResults(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors duration-200"
              >
                Continue
              </button>
              {isCompleted && (
                <button
                  onClick={() => {
                    setShowQuizResults(false);
                    setShowCertificate(true);
                  }}
                  className="flex-1 px-4 py-3 bg-yellow-500 text-white font-semibold rounded-xl hover:bg-yellow-600 transition-colors duration-200"
                >
                  View Certificate
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Floating Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/courses')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 group"
            >
              <div className="bg-gray-100 group-hover:bg-gray-200 p-2 rounded-lg mr-3 transition-colors duration-200">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <span className="font-medium">Back to Courses</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {isEnrolled && progress && (
                <div className="hidden sm:flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{progress.overall_progress}% Complete</p>
                    <p className="text-xs text-gray-500">
                      {completedModules.length} of {modules.length} modules
                    </p>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#1c2341] to-[#eac66d] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progress.overall_progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {isCompleted && (
                <button
                  onClick={() => setShowCertificate(true)}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Certificate
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl sticky top-24 overflow-hidden">
              {/* Course Header */}
              <div className="relative bg-gradient-to-br from-[#1c2341] via-[#2a3454] to-[#1c2341] p-6 text-white">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 right-2 w-16 h-16 border border-[#eac66d] rounded-full"></div>
                  <div className="absolute bottom-2 left-2 w-12 h-12 bg-[#eac66d] rounded-full"></div>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center mb-4">
                    <div className="bg-[#eac66d] p-3 rounded-xl shadow-lg">
                      <BookOpen className="h-6 w-6 text-[#1c2341]" />
                    </div>
                    {isCompleted && (
                      <div className="ml-3 bg-green-500 p-2 rounded-full animate-bounce">
                        <Award className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <h1 className="text-xl font-bold mb-2 leading-tight">{course.title}</h1>
                  
                  <div className="flex items-center text-sm text-gray-300 mb-4">
                    <Clock className="h-4 w-4 mr-2" />
                    {course.estimated_time} minutes
                  </div>

                  {/* Progress Indicator */}
                  {isEnrolled && progress && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-lg font-bold text-[#eac66d]">{progress.overall_progress}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-[#eac66d] to-yellow-400 h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${progress.overall_progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-300">
                        <span>{completedModules.length} modules done</span>
                        <span>{modules.length - completedModules.length} remaining</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="p-6 space-y-3">
                <button
                  onClick={() => {
                    setViewMode('overview');
                    setCurrentModuleIndex(-1);
                    setCurrentQuizIndex(null);
                  }}
                  className={`w-full flex items-center px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    viewMode === 'overview' 
                      ? 'bg-gradient-to-r from-[#1c2341] to-[#2a3454] text-white shadow-lg transform scale-105' 
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-102'
                  }`}
                >
                  <Eye className="h-5 w-5 mr-3" />
                  Course Overview
                </button>

                {/* Enrollment Button */}
                {!isEnrolled && user?.role === 'student' && (
                  <button
                    onClick={handleEnroll}
                    disabled={isEnrolling}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
                  >
                    {isEnrolling ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <Users className="h-5 w-5 mr-3" />
                        Enroll Now
                      </>
                    )}
                  </button>
                )}

                {/* Start/Continue Learning Button */}
                {isEnrolled && !isCompleted && (
                  <button
                    onClick={() => {
                      setViewMode('module');
                      setCurrentModuleIndex(0);
                      setCurrentQuizIndex(null);
                    }}
                    className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <Play className="h-5 w-5 mr-3" />
                    {progress?.overall_progress > 0 ? 'Continue Learning' : 'Start Learning'}
                  </button>
                )}
              </div>

              {/* Module Navigation */}
              {isEnrolled && modules.length > 0 && (
                <div className="px-6 pb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                    <BookMarked className="h-4 w-4 mr-2" />
                    Learning Modules
                  </h3>
                  <div className="space-y-2">
                    {modules.map((module, index) => {
                      const isCompleted = isModuleCompleted(index);
                      const canAccess = canAccessModule(index);
                      const isCurrent = index === currentModuleIndex && viewMode === 'module';

                      return (
                        <button
                          key={module.id}
                          onClick={() => {
                            if (canAccess) {
                              setCurrentModuleIndex(index);
                              setCurrentQuizIndex(null);
                              setViewMode('module');
                            }
                          }}
                          disabled={!canAccess}
                          className={`w-full group relative overflow-hidden rounded-xl transition-all duration-200 ${
                            isCurrent 
                              ? 'bg-gradient-to-r from-[#1c2341] to-[#2a3454] text-white shadow-lg transform scale-105' 
                              : canAccess 
                                ? 'bg-white hover:bg-gray-50 text-gray-900 shadow-sm hover:shadow-md border border-gray-200' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <div className="flex items-center p-4">
                            <div className={`flex-shrink-0 mr-3 ${
                              isCompleted 
                                ? 'text-green-500' 
                                : canAccess 
                                  ? isCurrent ? 'text-[#eac66d]' : 'text-blue-500'
                                  : 'text-gray-400'
                            }`}>
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5" />
                              ) : canAccess ? (
                                <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-current"></div>
                                </div>
                              ) : (
                                <Lock className="h-5 w-5" />
                              )}
                            </div>
                            
                            <div className="flex-1 text-left">
                              <p className="font-medium text-sm truncate">{module.title}</p>
                              <p className={`text-xs ${isCurrent ? 'text-gray-300' : 'text-gray-500'}`}>
                                {module.estimated_time} min
                              </p>
                            </div>
                            
                            {canAccess && (
                              <ChevronRight className={`h-4 w-4 transition-transform duration-200 ${
                                isCurrent ? 'text-[#eac66d] rotate-90' : 'text-gray-400 group-hover:translate-x-1'
                              }`} />
                            )}
                          </div>
                          
                          {isCurrent && (
                            <div className="absolute inset-0 bg-gradient-to-r from-[#eac66d]/20 to-transparent"></div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quiz Navigation */}
              {isEnrolled && quizzes.length > 0 && (
                <div className="px-6 pb-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    Knowledge Tests
                  </h3>
                  <div className="space-y-2">
                    {quizzes.map((quiz, index) => {
                      const quizResult = quizResults.find(r => r.quiz_id === quiz.id);
                      const isPassed = quizResult?.passed || false;
                      const isCurrent = currentQuizIndex === index && viewMode === 'quiz';

                      return (
                        <button
                          key={quiz.id}
                          onClick={() => {
                            setCurrentQuizIndex(index);
                            setCurrentModuleIndex(-1);
                            setViewMode('quiz');
                          }}
                          className={`w-full group relative overflow-hidden rounded-xl transition-all duration-200 ${
                            isCurrent 
                              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105' 
                              : 'bg-white hover:bg-gray-50 text-gray-900 shadow-sm hover:shadow-md border border-gray-200'
                          }`}
                        >
                          <div className="flex items-center p-4">
                            <div className={`flex-shrink-0 mr-3 ${
                              isPassed 
                                ? 'text-yellow-500' 
                                : isCurrent ? 'text-yellow-300' : 'text-blue-500'
                            }`}>
                              {isPassed ? (
                                <Trophy className="h-5 w-5" />
                              ) : (
                                <Target className="h-5 w-5" />
                              )}
                            </div>
                            
                            <div className="flex-1 text-left">
                              <p className="font-medium text-sm">{quiz.title}</p>
                              <p className={`text-xs ${isCurrent ? 'text-gray-300' : 'text-gray-500'}`}>
                                Pass: {quiz.passing_score}%
                              </p>
                            </div>
                            
                            {quizResult && (
                              <div className={`text-xs px-2 py-1 rounded-full font-bold ${
                                isPassed 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {quizResult.score}/{quizResult.total_points}
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Enhanced Main Content */}
          <div className="lg:col-span-3">
            {/* Course Overview */}
            {viewMode === 'overview' && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-br from-[#1c2341] via-[#2a3454] to-[#1c2341] p-8 text-white">
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-4 right-4 w-24 h-24 border-2 border-[#eac66d] rounded-full"></div>
                    <div className="absolute bottom-4 left-4 w-16 h-16 bg-[#eac66d] rounded-full"></div>
                  </div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-4">
                      <div className="bg-[#eac66d] p-3 rounded-xl shadow-lg mr-4">
                        <GraduationCap className="h-8 w-8 text-[#1c2341]" />
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold mb-1">{course.title}</h1>
                        <p className="text-gray-300">Professional Development Course</p>
                      </div>
                    </div>
                    
                    {isCompleted && (
                      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-4 mb-4">
                        <div className="flex items-center">
                          <Trophy className="h-6 w-6 text-yellow-400 mr-3" />
                          <div>
                            <p className="font-bold text-yellow-400">Course Completed!</p>
                            <p className="text-sm text-green-200">Certificate earned and ready for download</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course Description */}
                <div className="p-8">
                  <div className="prose prose-lg max-w-none mb-8">
                    <MarkdownRenderer content={course.description} />
                  </div>

                  {/* Enhanced Course Stats */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center mb-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <BookOpen className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-600">Learning Modules</p>
                          <p className="text-2xl font-bold text-gray-900">{modules.length}</p>
                        </div>
                      </div>
                      <p className="text-sm text-blue-700">Interactive content and materials</p>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center mb-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Target className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-600">Knowledge Tests</p>
                          <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
                        </div>
                      </div>
                      <p className="text-sm text-purple-700">Assessments and evaluations</p>
                    </div>
                  </div>

                  {/* Learning Path Preview */}
                  {isEnrolled && (
                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Sparkles className="h-5 w-5 text-[#eac66d] mr-2" />
                        Your Learning Path
                      </h3>
                      
                      <div className="space-y-3">
                        {modules.slice(0, 3).map((module, index) => {
                          const isCompleted = isModuleCompleted(index);
                          const canAccess = canAccessModule(index);
                          
                          return (
                            <div key={module.id} className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                              isCompleted ? 'bg-green-50 border border-green-200' :
                              canAccess ? 'bg-white border border-blue-200' :
                              'bg-gray-50 border border-gray-200'
                            }`}>
                              <div className={`mr-3 ${
                                isCompleted ? 'text-green-500' :
                                canAccess ? 'text-blue-500' : 'text-gray-400'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="h-5 w-5" />
                                ) : canAccess ? (
                                  <Unlock className="h-5 w-5" />
                                ) : (
                                  <Lock className="h-5 w-5" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{module.title}</p>
                                <p className="text-xs text-gray-500">{module.estimated_time} minutes</p>
                              </div>
                              {isCompleted && (
                                <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-bold">
                                  ✓ Done
                                </div>
                              )}
                            </div>
                          );
                        })}
                        
                        {modules.length > 3 && (
                          <div className="text-center text-sm text-gray-500 pt-2">
                            +{modules.length - 3} more modules
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Call to Action */}
                  {!isEnrolled && user?.role === 'student' && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 text-center border-2 border-blue-200">
                      <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-4">
                        <Users className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to Begin?</h3>
                      <p className="text-gray-600 mb-6">Join this course and start your learning journey today</p>
                      <button
                        onClick={handleEnroll}
                        disabled={isEnrolling}
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
                      >
                        {isEnrolling ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                            Enrolling...
                          </>
                        ) : (
                          <>
                            <Zap className="h-5 w-5 mr-3" />
                            Enroll Now
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {isEnrolled && !isCompleted && (
                    <div className="text-center">
                      <button
                        onClick={() => {
                          setViewMode('module');
                          setCurrentModuleIndex(0);
                          setCurrentQuizIndex(null);
                        }}
                        className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-[#1c2341] to-[#2a3454] text-white font-bold text-lg rounded-xl hover:from-[#2a3454] hover:to-[#1c2341] transition-all duration-200 transform hover:scale-105 shadow-lg"
                      >
                        <Play className="h-6 w-6 mr-3" />
                        {progress?.overall_progress > 0 ? 'Continue Learning' : 'Start Learning'}
                        <ArrowRight className="h-5 w-5 ml-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enhanced Module View */}
            {viewMode === 'module' && currentModule && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Module Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-white/20 p-3 rounded-xl mr-4">
                        <BookMarked className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{currentModule.title}</h2>
                        <p className="text-blue-100">Module {currentModuleIndex + 1} of {modules.length}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2" />
                          {currentModule.estimated_time} min
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Module Progress */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Course Progress</span>
                      <span className="text-lg font-bold">{progress?.overall_progress || 0}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${progress?.overall_progress || 0}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Module Content */}
                <div className="p-8">
                  <div className="prose prose-lg max-w-none mb-8">
                    <MarkdownRenderer content={currentModule.content} />
                  </div>

                  {/* Module Completion Status */}
                  {isModuleCompleted(currentModuleIndex) && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 mb-8">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-full mr-4">
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-green-900">Module Completed!</h3>
                          <p className="text-green-700">Great job! You've successfully completed this module.</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Navigation */}
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        if (currentModuleIndex > 0) {
                          setCurrentModuleIndex(currentModuleIndex - 1);
                        } else {
                          setViewMode('overview');
                        }
                      }}
                      className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                    >
                      <ChevronLeft className="h-5 w-5 mr-2" />
                      {currentModuleIndex === 0 ? 'Course Overview' : 'Previous Module'}
                    </button>

                    <div className="flex items-center space-x-4">
                      {!isModuleCompleted(currentModuleIndex) && isEnrolled && (
                        <button
                          onClick={() => handleModuleComplete(currentModuleIndex)}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                          <CheckCircle className="h-5 w-5 mr-2" />
                          Complete Module
                          <Sparkles className="h-4 w-4 ml-2" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (currentModuleIndex < modules.length - 1) {
                            const nextIndex = currentModuleIndex + 1;
                            if (canAccessModule(nextIndex)) {
                              setCurrentModuleIndex(nextIndex);
                            }
                          } else if (quizzes.length > 0) {
                            setCurrentQuizIndex(0);
                            setViewMode('quiz');
                          } else {
                            setViewMode('overview');
                          }
                        }}
                        disabled={currentModuleIndex >= modules.length - 1 && quizzes.length === 0}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#1c2341] to-[#2a3454] text-white font-bold rounded-xl hover:from-[#2a3454] hover:to-[#1c2341] transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50"
                      >
                        {currentModuleIndex >= modules.length - 1 ? (
                          quizzes.length > 0 ? (
                            <>
                              Take Quiz
                              <Target className="h-5 w-5 ml-2" />
                            </>
                          ) : (
                            <>
                              Course Complete
                              <Award className="h-5 w-5 ml-2" />
                            </>
                          )
                        ) : (
                          <>
                            Next Module
                            <ChevronRight className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Quiz View */}
            {viewMode === 'quiz' && currentQuiz && (
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Quiz Header */}
                <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-white/20 p-3 rounded-xl mr-4">
                        <Target className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{currentQuiz.title}</h2>
                        <p className="text-purple-100">Knowledge Assessment</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-purple-200">Questions:</span>
                        <span className="ml-2 font-bold">{currentQuiz.questions?.length || 0}</span>
                      </div>
                      <div>
                        <span className="text-purple-200">Passing Score:</span>
                        <span className="ml-2 font-bold">{currentQuiz.passing_score}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quiz Content */}
                <div className="p-8">
                  <div className="space-y-8">
                    {currentQuiz.questions?.map((question: any, questionIndex: number) => (
                      <div key={question.id} className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-all duration-200">
                        <div className="flex items-start mb-4">
                          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-4 shadow-lg">
                            {questionIndex + 1}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 leading-relaxed">
                            {question.question}
                          </h3>
                        </div>

                        {question.type === 'multiple-choice' && question.options && (
                          <div className="space-y-3 ml-12">
                            {question.options.map((option: string, optionIndex: number) => (
                              <label key={optionIndex} className="group flex items-center p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all duration-200">
                                <input
                                  type="radio"
                                  name={question.id}
                                  value={option}
                                  checked={quizAnswers[question.id] === option}
                                  onChange={(e) => setQuizAnswers(prev => ({
                                    ...prev,
                                    [question.id]: e.target.value
                                  }))}
                                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 mr-4"
                                />
                                <span className="text-gray-700 font-medium group-hover:text-blue-700 transition-colors duration-200">
                                  {option}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}

                        {question.type === 'short-answer' && (
                          <div className="ml-12">
                            <textarea
                              value={quizAnswers[question.id] || ''}
                              onChange={(e) => setQuizAnswers(prev => ({
                                ...prev,
                                [question.id]: e.target.value
                              }))}
                              rows={4}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                              placeholder="Enter your detailed answer here..."
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quiz Navigation */}
                <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setViewMode('overview')}
                      className="inline-flex items-center px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                    >
                      <ArrowLeft className="h-5 w-5 mr-2" />
                      Back to Overview
                    </button>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-sm text-gray-600">
                        {Object.keys(quizAnswers).length} of {currentQuiz.questions?.length || 0} answered
                      </div>
                      <button
                        onClick={() => handleQuizSubmit(currentQuiz)}
                        disabled={isSubmittingQuiz || !currentQuiz.questions?.every((q: any) => quizAnswers[q.id])}
                        className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:transform-none"
                      >
                        {isSubmittingQuiz ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Target className="h-5 w-5 mr-3" />
                            Submit Quiz
                            <Zap className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {modules.length === 0 && quizzes.length === 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-12">
                <div className="text-center">
                  <div className="bg-gray-100 p-6 rounded-full w-fit mx-auto mb-6">
                    <BookOpen className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Course Content Coming Soon</h3>
                  <p className="text-lg text-gray-600 mb-6">
                    This course is being prepared with engaging content and assessments.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <p className="text-blue-800">
                      Check back soon for modules, quizzes, and interactive learning materials!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;