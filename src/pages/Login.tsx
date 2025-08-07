import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, Users, BookOpen, Shield } from 'lucide-react';

const Login: React.FC = () => {
  const { signInWithDiscord, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  
  const roleUpdatedMessage = searchParams?.get('message') === 'role_updated';

  // If user is already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      console.log('User already logged in, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Handle OAuth callback - simplified
  React.useEffect(() => {
    const hasAuthParams = window.location.hash.includes('access_token') || 
                          window.location.hash.includes('error=');
    
    if (hasAuthParams) {
      console.log('Processing OAuth callback...');
      setIsLoading(true);
      
      // Wait for auth context to process the callback
      const checkAuth = setInterval(() => {
        if (user) {
          console.log('Auth successful, redirecting to dashboard');
          clearInterval(checkAuth);
          navigate('/dashboard');
        }
      }, 500);
      
      // Timeout after 10 seconds
      const timeout = setTimeout(() => {
        clearInterval(checkAuth);
        if (!user) {
          console.log('Auth timeout, stopping loading');
          setIsLoading(false);
        }
      }, 10000);
      
      return () => {
        clearInterval(checkAuth);
        clearTimeout(timeout);
      };
    }
  }, [user?.id, navigate]);

  const handleDiscordLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithDiscord();
      // Navigation will be handled by the auth context
    } catch (error) {
      console.error('Discord login error:', error);
      setIsLoading(false);
      alert('Failed to sign in with Discord. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1c2341] via-[#2a3454] to-[#1c2341] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Simplified Background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-16 h-16 border-2 border-[#eac66d] rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-12 h-12 bg-[#eac66d] rounded-full"></div>
      </div>
      
      <div className="max-w-md w-full space-y-8">
        {/* Main Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-gradient-to-br from-[#eac66d] to-[#deb659] p-4 rounded-2xl shadow-lg">
                <GraduationCap className="h-12 w-12 text-[#1c2341]" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome to Oakridge</h1>
            <p className="text-xl text-gray-300 mb-2">Education Portal</p>
            <p className="text-gray-400">
              Connect with Discord to access your learning dashboard
            </p>
          </div>

          {/* Discord Login Button */}
          <div className="space-y-4">
            {roleUpdatedMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-green-100 p-2 rounded-full">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      🎉 Congratulations! Your application has been accepted!
                    </h3>
                    <p className="text-sm text-green-700 mt-1">
                      You've been promoted to student status. Please sign in again to access your courses.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleDiscordLogin}
              disabled={isLoading}
              className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-center">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent mr-3"></div>
                    <span className="text-lg">Connecting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    <span className="text-lg">Continue with Discord</span>
                  </>
                )}
              </div>
            </button>
            
            <p className="text-center text-sm text-gray-400">
              Secure authentication powered by Discord
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Secure Login
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
              24/7 Support
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;