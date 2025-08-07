import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  GraduationCap, 
  Search, 
  CheckCircle, 
  XCircle, 
  Award,
  Calendar,
  User,
  BookOpen,
  Shield,
  ArrowLeft,
  AlertCircle,
  FileText,
  Database
} from 'lucide-react';

interface CertificateData {
  id: string;
  certificate_id: string;
  student_name: string;
  course_name: string;
  completion_date: string;
  issued_date: string;
  valid_until: string;
  registry_number: string;
  is_valid: boolean;
  metadata: any;
}

const VerifyCertificate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [certificateId, setCertificateId] = useState('');
  const [searchResult, setSearchResult] = useState<{
    isValid: boolean;
    certificate?: CertificateData;
    error?: string;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Initialize certificate ID from URL params
  useEffect(() => {
    try {
      const idFromUrl = searchParams.get('id');
      if (idFromUrl) {
        setCertificateId(idFromUrl);
        // Auto-search if ID is provided in URL
        setTimeout(() => {
          handleSearchWithId(idFromUrl);
        }, 100);
      }
    } catch (error) {
      console.error('Error initializing from URL params:', error);
    }
  }, [searchParams]);

  const handleSearchWithId = async (id: string) => {
    if (!id.trim()) {
      setSearchResult({
        isValid: false,
        error: 'Please enter a certificate ID'
      });
      return;
    }

    setIsSearching(true);
    setSearchResult(null);

    try {
      const sanitizedId = id.trim().toUpperCase();
      
      setDebugInfo({
        originalId: id,
        sanitizedId: sanitizedId,
        timestamp: new Date().toISOString(),
        supabaseAvailable: !!supabase
      });

      console.log('Verifying certificate:', sanitizedId);

      if (!supabase) {
        console.warn('Supabase not available, using mock verification');
        setSearchResult({
          isValid: false,
          error: 'Database connection unavailable. Please check your internet connection and try again.'
        });
        return;
      }

      // Search in database
      console.log('Searching database for certificate:', sanitizedId);
      
      // Try exact search approaches only
      let certificateData = null;
      let searchError = null;
      
      // Method 1: Direct certificate_id search
      const { data: directData, error: directError } = await supabase
        .from('certificates')
        .select('*')
        .eq('certificate_id', sanitizedId)
        .eq('is_valid', true)
        .maybeSingle();
      
      if (directData) {
        certificateData = directData;
        console.log('✅ Certificate found via direct search:', directData);
      } else if (directError && directError.code !== 'PGRST116') {
        searchError = directError;
        console.error('❌ Database error in direct search:', directError);
      } else {
        console.log('🔍 Certificate not found via direct search, trying alternative methods...');
        
        // Method 2: Search by registry number (exact match only)
        const registrySearch = sanitizedId.startsWith('REG-') ? sanitizedId : `REG-${sanitizedId.replace('OOG-', '')}`;
        const { data: registryData, error: registryError } = await supabase
          .from('certificates')
          .select('*')
          .eq('registry_number', registrySearch)
          .eq('is_valid', true)
          .maybeSingle();
        
        if (registryData) {
          certificateData = registryData;
          console.log('✅ Certificate found via registry search:', registryData);
        } else if (registryError && registryError.code !== 'PGRST116') {
          searchError = registryError;
          console.error('❌ Database error in registry search:', registryError);
        } else {
          console.log('🔍 Certificate not found via registry search either');
        }
      }

      if (searchError) {
        console.error('Database error during certificate search:', searchError);
        setSearchResult({
          isValid: false,
          error: `Database error: ${searchError.message}`
        });
        return;
      }

      if (certificateData) {
        console.log('✅ Certificate verification successful:', certificateData);
        
        // Check if certificate is still valid (not expired)
        const isExpired = new Date(certificateData.valid_until) < new Date();
        
        if (isExpired) {
          setSearchResult({
            isValid: false,
            error: `This certificate expired on ${new Date(certificateData.valid_until).toLocaleDateString()} and is no longer valid.`
          });
          return;
        }

        setSearchResult({
          isValid: true,
          certificate: certificateData
        });
      } else {
        setSearchResult({
          isValid: false,
          error: `Certificate "${sanitizedId}" not found in our verification database. Please verify the certificate ID is correct.`
        });
      }

    } catch (error) {
      console.error('Error verifying certificate:', error);
      setSearchResult({
        isValid: false,
        error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSearchWithId(certificateId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
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
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#1c2341] to-[#2a3454] rounded-full mb-4">
              <Shield className="h-8 w-8 text-[#eac66d]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Certificate Verification</h1>
            <p className="text-lg text-gray-600">
              Verify the authenticity of Oakridge Education Portal certificates
            </p>
          </div>
        </div>

        {/* Debug Info (only in development) */}
        {import.meta.env.DEV && debugInfo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-blue-900 mb-2">Debug Info (Development Only)</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p>Original ID: {debugInfo.originalId}</p>
              <p>Sanitized ID: {debugInfo.sanitizedId}</p>
              <p>Search Time: {debugInfo.timestamp}</p>
              <p>Supabase Available: {debugInfo.supabaseAvailable ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}

        {/* Search Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certificate ID
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={certificateId}
                  onChange={(e) => setCertificateId(e.target.value)}
                  placeholder="Enter certificate ID (e.g., OOG-661D-3777-ME00E1BL)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1c2341] focus:border-transparent text-lg font-mono"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Certificate IDs follow the format: OOG-XXXX-XXXX-XXXXXXXX
              </p>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full inline-flex items-center justify-center px-6 py-3 bg-[#1c2341] text-white font-semibold rounded-lg hover:bg-[#2a3454] transition-colors duration-200 disabled:opacity-50"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Verifying Certificate...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5 mr-2" />
                  Verify Certificate
                </>
              )}
            </button>
          </form>
        </div>

        {/* Search Results */}
        {searchResult && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {searchResult.isValid && searchResult.certificate ? (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200">
                <div className="px-8 py-6 border-b border-green-200">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full mr-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-green-900">✅ Valid Certificate</h2>
                      <p className="text-green-700">This certificate is authentic and verified</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-green-600 mr-3 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Student Name</p>
                          <p className="text-lg font-semibold text-gray-900">{searchResult.certificate.student_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <BookOpen className="h-5 w-5 text-green-600 mr-3 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Course Completed</p>
                          <p className="text-lg font-semibold text-gray-900">{searchResult.certificate.course_name}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-green-600 mr-3 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Completion Date</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(searchResult.certificate.completion_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Award className="h-5 w-5 text-green-600 mr-3 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Certificate ID</p>
                          <p className="text-lg font-semibold text-gray-900 font-mono">{searchResult.certificate.certificate_id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-green-600 mr-3 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Registry Number</p>
                          <p className="text-lg font-semibold text-gray-900 font-mono">{searchResult.certificate.registry_number}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Calendar className="h-5 w-5 text-green-600 mr-3 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">Valid Until</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {new Date(searchResult.certificate.valid_until).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Special Recognition */}
                  {searchResult.certificate.metadata?.special_recognition && (
                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-yellow-600 mr-2" />
                        <span className="text-yellow-800 font-medium">
                          Special Recognition: {searchResult.certificate.metadata.special_recognition}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-8 p-6 bg-green-100 rounded-xl border border-green-200">
                    <div className="flex items-center">
                      <Shield className="h-6 w-6 text-green-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-green-900">Certificate Authenticity Verified</h3>
                        <p className="text-green-800">
                          This certificate was issued by Oakridge Operations Group Education Center and is recognized 
                          as valid proof of course completion.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200">
                <div className="px-8 py-6 border-b border-red-200">
                  <div className="flex items-center">
                    <div className="bg-red-100 p-3 rounded-full mr-4">
                      <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-red-900">❌ Invalid Certificate</h2>
                      <p className="text-red-700">This certificate could not be verified</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="bg-red-100 rounded-xl p-6 border border-red-200">
                    <div className="flex items-start">
                      <AlertCircle className="h-6 w-6 text-red-600 mr-3 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-red-900 mb-2">Verification Failed</h3>
                        <p className="text-red-800 mb-4">{searchResult.error}</p>
                        <div className="space-y-2 text-sm text-red-700">
                          <p><strong>Possible reasons:</strong></p>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Certificate ID was entered incorrectly</li>
                            <li>Certificate ID must be entered exactly as shown</li>
                            <li>Certificate may be fraudulent</li>
                            <li>Certificate may have expired</li>
                            <li>Student may not have completed the course</li>
                            <li>Database connection issues</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 text-sm">
                      <strong>Need help?</strong> If you believe this certificate should be valid, 
                      please contact our support team with the exact certificate ID. Note that certificate 
                      verification requires the complete, exact certificate ID as shown on the certificate.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Information Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">About Certificate Verification</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 text-[#1c2341] mr-2" />
                Security Features
              </h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-[#eac66d] rounded-full mt-2 mr-3"></div>
                  <span className="text-sm">Unique certificate IDs stored in secure database</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-[#eac66d] rounded-full mt-2 mr-3"></div>
                  <span className="text-sm">Cross-referenced with student completion records</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-[#eac66d] rounded-full mt-2 mr-3"></div>
                  <span className="text-sm">Registry numbers for additional verification</span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-[#eac66d] rounded-full mt-2 mr-3"></div>
                  <span className="text-sm">Expiration dates to ensure currency</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 text-[#1c2341] mr-2" />
                Certificate Format
              </h3>
              <div className="space-y-3 text-gray-700">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-sm font-medium text-gray-900 mb-2">Standard Format:</p>
                  <p className="font-mono text-sm bg-white p-2 rounded border">
                    OOG-XXXX-XXXX-XXXXXXXX
                  </p>
                </div>
                <div className="text-sm space-y-1">
                  <p><strong>OOG</strong> - Organization identifier</p>
                  <p><strong>XXXX</strong> - Student identifier</p>
                  <p><strong>XXXX</strong> - Course identifier</p>
                  <p><strong>XXXXXXXX</strong> - Unique verification code</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start">
              <div className="bg-blue-100 p-2 rounded-full mr-4">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Certificate Validity</h3>
                <p className="text-blue-800 leading-relaxed">
                  All certificates issued by Oakridge Operations Group Education Center are valid for one year 
                  from the date of completion. Students who have earned certificates demonstrate proficiency 
                  in their respective courses and have met all educational requirements.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="mt-8 bg-gradient-to-r from-[#1c2341] to-[#2a3454] rounded-xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Questions About Certificate Verification?</h2>
          <p className="text-gray-300 mb-6">
            If you have questions about a certificate or need additional verification, 
            our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://discord.gg/TEkyjfSPKe"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-[#eac66d] text-[#1c2341] font-semibold rounded-lg hover:bg-[#deb659] transition-colors duration-200"
            >
              Contact Support
            </a>
            <Link
              to="/support"
              className="inline-flex items-center px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-[#1c2341] transition-colors duration-200"
            >
              Support Center
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyCertificate;