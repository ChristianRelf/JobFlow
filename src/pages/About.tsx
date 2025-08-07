import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Target, 
  Users, 
  Award,
  ArrowLeft,
  Shield,
  BookOpen,
  Star
} from 'lucide-react';

const About: React.FC = () => {
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4 sm:mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">About Oakridge Operations Group</h1>
          <p className="text-lg sm:text-xl text-gray-600">
            Empowering the next generation of Nuclear Lovers and Reactor Operators at the Oakridge Nuclear Power Plant!
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-gradient-to-r from-[#1c2341] to-[#2a3454] rounded-lg p-6 sm:p-8 mb-8 sm:mb-12 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-base sm:text-lg text-gray-300 mb-4 sm:mb-6">
                To provide world-class education and training opportunities that prepare individuals 
                for success in the rapidly evolving Roblox ecosystem and beyond.
              </p>
              <div className="flex items-center">
                <Target className="h-6 w-6 text-[#eac66d] mr-3" />
                <span className="text-[#eac66d] font-semibold">Excellence in Education</span>
              </div>
            </div>
            <div className="text-center mt-6 lg:mt-0">
              <div className="bg-white/10 rounded-full p-8 inline-block">
                <GraduationCap className="h-16 w-16 text-[#eac66d]" />
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-[#1c2341] p-4 rounded-full w-fit mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Integrity</h3>
              <p className="text-sm sm:text-base text-gray-600">
                We maintain the highest standards of honesty, transparency, and ethical conduct 
                in all our educational programs and interactions.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-[#eac66d] p-4 rounded-full w-fit mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-[#1c2341]" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Excellence</h3>
              <p className="text-sm sm:text-base text-gray-600">
                We strive for excellence in everything we do, from course content creation 
                to student support and community engagement.
              </p>
            </div>
            
            <div className="text-center">
              <div className="bg-[#1c2341] p-4 rounded-full w-fit mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">Community</h3>
              <p className="text-sm sm:text-base text-gray-600">
                We foster a supportive, inclusive community where learners can grow, 
                collaborate, and achieve their goals together.
              </p>
            </div>
          </div>
        </div>

        {/* What We Offer Section */}
        <div className="bg-gray-50 rounded-lg p-6 sm:p-8 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Comprehensive Training Programs</h3>
              <ul className="space-y-3 text-sm sm:text-base text-gray-700">
                <li className="flex items-start">
                  <Award className="h-5 w-5 text-[#eac66d] mr-3 mt-0.5 flex-shrink-0" />
                  <span>Game-relevant curriculum designed by experts</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-5 w-5 text-[#eac66d] mr-3 mt-0.5 flex-shrink-0" />
                  <span>Hands-on projects and hands on ingame training</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-5 w-5 text-[#eac66d] mr-3 mt-0.5 flex-shrink-0" />
                  <span>Course progression to level up skills</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-5 w-5 text-[#eac66d] mr-3 mt-0.5 flex-shrink-0" />
                  <span>Recognized certificates upon completion</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Community & Support</h3>
              <ul className="space-y-3 text-sm sm:text-base text-gray-700">
                <li className="flex items-start">
                  <Users className="h-5 w-5 text-[#eac66d] mr-3 mt-0.5 flex-shrink-0" />
                  <span>Active Discord communitys</span>
                </li>
                <li className="flex items-start">
                  <Users className="h-5 w-5 text-[#eac66d] mr-3 mt-0.5 flex-shrink-0" />
                  <span>Expert instructors and mentors</span>
                </li>
                <li className="flex items-start">
                  <Users className="h-5 w-5 text-[#eac66d] mr-3 mt-0.5 flex-shrink-0" />
                  <span>Peer-to-peer learning opportunities</span>
                </li>
                <li className="flex items-start">
                  <Users className="h-5 w-5 text-[#eac66d] mr-3 mt-0.5 flex-shrink-0" />
                  <span>Career guidance and advancement support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">Our Impact</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#eac66d] mb-2">###</div>
              <div className="text-base sm:text-lg text-gray-600">Community Members</div>
              <p className="text-sm text-gray-500 mt-2">
                Dedicated members building our educational community
              </p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#eac66d] mb-2">###</div>
              <div className="text-base sm:text-lg text-gray-600">Course Creators</div>
              <p className="text-sm text-gray-500 mt-2">
                Experienced developers creating quality educational content
              </p>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-[#eac66d] mb-2">New</div>
              <div className="text-base sm:text-lg text-gray-600">Growing Platform</div>
              <p className="text-sm text-gray-500 mt-2">
                Fresh start with ambitious goals for educational excellence
              </p>
            </div>
          </div>
        </div>

        {/* Join Us Section */}
        <div className="text-center bg-gradient-to-r from-[#eac66d] to-[#deb659] rounded-lg p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1c2341] mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg sm:text-xl text-[#1c2341]/80 mb-4 sm:mb-6">
            Join Oakridge Operations Group and unlock your potential in the world of Roblox development.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 bg-[#1c2341] text-white text-sm sm:text-base rounded-lg hover:bg-[#2a3454] transition-colors duration-200"
            >
              Apply Now
            </Link>
            <Link
              to="mailto:oakridgesupport@chrisrelf.dev"
              className="inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 border-2 border-[#1c2341] text-[#1c2341] text-sm sm:text-base rounded-lg hover:bg-[#1c2341] hover:text-white transition-colors duration-200"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;