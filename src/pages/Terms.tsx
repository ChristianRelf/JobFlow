import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  ArrowLeft,
  Shield,
  FileText,
  AlertTriangle,
  Users,
  Globe,
  Lock,
  UserCheck,
  Clock,
  MessageCircle,
  Scale,
  Eye,
  BookOpen,
  Settings
} from 'lucide-react';

const Terms: React.FC = () => {
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
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1c2341] to-[#2a3454] rounded-full mb-4">
              <Scale className="h-8 w-8 text-[#eac66d]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-lg text-gray-600 mb-2">
              Legal agreement for using our platform
            </p>
            <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              Last updated: August 2025
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="bg-amber-100 p-2 rounded-full">
                <AlertTriangle className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">Important Notice</h3>
              <p className="text-amber-800">
                By accessing and using the Oakridge Education Portal, you agree to be bound by these Terms of Service. 
                Please read them carefully before using our platform.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Section 1 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#1c2341] to-[#2a3454] px-6 py-4">
              <div className="flex items-center">
                <div className="bg-[#eac66d] p-2 rounded-lg mr-3">
                  <Shield className="h-5 w-5 text-[#1c2341]" />
                </div>
                <h2 className="text-xl font-semibold text-white">1. Acceptance of Terms</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                These Terms of Service ("Terms") govern your use of the Oakridge Education Portal operated by 
                Oakridge Operations Group. By accessing or using our service, you agree to be bound by these Terms.
              </p>
              <p className="text-gray-700">
                If you disagree with any part of these terms, then you may not access the service.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-lg mr-3">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-white">2. Description of Service</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                The Oakridge Education Portal is an online learning platform designed for members of the 
                Oakridge Operations Group Roblox community. Our service provides:
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Educational courses and training materials",
                  "Progress tracking and certification",
                  "Community interaction and support",
                  "Application and membership management"
                ].map((item, index) => (
                  <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-blue-600 text-sm font-bold">{index + 1}</span>
                    </div>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-lg mr-3">
                  <UserCheck className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-white">3. User Accounts and Registration</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                To access certain features of our service, you must register for an account using Discord authentication.
              </p>
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-900 mb-3">You are responsible for:</h3>
                <div className="space-y-2">
                  {[
                    "Maintaining the security of your account",
                    "All activities that occur under your account",
                    "Providing accurate and complete information",
                    "Notifying us of any unauthorized use"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-green-800 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-pink-600 px-6 py-4">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-lg mr-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h2 className="text-xl font-semibold text-white">4. Acceptable Use Policy</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-medium text-center">
                  You agree not to use the service for prohibited activities
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  "Violate any applicable laws or regulations",
                  "Harass, abuse, or harm other users",
                  "Share inappropriate or offensive content",
                  "Attempt to gain unauthorized access to the system",
                  "Interfere with the proper functioning of the service",
                  "Impersonate others or provide false information"
                ].map((item, index) => (
                  <div key={index} className="flex items-start p-3 border border-red-200 rounded-lg">
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-red-600 font-bold text-sm">×</span>
                    </div>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-violet-600 px-6 py-4">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-lg mr-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-white">5. Content and Intellectual Property</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                All content provided through the Oakridge Education Portal, including courses, materials, 
                and documentation, is the property of Oakridge Operations Group or its licensors.
              </p>
              <div className="bg-purple-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-purple-900 mb-3">You may not:</h3>
                <div className="space-y-2">
                  {[
                    "Copy, distribute, or reproduce our content without permission",
                    "Use our content for commercial purposes",
                    "Remove or modify any copyright notices"
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-purple-800 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-cyan-600 px-6 py-4">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-lg mr-3">
                  <Eye className="h-5 w-5 text-teal-600" />
                </div>
                <h2 className="text-xl font-semibold text-white">6. Privacy and Data Protection</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. We collect and use your information in accordance with 
                our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <div className="bg-teal-50 rounded-lg p-4">
                <p className="text-teal-800">
                  By using our service, you consent to the collection and use of your information as 
                  described in our Privacy Policy.
                </p>
              </div>
            </div>
          </div>

          {/* Remaining sections in compact format */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Termination */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500 to-red-500 px-4 py-3">
                <div className="flex items-center">
                  <div className="bg-white p-1.5 rounded mr-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">7. Termination</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    We may terminate or suspend your account and access to the service immediately, 
                    without prior notice, for any reason, including breach of these Terms.
                  </p>
                  <p>
                    Upon termination, your right to use the service will cease immediately, and any 
                    data associated with your account may be deleted.
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimers */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-500 to-slate-600 px-4 py-3">
                <div className="flex items-center">
                  <div className="bg-white p-1.5 rounded mr-2">
                    <Shield className="h-4 w-4 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">8. Disclaimers</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    The service is provided "as is" without warranties of any kind. We do not guarantee 
                    that the service will be uninterrupted, secure, or error-free.
                  </p>
                  <p>
                    To the fullest extent permitted by law, Oakridge Operations Group shall not be liable 
                    for any indirect, incidental, special, or consequential damages.
                  </p>
                </div>
              </div>
            </div>

            {/* Changes to Terms */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-blue-600 px-4 py-3">
                <div className="flex items-center">
                  <div className="bg-white p-1.5 rounded mr-2">
                    <Settings className="h-4 w-4 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">9. Changes to Terms</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3 text-sm text-gray-700">
                  <p>
                    We reserve the right to modify these Terms at any time. We will notify users of any 
                    material changes by posting the new Terms on this page.
                  </p>
                  <p>
                    Your continued use of the service after any changes constitutes acceptance of the new Terms.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 px-4 py-3">
                <div className="flex items-center">
                  <div className="bg-white p-1.5 rounded mr-2">
                    <MessageCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">10. Contact Us</h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-700 mb-3">
                  Questions about these Terms of Service?
                </p>
                <div className="space-y-2">
                  <div className="flex items-center p-2 bg-[#5865F2] bg-opacity-10 rounded">
                    <div className="w-6 h-6 bg-[#5865F2] rounded-full flex items-center justify-center mr-2">
                      <span className="text-white font-bold text-xs">D</span>
                    </div>
                    <a href="https://discord.gg/TEkyjfSPKe" target="_blank" rel="noopener noreferrer" className="text-[#5865F2] text-sm hover:underline">
                      Discord Server
                    </a>
                  </div>
                  <div className="flex items-center p-2 bg-gray-100 rounded">
                    <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white font-bold text-xs">@</span>
                    </div>
                    <a href="mailto:compliance@chrisrelf.dev" className="text-gray-600 hover:text-gray-800 text-sm">
                      compliance@chrisrelf.dev
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Agreement Section */}
        <div className="mt-12 bg-gradient-to-br from-[#1c2341] via-[#2a3454] to-[#1c2341] rounded-2xl p-8 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-20 h-20 border-2 border-[#eac66d] rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-[#eac66d] rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-[#eac66d] rounded-full"></div>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#eac66d] rounded-full mb-6">
              <Scale className="h-8 w-8 text-[#1c2341]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Agreement Acknowledgment
            </h2>
            <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
              By using the Oakridge Education Portal, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms of Service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#eac66d] text-[#1c2341] text-lg font-semibold rounded-lg hover:bg-[#deb659] transition-all duration-200 transform hover:scale-105"
              >
                I Agree - Sign In
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-[#1c2341] transition-all duration-200"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;