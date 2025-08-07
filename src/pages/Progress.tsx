import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSupabaseCourses } from '../hooks/useSupabaseCourses';
import { useSupabaseProgress } from '../hooks/useSupabaseProgress';
import { 
  Award, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  CheckCircle,
  Calendar,
  Star,
  Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Progress: React.FC = () => {
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useSupabaseCourses();
  const { userProgress, loading: progressLoading } = useSupabaseProgress();

  const myProgress = userProgress.filter(p => p.user_id === user?.id);
  const enrolledCourses = myProgress.length;
  const completedCourses = myProgress.filter(p => p.certificate_earned || p.overall_progress >= 100).length;
  const inProgressCourses = myProgress.filter(p => !p.certificate_earned && p.overall_progress < 100).length;
  const totalStudyTime = myProgress.reduce((acc, p) => {
    const course = courses.find(c => c.id === p.course_id);
    return acc + (course?.estimated_time || 0);
  }, 0);

  const avgProgress = myProgress.length > 0 
    ? Math.round(myProgress.reduce((acc, p) => acc + p.overall_progress, 0) / myProgress.length)
    : 0;

  if (coursesLoading || progressLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c2341] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading progress...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">My Learning Progress</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track your learning journey and achievements
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BookOpen className="h-8 w-8 text-[#1c2341]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Enrolled Courses</p>
              <p className="text-2xl font-semibold text-gray-900">{enrolledCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Award className="h-8 w-8 text-[#eac66d]" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Certificates Earned</p>
              <p className="text-2xl font-semibold text-gray-900">{completedCourses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Average Progress</p>
              <p className="text-2xl font-semibold text-gray-900">{avgProgress}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Study Time</p>
              <p className="text-2xl font-semibold text-gray-900">{totalStudyTime}m</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Courses */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Courses in Progress</h2>
          </div>
          <div className="p-6">
            {inProgressCourses > 0 ? (
              <div className="space-y-4">
                {myProgress.filter(p => !p.certificate_earned && p.overall_progress < 100).map((progress) => {
                  const course = courses.find(c => c.id === progress.course_id);
                  if (!course) return null;
                  
                  return (
                    <div key={progress.course_id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900">{course.title}</h3>
                        <span className="text-sm text-gray-500">{progress.overall_progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                        <div 
                          className="bg-[#eac66d] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.overall_progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{progress.completed_modules?.length || 0} of {course.modules?.length || 0} modules</span>
                        <Link
                          to={`/courses/${course.id}`}
                          className="text-[#1c2341] hover:text-[#2a3454] font-medium"
                        >
                          Continue →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No courses currently in progress</p>
                <Link
                  to="/courses"
                  className="mt-2 inline-block text-sm text-[#1c2341] hover:text-[#2a3454] font-medium"
                >
                  Browse courses →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Completed Courses */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Completed Courses</h2>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                {completedCourses} Certificates
              </span>
            </div>
          </div>
          <div className="p-6">
            {completedCourses > 0 ? (
              <div className="space-y-4">
                {myProgress.filter(p => p.certificate_earned || p.overall_progress >= 100).map((progress) => {
                  const course = courses.find(c => c.id === progress.course_id);
                  if (!course) return null;
                  
                  return (
                    <div key={progress.course_id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex-shrink-0">
                        <div className="bg-green-100 p-2 rounded-full">
                          <Award className="h-5 w-5 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{course.title}</h3>
                        <p className="text-sm text-gray-500">
                          Completed {progress.completed_at ? new Date(progress.completed_at).toLocaleDateString() : 'Recently'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                          {progress.overall_progress}%
                        </span>
                        <Link
                          to={`/courses/${course.id}`}
                          className="text-green-600 hover:text-green-800 font-medium text-sm"
                        >
                          Certificate
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500">No certificates earned yet</p>
                <p className="text-sm text-gray-400 mt-1">Complete a course to earn your first certificate!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Learning Timeline */}
      {myProgress.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Learning Timeline</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {myProgress
                .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
                .map((progress) => {
                  const course = courses.find(c => c.id === progress.course_id);
                  if (!course) return null;
                  
                  return (
                    <div key={progress.course_id} className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-full ${
                          progress.certificate_earned ? 'bg-green-100' : 'bg-blue-100'
                        }`}>
                          {progress.certificate_earned ? (
                            <Award className="h-4 w-4 text-green-600" />
                          ) : (
                            <BookOpen className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">{course.title}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(progress.started_at).toLocaleDateString()}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {progress.certificate_earned 
                            ? `Completed with certificate`
                            : `${progress.overall_progress}% complete`
                          }
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;