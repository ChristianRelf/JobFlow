import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSupabaseCourses } from '../hooks/useSupabaseCourses';
import { useSupabaseProgress } from '../hooks/useSupabaseProgress';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { 
  BookOpen, 
  Clock, 
  Users, 
  Award,
  Search,
  Filter,
  Plus,
  Play,
  CheckCircle,
  Edit,
  Trash2,
  MoreVertical
} from 'lucide-react';

const Courses: React.FC = () => {
  const { user } = useAuth();
  const { courses, loading: coursesLoading, deleteCourse, refetch: refetchCourses } = useSupabaseCourses();
  const { userProgress, loading: progressLoading, refetch: refetchProgress } = useSupabaseProgress();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const myProgress = userProgress || [];

  const filteredCourses = courses.filter(course => {
    // Only show published courses to students, show all to staff/admin
    if (user?.role === 'student' && !course.is_published) {
      return false;
    }
    
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filterBy === 'enrolled') {
      return myProgress.some(p => p.course_id === course.id);
    }
    if (filterBy === 'completed') {
      return myProgress.some(p => p.course_id === course.id && (p.certificate_earned || p.overall_progress >= 100));
    }
    if (filterBy === 'in-progress') {
      return myProgress.some(p => p.course_id === course.id && !p.certificate_earned && p.overall_progress < 100);
    }
    if (filterBy === 'available') {
      return !myProgress.some(p => p.course_id === course.id);
    }
    
    return true;
  });

  const getCourseProgress = (courseId: string) => {
    return myProgress.find(p => p.course_id === courseId);
  };

  const canCreateCourse = user?.role === 'staff' || user?.role === 'admin';
  const canManageCourses = user?.role === 'admin';

  // Calculate stats properly - ensure we have valid progress data
  const enrolledCourses = myProgress.length;
  const completedCourses = myProgress.filter(p => p.certificate_earned || p.overall_progress >= 100).length;
  const inProgressCourses = myProgress.filter(p => !p.certificate_earned && p.overall_progress < 100).length;

  const handleDeleteCourse = async (courseId: string) => {
    if (!canManageCourses) return;
    
    setIsDeleting(true);
    try {
      await deleteCourse(courseId);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting course:', error);
      alert('There was an error deleting the course. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (coursesLoading || progressLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c2341] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading courses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.role === 'student' ? 'My Courses' : 'Course Management'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {user?.role === 'student' 
                ? 'Continue your learning journey with our comprehensive courses'
                : 'Manage and create courses for the education platform'
              }
            </p>
          </div>
          {canCreateCourse && (
            <Link
              to="/create-course"
              className="inline-flex items-center px-4 py-2 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
          />
        </div>
        
        {user?.role === 'student' && (
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <select
              value={filterBy}
              onChange={(e) => setFilterBy(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
            >
              <option value="all">All Courses</option>
              <option value="enrolled">Enrolled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        )}
      </div>

      {/* Stats Cards for Students */}
      {user?.role === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-8 w-8 text-[#1c2341]" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available</p>
                <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Enrolled</p>
                <p className="text-2xl font-semibold text-gray-900">{enrolledCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {inProgressCourses}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {completedCourses}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const progress = getCourseProgress(course.id);
            const isEnrolled = !!progress;
            const isCompleted = progress ? (progress.certificate_earned || progress.overall_progress >= 100) : false;
            
            return (
              <div key={course.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-[#1c2341] p-2 rounded-lg">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      {isCompleted && (
                        <div className="ml-2 bg-green-100 p-1 rounded-full">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      course.isPublished 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <div className="text-gray-600 text-sm mb-4 line-clamp-3">
                    <MarkdownRenderer content={course.description} className="prose-sm" />
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {course.modules?.length || 0} modules
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {course.estimated_time} min
                    </div>
                  </div>

                  {isEnrolled && progress && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-medium text-gray-900">{progress.overall_progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#eac66d] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.overall_progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Created by {course.created_by || 'Staff'}
                    </div>
                    <Link
                      to={`/courses/${course.id}`}
                      className="inline-flex items-center px-3 py-1 bg-[#1c2341] text-white text-sm rounded-md hover:bg-[#2a3454] transition-colors duration-200"
                    >
                      {isEnrolled ? (
                        isCompleted ? (
                          <>
                            <Award className="h-4 w-4 mr-1" />
                            View Certificate
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Continue
                          </>
                        )
                      ) : (
                        <>
                          <BookOpen className="h-4 w-4 mr-1" />
                          View Course
                        </>
                      )}
                    </Link>
                  </div>
                </div>
                
                {/* Management Actions */}
                {canManageCourses && (
                  <div className="px-6 pb-4 flex items-center justify-end space-x-2 border-t border-gray-100 pt-4">
                    <Link
                      to={`/edit-course/${course.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200 bg-gray-50 hover:bg-blue-50 rounded-lg"
                      title="Edit course"
                    >
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(course.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200 bg-gray-50 hover:bg-red-50 rounded-lg"
                      title="Delete course"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterBy !== 'all' 
              ? 'Try adjusting your search or filter criteria.'
              : courses.length === 0 
                ? 'No courses have been created yet.'
                : 'No courses match your current filter.'
            }
          </p>
          {canCreateCourse && courses.length === 0 && (
            <Link
              to="/create-course"
              className="mt-4 inline-flex items-center px-4 py-2 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Course
            </Link>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Course</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this course? This action cannot be undone and will remove all associated modules, quizzes, and student progress.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCourse(showDeleteModal)}
                disabled={isDeleting}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Course
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Courses;