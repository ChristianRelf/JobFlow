import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  MessageCircle, 
  Mail, 
  HelpCircle,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';

const Support: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#151b2e] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <GraduationCap className="h-8 w-8 text-[#eac66d]" />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white">Oakridge</h1>
                <p className="text-sm text-gray-300 -mt-1">Education Portal</p>
              </div>
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 bg-[#eac66d] text-[#1c2341] rounded-md hover:bg-[#deb659] transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Get help and support for your Oakridge Education Portal experience
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Discord Support */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-gray-200">
            <div className="flex items-center mb-6">
              <div className="bg-[#5865F2] p-3 rounded-full">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Discord Community</h2>
                <p className="text-gray-600">Join our active community</p>
              </div>
            </div>
            
            <p className="text-sm sm:text-base text-gray-700 mb-6">
              Connect with other students, get real-time help from staff, and stay updated 
              with the latest announcements in our Discord server.
            </p>
            
            <a
              href="https://discord.gg/TEkyjfSPKe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[#5865F2] text-white text-sm sm:text-base rounded-lg hover:bg-[#4752C4] transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              Join Discord Server
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </div>

          {/* Email Support */}
          <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-gray-200">
            <div className="flex items-center mb-6">
              <div className="bg-[#1c2341] p-3 rounded-full">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Email Support</h2>
                <p className="text-gray-600">Direct contact with our team</p>
              </div>
            </div>
            
            <p className="text-sm sm:text-base text-gray-700 mb-6">
              For more formal inquiries, technical issues, or detailed support requests, 
              reach out to us via email and we'll get back to you as soon as possible.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <Mail className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <a href="mailto:oakridgesupport@chrisrelf.dev" className="text-blue-600 hover:text-blue-800 text-sm">
                      oakridgesupport@chrisrelf.dev
                    </a>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Response time: Within 24-48 hours
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 sm:mt-12 bg-white rounded-lg shadow-lg p-6 sm:p-8 border border-gray-200">
          <div className="flex items-center mb-6">
            <HelpCircle className="h-8 w-8 text-[#eac66d] mr-3" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                How do I apply to join Oakridge Operations Group?
              </h3>
              <p className="text-sm sm:text-base text-gray-700">
                Sign in with Discord and complete the application form. Our staff will review 
                your application and notify you of the decision.
              </p>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                What happens after my application is accepted?
              </h3>
              <p className="text-sm sm:text-base text-gray-700">
                Once accepted, you'll gain access to our education portal where you can 
                enroll in courses, track your progress, and earn certificates.
              </p>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                How do I access courses?
              </h3>
              <p className="text-sm sm:text-base text-gray-700">
                After being accepted as a student, you can browse and enroll in available 
                courses through the education portal dashboard.
              </p>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                Can I retake courses or quizzes?
              </h3>
              <p className="text-sm sm:text-base text-gray-700">
                Course retaking policies may vary. Please check with staff in our Discord 
                server for specific course requirements and retake policies.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-8 sm:mt-12 text-center bg-gradient-to-r from-[#1c2341] to-[#2a3454] rounded-lg p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
            Still Need Help?
          </h2>
          <p className="text-sm sm:text-base text-gray-300 mb-4 sm:mb-6">
            Our community and staff are here to help you succeed in your learning journey.
          </p>
          <a
            href="https://discord.gg/TEkyjfSPKe"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-[#eac66d] text-[#1c2341] text-sm sm:text-base rounded-lg hover:bg-[#deb659] transition-colors duration-200"
          >
            Get Help on Discord
            <ExternalLink className="h-4 w-4 ml-2" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Support;