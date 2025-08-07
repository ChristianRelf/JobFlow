import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSupabaseCourses } from '../hooks/useSupabaseCourses';
import { useSupabaseProgress } from '../hooks/useSupabaseProgress';
import { useSupabaseApplications } from '../hooks/useSupabaseApplications';
import { 
  BookOpen, 
  Users, 
  FileText, 
  Award,
  Clock,
  TrendingUp,
  BarChart3,
  Shield,
  ArrowRight,
  Zap,
  Trophy,
  BookMarked,
  Target,
  Calendar,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { courses, loading: coursesLoading } = useSupabaseCourses();
  const { userProgress, loading: progressLoading } = useSupabaseProgress();
  const { applications, loading: applicationsLoading } = useSupabaseApplications();

  const myProgress = userProgress.filter(p => p.user_id === user?.id);
  const enrolledCourses = myProgress.length;
  const completedCourses = myProgress.filter(p => p.certificate_earned || p.overall_progress >= 100).length;
  const inProgressCourses = myProgress.filter(p => !p.certificate_earned && p.overall_progress < 100).length;
  const avgProgress = myProgress.length > 0 
    ? Math.round(myProgress.reduce((acc, p) => acc + p.overall_progress, 0) / myProgress.length)
    : 0;

  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const totalUsers = applications.length; // Approximate based on applications
  const recentApplications = applications.slice(0, 3);

  if (coursesLoading || progressLoading || applicationsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c2341] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const getDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return (
          <>
            {/* Admin Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-[#1c2341]" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900">{totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Applications</p>
                    <p className="text-2xl font-semibold text-gray-900">{pendingApplications}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Courses</p>
                    <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Award className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Certificates Issued</p>
                    <p className="text-2xl font-semibold text-gray-900">{completedCourses}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Link
                to="/applications"
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Applications</h3>
                    <p className="text-gray-600">Manage pending applications</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full group-hover:bg-yellow-200 transition-colors duration-200">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </Link>

              <Link
                to="/create-course"
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Course</h3>
                    <p className="text-gray-600">Add new educational content</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors duration-200">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </Link>

              <Link
                to="/admin"
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Panel</h3>
                    <p className="text-gray-600">System configuration</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-full group-hover:bg-red-200 transition-colors duration-200">
                    <Shield className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </Link>
            </div>
          </>
        );

      case 'staff':
        return (
          <>
            {/* Staff Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FileText className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Pending Applications</p>
                    <p className="text-2xl font-semibold text-gray-900">{pendingApplications}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BookOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Courses</p>
                    <p className="text-2xl font-semibold text-gray-900">{courses.filter(c => c.is_published).length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Active Students</p>
                    <p className="text-2xl font-semibold text-gray-900">{userProgress.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Staff Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Link
                to="/applications"
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Applications</h3>
                    <p className="text-gray-600">Process new member applications</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full group-hover:bg-yellow-200 transition-colors duration-200">
                    <FileText className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </Link>

              <Link
                to="/create-course"
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Course</h3>
                    <p className="text-gray-600">Develop new training content</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-200 transition-colors duration-200">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </Link>
            </div>
          </>
        );

      case 'student':
        return (
          <>
            {/* Student Stats */}
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
                    <p className="text-sm font-medium text-gray-500">Certificates</p>
                    <p className="text-2xl font-semibold text-gray-900">{completedCourses}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">In Progress</p>
                    <p className="text-2xl font-semibold text-gray-900">{inProgressCourses}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Avg Progress</p>
                    <p className="text-2xl font-semibold text-gray-900">{avgProgress}%</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Continue Learning Section */}
            <div className="bg-white rounded-lg shadow mb-8">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Continue Learning</h2>
              </div>
              <div className="p-6">
                {inProgressCourses > 0 ? (
                  <div className="space-y-4">
                    {myProgress.filter(p => !p.certificate_earned && p.overall_progress < 100).slice(0, 3).map((progress) => {
                      const course = courses.find(c => c.id === progress.course_id);
                      if (!course) return null;
                      
                      return (
                        <div key={progress.course_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="bg-[#1c2341] p-2 rounded-lg mr-4">
                              <BookOpen className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{course.title}</h3>
                              <div className="flex items-center mt-1">
                                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                                  <div 
                                    className="bg-[#eac66d] h-2 rounded-full"
                                    style={{ width: `${progress.overall_progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-500">{progress.overall_progress}%</span>
                              </div>
                            </div>
                          </div>
                          <Link
                            to={`/courses/${course.id}`}
                            className="inline-flex items-center px-4 py-2 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200"
                          >
                            Continue
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No courses in progress</h3>
                    <p className="text-gray-600 mb-4">Start learning by enrolling in a course</p>
                    <Link
                      to="/courses"
                      className="inline-flex items-center px-4 py-2 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200"
                    >
                      Browse Courses
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Achievements</h2>
              </div>
              <div className="p-6">
                {completedCourses > 0 ? (
                  <div className="space-y-4">
                    {myProgress.filter(p => p.certificate_earned || p.overall_progress >= 100).slice(0, 3).map((progress) => {
                      const course = courses.find(c => c.id === progress.course_id);
                      if (!course) return null;
                      
                      return (
                        <div key={progress.course_id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center">
                            <div className="bg-green-100 p-2 rounded-full mr-4">
                              <Award className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{course.title}</h3>
                              <p className="text-sm text-gray-500">
                                Completed {progress.completed_at ? new Date(progress.completed_at).toLocaleDateString() : 'Recently'}
                              </p>
                            </div>
                          </div>
                          <Link
                            to={`/courses/${course.id}`}
                            className="text-green-600 hover:text-green-800 font-medium"
                          >
                            View Certificate
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                    <p className="text-gray-600">Complete a course to earn your first certificate!</p>
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 'applicant':
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="bg-yellow-100 p-4 rounded-full w-fit mx-auto mb-6">
                <FileText className="h-12 w-12 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Complete Your Application</h2>
              <p className="text-gray-600 mb-6">
                Welcome to Oakridge Operations Group! To access our education platform, 
                please complete your application form.
              </p>
              <Link
                to="/apply"
                className="inline-flex items-center px-6 py-3 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200"
              >
                Start Application
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        );

      default:
        return (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="bg-gray-100 p-4 rounded-full w-fit mx-auto mb-6">
                <AlertCircle className="h-12 w-12 text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Setup Required</h2>
              <p className="text-gray-600 mb-6">
                Your account is being set up. Please contact an administrator if this persists.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.username}!
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {user?.role === 'admin' && 'Manage the platform and oversee all operations'}
              {user?.role === 'staff' && 'Review applications and manage courses'}
              {user?.role === 'student' && 'Continue your learning journey'}
              {user?.role === 'applicant' && 'Complete your application to get started'}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              user?.status === 'accepted' ? 'bg-green-100 text-green-800' :
              user?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {user?.status}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(user?.role || '')}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {getDashboardContent()}

      {/* Recent Activity for Admin/Staff */}
      {(user?.role === 'admin' || user?.role === 'staff') && recentApplications.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Applications</h2>
              <Link
                to="/applications"
                className="text-sm text-[#1c2341] hover:text-[#2a3454] font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="bg-yellow-100 p-2 rounded-full mr-4">
                      <FileText className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        Application #{application.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Submitted {new Date(application.submitted_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {application.status}
                    </span>
                    <Link
                      to={`/applications/${application.id}`}
                      className="text-[#1c2341] hover:text-[#2a3454] font-medium text-sm"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;