import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSupabaseQuestions } from '../hooks/useSupabaseQuestions';
import { useSupabaseApplications } from '../hooks/useSupabaseApplications';
import { 
  FileText, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock,
  User,
  Calendar,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { applications, updateApplicationStatus, loading } = useSupabaseApplications();
  const { questions, loading: questionsLoading } = useSupabaseQuestions();
  const [notes, setNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (loading || questionsLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c2341] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading application...</p>
          </div>
        </div>
      </div>
    );
  }

  const application = applications.find(app => app.id === id);

  if (!application) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Application Not Found</h2>
              <p className="text-gray-600 mb-4">The application you're looking for doesn't exist.</p>
              <button
                onClick={() => navigate('/applications')}
                className="px-4 py-2 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200"
              >
                Back to Applications
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = async (newStatus: 'accepted' | 'denied') => {
    if (!user) return;

    setError(null);
    setIsUpdating(true);

    try {
      console.log('Updating application status:', application.id, newStatus);
      await updateApplicationStatus(application.id, newStatus, notes);

      // Show success message
      console.log(`Application ${newStatus} successfully!`);
      
      // Navigate back to applications list
      navigate('/applications');
    } catch (error) {
      console.error('Error updating application:', error);
      setError(`There was an error updating the application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'denied':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/applications')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Applications
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-[#1c2341] p-2 rounded-full mr-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Application #{application.id.slice(0, 8)}
                  </h1>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-gray-600">
                      Submitted {new Date(application.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                {getStatusIcon(application.status)}
                <span className={`ml-2 px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(application.status)}`}>
                  {application.status}
                </span>
              </div>
            </div>
          </div>

          {/* Application Responses */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Responses</h2>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-red-100 p-2 rounded-full">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-6">
              {questions.length > 0 ? questions
                .sort((a, b) => a.order - b.order)
                .map((question) => {
                  const response = application.responses?.[question.id];
                  if (!response) return null;

                  return (
                    <div key={question.id} className="border-b border-gray-200 pb-4">
                      <h3 className="text-sm font-medium text-gray-900 mb-2">
                        {question.question}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-gray-700 whitespace-pre-wrap">{response}</p>
                      </div>
                    </div>
                  );
                }) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Questions Available</h3>
                  <p className="text-gray-600">Unable to load application questions.</p>
                </div>
              )}
              
              {questions.length > 0 && Object.keys(application.responses || {}).length === 0 && (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Responses</h3>
                  <p className="text-gray-600">This application doesn't contain any responses.</p>
                </div>
              )}
            </div>
          </div>

          {/* Review Section */}
          {application.status === 'pending' && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Application</h2>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                  placeholder="Add any notes about this application..."
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => handleStatusUpdate('denied')}
                  disabled={isUpdating}
                  className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Deny Application
                </button>
                <button
                  onClick={() => handleStatusUpdate('accepted')}
                  disabled={isUpdating}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Accept Application
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Review History */}
          {application.status !== 'pending' && (
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Review History</h2>
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {getStatusIcon(application.status)}
                    <span className="ml-2 font-medium text-gray-900">
                      Application {application.status}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {application.reviewed_at && new Date(application.reviewed_at).toLocaleDateString()}
                  </span>
                </div>
                {application.reviewed_by && (
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <User className="h-4 w-4 mr-1" />
                    Reviewed by staff member
                  </div>
                )}
                {application.notes && (
                  <div className="mt-3">
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Review Notes:
                    </div>
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{application.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;