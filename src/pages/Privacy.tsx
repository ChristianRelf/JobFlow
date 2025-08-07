import React from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  ArrowLeft,
  Shield,
  Eye,
  Lock,
  Database,
  UserCheck,
  Globe
} from 'lucide-react';

const Privacy: React.FC = () => {
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
              <Shield className="h-8 w-8 text-[#eac66d]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-lg text-gray-600 mb-2">
              Your privacy is our priority
            </p>
            <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Last updated: August 2025
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="bg-green-100 p-2 rounded-full">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">Your Privacy Matters</h3>
              <p className="text-green-800 leading-relaxed">
                At Oakridge Operations Group, we are committed to protecting your privacy and ensuring 
                the security of your personal information. This policy explains how we collect, use, 
                and protect your data with complete transparency.
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
                  <Eye className="h-5 w-5 text-[#1c2341]" />
                </div>
                <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-900 mb-3">Information You Provide</h3>
                  <ul className="space-y-2 text-blue-800">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Discord account information (username, avatar, user ID)
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Application responses and form submissions
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Course progress and completion data
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Communications with our support team
                    </li>
                  </ul>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-purple-900 mb-3">Automatically Collected</h3>
                  <ul className="space-y-2 text-purple-800">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Usage data and activity logs
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Device information and browser type
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      IP address and location data
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      Cookies and similar tracking technologies
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#eac66d] to-[#deb659] px-6 py-4">
              <div className="flex items-center">
                <div className="bg-[#1c2341] p-2 rounded-lg mr-3">
                  <Database className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-[#1c2341]">2. How We Use Your Information</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6 text-lg">
                We use the information we collect to provide you with the best possible educational experience:
              </p>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  "Providing and maintaining our education platform",
                  "Processing applications and managing memberships",
                  "Tracking course progress and issuing certificates",
                  "Communicating with you about your account and courses",
                  "Improving our services and user experience",
                  "Ensuring platform security and preventing abuse"
                ].map((item, index) => (
                  <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-[#eac66d] rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-[#1c2341] text-sm font-bold">{index + 1}</span>
                    </div>
                    <span className="text-gray-700 text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-lg mr-3">
                  <Globe className="h-5 w-5 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-white">3. Information Sharing</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 font-medium text-center">
                  🚫 We do NOT sell, trade, or rent your personal information to third parties
                </p>
              </div>
              <p className="text-gray-700 mb-4">We may share your information only in these specific circumstances:</p>
              <div className="space-y-3">
                {[
                  { title: "With your consent", desc: "When you explicitly agree to share information" },
                  { title: "Service providers", desc: "With trusted partners who help us operate our platform" },
                  { title: "Legal requirements", desc: "When required by law or to protect our rights" },
                  { title: "Safety purposes", desc: "To prevent harm or illegal activities" }
                ].map((item, index) => (
                  <div key={index} className="flex items-start p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="text-indigo-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <p className="text-gray-600 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 px-6 py-4">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-lg mr-3">
                  <Lock className="h-5 w-5 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold text-white">4. Data Security</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6 text-lg">
                We implement multiple layers of security to protect your personal information:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {[
                    { icon: "🔐", title: "Encryption", desc: "Data encrypted in transit and at rest" },
                    { icon: "🛡️", title: "Security Assessments", desc: "Regular security reviews and updates" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start p-4 bg-green-50 rounded-lg">
                      <span className="text-2xl mr-3">{item.icon}</span>
                      <div>
                        <h4 className="font-medium text-green-900">{item.title}</h4>
                        <p className="text-green-700 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  {[
                    { icon: "🔑", title: "Access Controls", desc: "Authentication and authorization measures" },
                    { icon: "👨‍🏫", title: "Staff Training", desc: "Team trained on data protection practices" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start p-4 bg-green-50 rounded-lg">
                      <span className="text-2xl mr-3">{item.icon}</span>
                      <div>
                        <h4 className="font-medium text-green-900">{item.title}</h4>
                        <p className="text-green-700 text-sm">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> While we implement industry-standard security measures, no method of transmission over the internet is 100% secure.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-lg mr-3">
                  <UserCheck className="h-5 w-5 text-orange-600" />
                </div>
                <h2 className="text-xl font-semibold text-white">5. Your Rights & Choices</h2>
              </div>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-6 text-lg">
                You have complete control over your personal information:
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { right: "Access", desc: "Request a copy of your personal information", icon: "👁️" },
                  { right: "Correction", desc: "Request correction of inaccurate information", icon: "✏️" },
                  { right: "Deletion", desc: "Request deletion of your personal information", icon: "🗑️" },
                  { right: "Portability", desc: "Request transfer of your data to another service", icon: "📦" },
                  { right: "Objection", desc: "Object to certain processing of your information", icon: "🚫" },
                  { right: "Restriction", desc: "Request restriction of processing", icon: "⏸️" }
                ].map((item, index) => (
                  <div key={index} className="p-4 border-2 border-orange-200 rounded-lg hover:border-orange-300 transition-colors">
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">{item.icon}</span>
                      <h4 className="font-semibold text-orange-900">{item.right}</h4>
                    </div>
                    <p className="text-orange-700 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                <p className="text-orange-800">
                  <strong>How to exercise your rights:</strong> Contact us through our Discord server or support channels to make any requests.
                </p>
              </div>
            </div>
          </div>

          {/* Remaining sections in a more compact format */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Cookies Section */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-4 py-3">
                <h3 className="text-lg font-semibold text-white">🍪 Cookies & Tracking</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-pink-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Essential cookies</p>
                      <p className="text-gray-600 text-xs">Required for basic functionality</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-pink-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Analytics cookies</p>
                      <p className="text-gray-600 text-xs">Help us understand usage</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-pink-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Preference cookies</p>
                      <p className="text-gray-600 text-xs">Remember your settings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Retention */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-3">
                <h3 className="text-lg font-semibold text-white">⏰ Data Retention</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Account info</p>
                      <p className="text-gray-600 text-xs">Until you delete your account</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Course progress</p>
                      <p className="text-gray-600 text-xs">For certification purposes</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full mt-1.5 mr-3 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Communications</p>
                      <p className="text-gray-600 text-xs">For support and legal compliance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Children's Privacy */}
          <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300 rounded-xl p-6">
            <div className="flex items-start">
              <div className="bg-yellow-500 p-3 rounded-full mr-4">
                <span className="text-white text-xl">👶</span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-yellow-900 mb-3">Children's Privacy Protection</h3>
                <p className="text-yellow-800 mb-3">
                  Our service is not intended for children under 13 years of age. We do not knowingly collect 
                  personal information from children under 13.
                </p>
                <p className="text-yellow-800">
                  If you are a parent or guardian and believe your child has provided us with personal information, 
                  please contact us immediately and we will take steps to delete such information.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-[#1c2341] to-[#2a3454] px-6 py-4">
              <h3 className="text-xl font-semibold text-white">📞 Contact Us</h3>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Have questions about this Privacy Policy or our data practices?
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center p-3 bg-[#5865F2] bg-opacity-10 rounded-lg">
                  <div className="w-10 h-10 bg-[#5865F2] rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">D</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Discord</p>
                    <a href="https://discord.gg/TEkyjfSPKe" target="_blank" rel="noopener noreferrer" className="text-[#5865F2] text-sm hover:underline">
                      Join our server
                    </a>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-100 rounded-lg">
                  <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-bold">@</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <a href="mailto:privacy@chrisrelf.dev" className="text-gray-600 hover:text-gray-800 text-sm">
                      privacy@chrisrelf.dev
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>Response time:</strong> We aim to respond to all privacy inquiries within 48 hours.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Commitment Section */}
        <div className="mt-12 bg-gradient-to-br from-[#1c2341] via-[#2a3454] to-[#1c2341] rounded-2xl p-8 text-white relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-20 h-20 border-2 border-[#eac66d] rounded-full"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-[#eac66d] rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-[#eac66d] rounded-full"></div>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#eac66d] rounded-full mb-6">
              <Shield className="h-8 w-8 text-[#1c2341]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Our Privacy Commitment
            </h2>
            <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
              We are committed to maintaining the highest standards of privacy protection. Your trust 
              is essential to our mission of providing quality education in the Roblox community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 bg-[#eac66d] text-[#1c2341] text-lg font-semibold rounded-lg hover:bg-[#deb659] transition-all duration-200 transform hover:scale-105"
              >
                Join Our Platform
              </Link>
              <Link
                to="/support"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white text-lg font-semibold rounded-lg hover:bg-white hover:text-[#1c2341] transition-all duration-200"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;