import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSupabaseCourses } from '../hooks/useSupabaseCourses';
import { 
  BookOpen, 
  ArrowLeft,
  Save,
  AlertCircle
} from 'lucide-react';

const EditCourse: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { courses, updateCourse, loading } = useSupabaseCourses();
  
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    estimatedTime: 60,
    isPublished: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const course = courses.find(c => c.id === id);

  useEffect(() => {
    if (course) {
      setCourseData({
        title: course.title,
        description: course.description,
        estimatedTime: course.estimated_time,
        isPublished: course.is_published
      });
    }
  }, [course]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c2341] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Course Not Found</h2>
              <p className="text-gray-600 mb-4">The course you're trying to edit doesn't exist.</p>
              <button
                onClick={() => navigate('/courses')}
                className="px-4 py-2 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200"
              >
                Back to Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">Only administrators can edit courses.</p>
              <button
                onClick={() => navigate('/courses')}
                className="px-4 py-2 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200"
              >
                Back to Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !course) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await updateCourse(course.id, {
        title: courseData.title,
        description: courseData.description,
        estimated_time: courseData.estimatedTime,
        is_published: courseData.isPublished
      });

      // Send Discord webhook for course update
      try {
        const staffWebhookUrl = 'https://discord.com/api/webhooks/1402319981605290114/-KCOA_9a-PMM2qqZWqT4IF77WI-2xba27PwqFz1e4xm6-pzxc3eynXemllHslX2AZ_og';
        
        const webhookData = {
          embeds: [{
            title: '✏️ Course Updated',
            description: `${user.username} has updated a course`,
            color: 0x1c2341,
            fields: [
              {
                name: 'Course Title',
                value: courseData.title,
                inline: false
              },
              {
                name: 'Estimated Time',
                value: `${courseData.estimatedTime} minutes`,
                inline: true
              },
              {
                name: 'Status',
                value: courseData.isPublished ? 'Published' : 'Draft',
                inline: true
              },
              {
                name: 'Updated By',
                value: user.username,
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

      navigate(`/courses/${course.id}`);
    } catch (error) {
      console.error('Error updating course:', error);
      setError('There was an error updating the course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/courses')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-[#1c2341] p-2 rounded-full mr-4">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
                <p className="text-gray-600">Update course information and settings</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-6 border-b border-gray-200">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <span className="text-red-800">{error}</span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={courseData.estimatedTime}
                    onChange={(e) => setCourseData({ ...courseData, estimatedTime: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description *
                </label>
                <textarea
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                  required
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={courseData.isPublished}
                  onChange={(e) => setCourseData({ ...courseData, isPublished: e.target.checked })}
                  className="h-4 w-4 text-[#1c2341] focus:ring-[#1c2341] border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700">
                  Publish course (make it visible to students)
                </label>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/courses')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !courseData.title || !courseData.description}
                className="inline-flex items-center px-6 py-2 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update Course
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCourse;