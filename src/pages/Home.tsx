import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award, 
  ArrowRight,
  CheckCircle,
  Star,
  Target,
  Shield
} from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-[#151b2e] shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-[#eac66d]" />
              <div className="ml-3">
                <h1 className="text-xl font-bold text-white">Oakridge</h1>
                <p className="text-sm text-gray-300 -mt-1">Education Center</p>
              </div>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 bg-[#eac66d] text-[#1c2341] rounded-md hover:bg-[#deb659] transition-colors duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#1c2341] via-[#2a3454] to-[#1c2341] text-white">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24">
          {/* Background Image */}
          <div className="absolute right-[50%] top-1/2 transform -translate-y-1/2 lg:right-[40%] xl:right-[35%] 2xl:right-[-20%] opacity-80">
            <img
              src="/triorender2.webp"
              alt="Trio Render"
              className="w-[600px] sm:w-[500px] md:w-[450px] lg:w-[800px] xl:w-[1000px] 2xl:w-[1000px] h-auto"
              loading="lazy"
            />
          </div>
          
          {/* Text Content - In Front */}
          <div className="relative z-10 max-w-3xl ml-0 lg:ml-0 xl:ml-0 pl-0 lg:pl-0 xl:pl-0 -ml-4 lg:-ml-8 xl:-ml-12">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold mb-6 sm:mb-8 leading-tight">
              Welcome to
              <span className="block text-[#eac66d] text-6xl sm:text-7xl md:text-8xl lg:text-9xl xl:text-[10rem]">Oakridge</span>
              <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl">Education Portal</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-10 leading-relaxed max-w-md">
              Join Oakridge Operations Group's premier education platform. 
              Learn, grow, and advance your skills through our comprehensive 
              training programs designed for the Roblox community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 bg-[#eac66d] text-[#1c2341] text-lg sm:text-xl font-bold rounded-lg hover:bg-[#deb659] transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 border-2 border-white text-white text-lg sm:text-xl font-bold rounded-lg hover:bg-white hover:text-[#1c2341] transition-all duration-200 shadow-lg"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1c2341] mb-4">
              Why Choose Oakridge Education Center?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Our comprehensive platform combines cutting-edge technology with expert instruction 
              to deliver an unparalleled learning experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-[#1c2341] p-3 rounded-full w-fit mb-6">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-[#1c2341] mb-4">
                Comprehensive Courses
              </h3>
              <p className="text-sm lg:text-base text-gray-600">
                Access a wide range of courses designed by industry experts to help you master essential skills.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-[#eac66d] p-3 rounded-full w-fit mb-6">
                <Users className="h-8 w-8 text-[#1c2341]" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-[#1c2341] mb-4">
                Expert Community
              </h3>
              <p className="text-sm lg:text-base text-gray-600">
                Learn alongside peers and get guidance from experienced professionals in the field.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-[#1c2341] p-3 rounded-full w-fit mb-6">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-[#1c2341] mb-4">
                Recognized Certificates
              </h3>
              <p className="text-sm lg:text-base text-gray-600">
                Earn certificates that are recognized and valued by the community.
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 lg:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="bg-[#eac66d] p-3 rounded-full w-fit mb-6">
                <Target className="h-8 w-8 text-[#1c2341]" />
              </div>
              <h3 className="text-lg lg:text-xl font-semibold text-[#1c2341] mb-4">
                Career Advancement
              </h3>
              <p className="text-sm lg:text-base text-gray-600">
                Build the skills and knowledge needed to advance your gameplay career at oakridge nuclear power plant.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Certificate Verification Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#1c2341] via-[#2a3454] to-[#1c2341] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-6 right-6 w-24 h-24 border-2 border-[#eac66d] rounded-full"></div>
              <div className="absolute bottom-6 left-6 w-16 h-16 bg-[#eac66d] rounded-full"></div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#eac66d] to-[#deb659] rounded-2xl mb-6 shadow-lg">
                <Shield className="h-10 w-10 text-[#1c2341]" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
                Verify Certificates
              </h2>
              <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Instantly verify the authenticity of any Oakridge Education Portal certificate. 
                Our secure verification system ensures all certificates are legitimate and up-to-date.
              </p>
              
              {/* Quick verification form */}
              <div className="max-w-2xl mx-auto mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Enter certificate ID (e.g., OOG-A1B2-C3D4-K7M9N2P5)"
                        className="w-full px-4 py-3 bg-white text-gray-900 rounded-lg border-0 focus:ring-2 focus:ring-[#eac66d] font-mono text-lg"
                        id="quick-verify-input"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const input = document.getElementById('quick-verify-input') as HTMLInputElement;
                        if (input?.value) {
                          window.location.href = `/verify?id=${encodeURIComponent(input.value)}`;
                        } else {
                          window.location.href = '/verify';
                        }
                      }}
                      className="px-6 py-3 bg-[#eac66d] text-[#1c2341] font-bold rounded-lg hover:bg-[#deb659] transition-colors duration-200 whitespace-nowrap"
                    >
                      Verify Now
                    </button>
                  </div>
                  <p className="text-sm text-gray-300 mt-3 text-center">
                    Or <Link to="/verify" className="text-[#eac66d] hover:text-[#deb659] font-medium underline">browse the full verification page</Link>
                  </p>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="bg-green-100 p-3 rounded-full w-fit mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Instant Verification</h3>
                  <p className="text-gray-300 text-sm">
                    Get immediate results with our real-time certificate validation system
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="bg-blue-100 p-3 rounded-full w-fit mx-auto mb-4">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Secure & Trusted</h3>
                  <p className="text-gray-300 text-sm">
                    Advanced security features prevent certificate fraud and ensure authenticity
                  </p>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="bg-purple-100 p-3 rounded-full w-fit mx-auto mb-4">
                    <Award className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Industry Standard</h3>
                  <p className="text-gray-300 text-sm">
                    Our certificates meet professional standards and are widely recognized
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Stats Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-[#1c2341] via-[#2a3454] to-[#1c2341] text-white overflow-hidden relative">
        {/* Simplified Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 border-2 border-[#eac66d] rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-16 h-16 bg-[#eac66d] rounded-full"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
                  Why
                  <span className="block text-[#eac66d] text-4xl sm:text-5xl md:text-6xl">Oakridge?</span>
                </h2>
                <p className="text-lg sm:text-xl text-gray-300 mb-8 leading-relaxed">
                  Our expert instructors and industry professionals are dedicated to providing 
                  world-class education and mentorship in the Oakridge Nuclear Power Station Community.
                </p>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl sm:text-3xl font-bold text-[#eac66d] mb-2">5+</div>
                    <div className="text-sm text-gray-300">Expert Instructors</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl sm:text-3xl font-bold text-[#eac66d] mb-2">Experienced</div>
                    <div className="text-sm text-gray-300">Players Instructing</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-6 py-3 bg-[#eac66d] text-[#1c2341] text-lg font-bold rounded-lg hover:bg-[#deb659] transition-all duration-200 transform hover:scale-105"
                  >
                    Join Our Team
                  </Link>
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center px-6 py-3 border-2 border-white text-white text-lg font-bold rounded-lg hover:bg-white hover:text-[#1c2341] transition-all duration-200"
                  >
                    Learn More
                  </Link>
                </div>
              </div>

              {/* Right Image */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-[#eac66d]/20 to-transparent rounded-2xl"></div>
                <div className="relative transform hover:scale-105 transition-transform duration-500">
                  <img
                    src="/rigmodelnew.webp"
                    alt="Oakridge Operations Team"
                    className="w-full h-auto rounded-2xl shadow-2xl"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1c2341]/50 to-transparent rounded-2xl"></div>
                  
                  {/* Floating badges */}
                  <div className="absolute top-4 right-4 bg-[#eac66d] text-[#1c2341] px-3 py-1 rounded-full text-sm font-bold">
                    Professional Team
                  </div>
                  <div className="absolute bottom-4 left-4 bg-white/90 text-[#1c2341] px-3 py-1 rounded-full text-sm font-bold">
                    Ready to Teach
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-r from-[#eac66d] to-[#deb659]">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1c2341] mb-4 sm:mb-6">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-lg sm:text-xl text-[#1c2341]/80 mb-6 sm:mb-8">
            Join thousands of students who have already transformed their careers 
            through our comprehensive education programs.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-[#1c2341] text-white text-base sm:text-lg font-semibold rounded-lg hover:bg-[#2a3454] transition-all duration-200 transform hover:scale-105"
          >
            Apply Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1c2341] text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <GraduationCap className="h-8 w-8 text-[#eac66d]" />
                <div className="ml-3">
                  <h3 className="text-lg sm:text-xl font-bold">Oakridge</h3>
                  <p className="text-sm text-gray-400 -mt-1">Education Center</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-4 max-w-md">
                Empowering the next generation of Roblox developers and creators 
                through comprehensive education and training programs.
              </p>
              <div className="flex space-x-4">
                <div className="flex space-x-1">
                  <Star className="h-4 w-4 text-[#eac66d] fill-current" />
                  <Star className="h-4 w-4 text-[#eac66d] fill-current" />
                  <Star className="h-4 w-4 text-[#eac66d] fill-current" />
                  <Star className="h-4 w-4 text-[#eac66d] fill-current" />
                  <Star className="h-4 w-4 text-[#eac66d] fill-current" />
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/support" className="hover:text-white transition-colors">Support</Link></li>
               <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><a href="https://discord.gg/TEkyjfSPKe" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="mailto:oakridgesupport@chrisrelf.dev" className="hover:text-white transition-colors">oakridgesupport@chrisrelf.dev</a></li>
                <li>Website: Coming Soon</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-sm sm:text-base text-gray-400">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <p>&copy; 2025 Oakridge Operations Group. All rights reserved.</p>
              <span className="hidden sm:inline">•</span>
              <a 
                href="https://buymeacoffee.com/chrisrelf" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors"
              >
                Support development :: Buy me a coffee ❤️
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;