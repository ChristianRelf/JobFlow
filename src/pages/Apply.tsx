import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSupabaseQuestions } from '../hooks/useSupabaseQuestions';
import { useSupabaseApplications } from '../hooks/useSupabaseApplications';
import { 
  FileText, 
  Send, 
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

const Apply: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { submitApplication, getUserApplication } = useSupabaseApplications();
  const { questions } = useSupabaseQuestions();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user already has an application
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (user) {
        try {
          console.log('Checking existing application for user:', user.id);
          const existingApplication = await getUserApplication(user.id);
          console.log('Existing application result:', existingApplication);
          if (existingApplication && existingApplication.status === 'pending') {
            setHasSubmitted(true);
          } else if (existingApplication && existingApplication.status === 'accepted') {
            // User already accepted, redirect to dashboard
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error checking existing application:', error);
          setError('Failed to check application status');
        }
      }
      setLoading(false);
    };

    checkExistingApplication();
  }, [user?.id, getUserApplication, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c2341] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application form...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <div className="bg-red-100 p-3 rounded-full w-fit mx-auto mb-6">
                <AlertCircle className="h-12 w-12 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Application</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-6 py-3 bg-[#1c2341] text-white rounded-lg hover:bg-[#2a3454] transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const handleInputChange = (questionId: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    console.log('Starting application submission for user:', user.id);
    console.log('Current responses:', responses);
    console.log('Available questions:', questions);
    setIsSubmitting(true);

    // Validate required fields
    const requiredQuestions = questions.filter(q => q.required);
    console.log('Required questions:', requiredQuestions.map(q => ({ id: q.id, question: q.question })));
    const missingResponses = requiredQuestions.filter(q => !responses[q.id] || responses[q.id].trim() === '');
    
    if (missingResponses.length > 0) {
      console.log('Missing required responses:', missingResponses.map(q => q.question));
      const missingQuestions = missingResponses.map(q => q.question).join(', ');
      alert(`Please fill in all required fields: ${missingQuestions}`);
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('Submitting application with responses:', responses);
      const result = await submitApplication(responses);
      console.log('Application submitted successfully:', result);
      setHasSubmitted(true);
      
      // Show success message
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error submitting application:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to submit application: ${errorMessage}`);
      alert(`There was an error submitting your application: ${errorMessage}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1c2341] mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h1>
              <p className="text-gray-600 mb-6">
                Thank you for your interest in joining Oakridge Operations Group. 
                Your application has been submitted and is currently under review.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  <strong>What's next?</strong><br />
                  Our staff will review your application and notify you of the decision. 
                  You can check your application status in your dashboard.
                </p>
              </div>
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-6 py-3 bg-[#1c2341] text-white rounded-lg hover:bg-[#2a3454] transition-colors duration-200"
              >
                Go to Dashboard
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="bg-[#1c2341] p-2 rounded-full mr-4">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Join Oakridge Operations Group</h1>
                <p className="text-gray-600">Complete this application to join our education program</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Debug info in development */}
            {import.meta.env.DEV && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Debug Info (Development Only)</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>Questions loaded: {questions.length}</p>
                  <p>User ID: {user?.id}</p>
                  <p>Responses: {Object.keys(responses).length} filled</p>
                  <p>Required questions: {questions.filter(q => q.required).length}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {questions.sort((a, b) => a.order_index - b.order_index).map((question) => (
                <div key={question.id}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {question.type === 'text' && (
                    <input
                      type="text"
                      value={responses[question.id] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                      required={question.required}
                      placeholder="Enter your answer..."
                    />
                  )}

                  {question.type === 'textarea' && (
                    <textarea
                      value={responses[question.id] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                      required={question.required}
                      placeholder="Enter your detailed response..."
                    />
                  )}

                  {question.type === 'select' && question.options && (
                    <select
                      value={responses[question.id] || ''}
                      onChange={(e) => handleInputChange(question.id, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent"
                      required={question.required}
                    >
                      <option value="">Select an option...</option>
                      {(Array.isArray(question.options) ? question.options : []).map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}

                  {question.type === 'radio' && question.options && (
                    <div className="space-y-2">
                      {(Array.isArray(question.options) ? question.options : []).map((option) => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={responses[question.id] === option}
                            onChange={(e) => handleInputChange(question.id, e.target.value)}
                            className="h-4 w-4 text-[#1c2341] focus:ring-[#1c2341] border-gray-300"
                            required={question.required}
                          />
                          <span className="ml-2 text-gray-700">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {questions.length === 0 && (
                <div className="text-center py-8">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-yellow-900 mb-2">No Questions Available</h3>
                    <p className="text-yellow-800">
                      The application form is not configured yet. Please contact an administrator.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </button>

              <button
                type="submit"
                disabled={isSubmitting || questions.length === 0}
                className="inline-flex items-center px-6 py-3 bg-[#1c2341] text-white rounded-md hover:bg-[#2a3454] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Application
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

export default Apply;