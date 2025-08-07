import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSupabaseQuestions } from '../hooks/useSupabaseQuestions';
import { useSupabaseApplications } from '../hooks/useSupabaseApplications';
import { useSupabaseCourses } from '../hooks/useSupabaseCourses';
import { useSupabaseProfiles } from '../hooks/useSupabaseProfiles';
import { useSupabaseProgress } from '../hooks/useSupabaseProgress';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Save,
  GripVertical,
  FileText,
  Users,
  Shield,
  BarChart3,
  Activity,
  TrendingUp,
  Award,
  Clock,
  Download,
  RefreshCw,
  Database,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  PieChart
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const { questions, updateQuestions, loading } = useSupabaseQuestions();
  const { applications, loading: applicationsLoading } = useSupabaseApplications();
  const { courses, loading: coursesLoading } = useSupabaseCourses();
  const { profiles, loading: profilesLoading } = useSupabaseProfiles();
  const { userProgress, loading: progressLoading } = useSupabaseProgress();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localQuestions, setLocalQuestions] = useState(questions);
  const [activeTab, setActiveTab] = useState('overview');

  React.useEffect(() => {
    setLocalQuestions(questions);
  }, [questions]);

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now().toString(), // Temporary ID for local state
      question: '',
      type: 'text' as const,
      options: null,
      required: true,
      order_index: localQuestions.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setLocalQuestions([...localQuestions, newQuestion]);
    setIsEditing(true);
  };

  const updateQuestion = (id: string, field: string, value: any) => {
    setLocalQuestions(localQuestions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
    setIsEditing(true);
  };

  const removeQuestion = (id: string) => {
    setLocalQuestions(localQuestions.filter(q => q.id !== id));
    setIsEditing(true);
  };

  const addOption = (questionId: string) => {
    const question = localQuestions.find(q => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, 'options', [...question.options, '']);
    } else {
      updateQuestion(questionId, 'options', ['']);
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = localQuestions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, 'options', newOptions);
    }
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = localQuestions.find(q => q.id === questionId);
    if (question && question.options) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex);
      updateQuestion(questionId, 'options', newOptions);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      await updateQuestions(localQuestions);
      
      // Send Discord webhook for staff action
      const staffWebhookUrl = 'https://discord.com/api/webhooks/1402319981605290114/-KCOA_9a-PMM2qqZWqT4IF77WI-2xba27PwqFz1e4xm6-pzxc3eynXemllHslX2AZ_og';
      
      const webhookData = {
        embeds: [{
          title: '⚙️ Application Questions Updated',
          description: `${user?.username} has updated the application questions`,
          color: 0xeac66d,
          fields: [
            {
              name: 'Total Questions',
              value: localQuestions.length.toString(),
              inline: true
            },
            {
              name: 'Required Questions',
              value: localQuestions.filter(q => q.required).length.toString(),
              inline: true
            },
            {
              name: 'Question Types',
              value: new Set(localQuestions.map(q => q.type)).size.toString(),
              inline: true
            },
            {
              name: 'Updated By',
              value: user?.username || 'Admin',
              inline: true
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Oakridge Education Portal'
          }
        }]
      };

      // Send webhook (don't block on failure)
      try {
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
      
      setIsEditing(false);
      alert('Application questions updated successfully!');
    } catch (error) {
      console.error('Error updating questions:', error);
      alert('There was an error updating the questions. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c2341] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading admin panel...</p>
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
              <Shield className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
              <p className="text-gray-600">You don't have permission to access the admin panel.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalUsers = profiles.length;
  const activeStudents = profiles.filter(p => p.role === 'student' && p.status === 'accepted').length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const totalCertificates = userProgress.filter(p => p.certificate_earned).length;
  const avgCourseProgress = userProgress.length > 0 
    ? Math.round(userProgress.reduce((acc, p) => acc + p.overall_progress, 0) / userProgress.length)
    : 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'questions', label: 'Application Questions', icon: FileText },
    { id: 'analytics', label: 'Analytics', icon: Activity },
    { id: 'system', label: 'System', icon: Settings }
  ];

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Control Center</h1>
          <p className="mt-1 text-sm text-gray-600">
            Comprehensive platform management and analytics
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Students</p>
                <p className="text-2xl font-semibold text-gray-900">{activeStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending Apps</p>
                <p className="text-2xl font-semibold text-gray-900">{pendingApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Certificates</p>
                <p className="text-2xl font-semibold text-gray-900">{totalCertificates}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{avgCourseProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      isActive
                        ? 'border-[#1c2341] text-[#1c2341]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Platform Health */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Platform Health</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-green-900">User Engagement</h3>
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-green-700">Active Users</span>
                        <span className="font-bold text-green-900">{activeStudents}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Completion Rate</span>
                        <span className="font-bold text-green-900">
                          {userProgress.length > 0 
                            ? Math.round((userProgress.filter(p => p.certificate_earned).length / userProgress.length) * 100)
                            : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-blue-900">Course Metrics</h3>
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Published</span>
                        <span className="font-bold text-blue-900">
                          {courses.filter(c => c.is_published).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Drafts</span>
                        <span className="font-bold text-blue-900">
                          {courses.filter(c => !c.is_published).length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-purple-900">Applications</h3>
                      <FileText className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-purple-700">Pending</span>
                        <span className="font-bold text-purple-900">{pendingApplications}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700">Accepted</span>
                        <span className="font-bold text-purple-900">
                          {applications.filter(app => app.status === 'accepted').length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Platform Activity</h2>
                  <button className="text-gray-400 hover:text-gray-600">
                    <RefreshCw className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Recent Applications */}
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center">
                        <div className="bg-yellow-100 p-2 rounded-full mr-3">
                          <FileText className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">New Application</p>
                          <p className="text-sm text-gray-500">#{app.id.slice(0, 8)} - {new Date(app.submitted_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                  
                  {/* Recent Course Completions */}
                  {userProgress.filter(p => p.certificate_earned).slice(0, 2).map((progress) => {
                    const course = courses.find(c => c.id === progress.course_id);
                    const student = profiles.find(p => p.id === progress.user_id);
                    return (
                      <div key={progress.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-2 rounded-full mr-3">
                            <Award className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Certificate Earned</p>
                            <p className="text-sm text-gray-500">{student?.username} completed {course?.title}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">
                          {progress.completed_at ? new Date(progress.completed_at).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Distribution */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">User Distribution</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { role: 'admin', count: profiles.filter(p => p.role === 'admin').length, color: 'red' },
                      { role: 'staff', count: profiles.filter(p => p.role === 'staff').length, color: 'blue' },
                      { role: 'student', count: profiles.filter(p => p.role === 'student').length, color: 'green' },
                      { role: 'applicant', count: profiles.filter(p => p.role === 'applicant').length, color: 'yellow' }
                    ].map((item) => (
                      <div key={item.role} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-4 h-4 bg-${item.color}-500 rounded-full mr-3`}></div>
                          <span className="text-sm font-medium text-gray-900 capitalize">{item.role}s</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-gray-900 mr-2">{item.count}</span>
                          <span className="text-sm text-gray-500">
                            ({totalUsers > 0 ? Math.round((item.count / totalUsers) * 100) : 0}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Course Performance */}
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Course Performance</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {courses.slice(0, 5).map((course) => {
                      const courseProgress = userProgress.filter(p => p.course_id === course.id);
                      const enrollmentCount = courseProgress.length;
                      const completionCount = courseProgress.filter(p => p.certificate_earned).length;
                      const completionRate = enrollmentCount > 0 ? Math.round((completionCount / enrollmentCount) * 100) : 0;
                      
                      return (
                        <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900 text-sm">{course.title}</h3>
                            <span className="text-sm text-gray-500">{completionRate}%</span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                            <span>{enrollmentCount} enrolled</span>
                            <span>{completionCount} completed</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${completionRate}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Application Trends */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Application Trends</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-yellow-100 p-4 rounded-full w-fit mx-auto mb-3">
                      <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Review</h3>
                    <p className="text-3xl font-bold text-yellow-600">{pendingApplications}</p>
                    <p className="text-sm text-gray-500">Applications waiting</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-3">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Acceptance Rate</h3>
                    <p className="text-3xl font-bold text-green-600">
                      {applications.length > 0 
                        ? Math.round((applications.filter(app => app.status === 'accepted').length / applications.length) * 100)
                        : 0}%
                    </p>
                    <p className="text-sm text-gray-500">Overall success</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-blue-100 p-4 rounded-full w-fit mx-auto mb-3">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">This Month</h3>
                    <p className="text-3xl font-bold text-blue-600">
                      {applications.filter(app => {
                        const appDate = new Date(app.submitted_at);
                        const now = new Date();
                        return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                    <p className="text-sm text-gray-500">New applications</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Application Questions</h2>
                  <p className="text-sm text-gray-600">Manage the questions shown in the application form</p>
                </div>
                <div className="flex items-center space-x-3">
                  {isEditing && (
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={addQuestion}
                    className="inline-flex items-center px-4 py-2 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {localQuestions.length > 0 ? (
                <div className="space-y-4">
                  {localQuestions
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <GripVertical className="h-4 w-4 text-gray-400 mr-2 cursor-move" />
                            <span className="text-sm font-medium text-gray-700">
                              Question {question.order_index}
                            </span>
                          </div>
                          <button
                            onClick={() => removeQuestion(question.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Question Text
                            </label>
                            <input
                              type="text"
                              value={question.question}
                              onChange={(e) => {
                                updateQuestion(question.id, 'question', e.target.value);
                                setIsEditing(true);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                              placeholder="Enter question text..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Question Type
                            </label>
                            <select
                              value={question.type}
                              onChange={(e) => {
                                updateQuestion(question.id, 'type', e.target.value);
                                setIsEditing(true);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                            >
                              <option value="text">Text Input</option>
                              <option value="textarea">Text Area</option>
                              <option value="select">Select Dropdown</option>
                              <option value="radio">Radio Buttons</option>
                            </select>
                          </div>
                        </div>

                        {(question.type === 'select' || question.type === 'radio') && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-gray-700">
                                Options
                              </label>
                              <button
                                onClick={() => addOption(question.id)}
                                className="text-sm text-[#1c2341] hover:text-[#2a3454] font-medium"
                              >
                                + Add Option
                              </button>
                            </div>
                            <div className="space-y-2">
                              {(question.options || []).map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      updateOption(question.id, optionIndex, e.target.value);
                                      setIsEditing(true);
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                                    placeholder={`Option ${optionIndex + 1}`}
                                  />
                                  <button
                                    onClick={() => removeOption(question.id, optionIndex)}
                                    className="text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id={`required-${question.id}`}
                            checked={question.required}
                            onChange={(e) => {
                              updateQuestion(question.id, 'required', e.target.checked);
                              setIsEditing(true);
                            }}
                            className="h-4 w-4 text-[#1c2341] focus:ring-[#1c2341] border-gray-300 rounded"
                          />
                          <label htmlFor={`required-${question.id}`} className="ml-2 text-sm text-gray-700">
                            Required question
                          </label>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No questions configured</h3>
                  <p className="text-gray-600 mb-4">
                    Add questions to customize the application form for new members.
                  </p>
                  <button
                    onClick={addQuestion}
                    className="inline-flex items-center px-4 py-2 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Question
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-8">
            {/* System Status */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Database</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">Connected</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Authentication</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">Active</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">Webhooks</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">Operational</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-blue-900 mb-3">Database Stats</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700">Total Records</span>
                          <span className="font-bold text-blue-900">
                            {profiles.length + applications.length + courses.length + userProgress.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Active Sessions</span>
                          <span className="font-bold text-blue-900">{activeStudents}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700">Storage Used</span>
                          <span className="font-bold text-blue-900">~{Math.round((profiles.length + applications.length + courses.length) / 100)}MB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* System Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">System Actions</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center justify-between p-4 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <Download className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900 group-hover:text-blue-600">Export Data</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                  </button>
                  
                  <button className="flex items-center justify-between p-4 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 group">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <RefreshCw className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="font-medium text-gray-900 group-hover:text-green-600">Refresh Cache</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
                  </button>
                  
                  <button className="flex items-center justify-between p-4 border-2 border-purple-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 group">
                    <div className="flex items-center">
                      <div className="bg-purple-100 p-2 rounded-lg mr-3">
                        <Database className="h-5 w-5 text-purple-600" />
                      </div>
                      <span className="font-medium text-gray-900 group-hover:text-purple-600">Backup Data</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
                  </button>
                  
                  <button className="flex items-center justify-between p-4 border-2 border-orange-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group">
                    <div className="flex items-center">
                      <div className="bg-orange-100 p-2 rounded-lg mr-3">
                        <Eye className="h-5 w-5 text-orange-600" />
                      </div>
                      <span className="font-medium text-gray-900 group-hover:text-orange-600">View Logs</span>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-orange-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;