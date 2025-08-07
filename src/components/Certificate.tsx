import React, { useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useSupabaseCourses } from '../hooks/useSupabaseCourses';
import { useSupabaseProfiles } from '../hooks/useSupabaseProfiles';
import { Award, Calendar, CheckCircle, Database, ExternalLink } from 'lucide-react';

interface CertificateProps {
  courseName: string;
  studentName: string;
  completionDate: string;
  certificateId?: string;
  userId?: string;
  courseId?: string;
}

const Certificate: React.FC<CertificateProps> = ({
  courseName,
  studentName,
  completionDate,
  certificateId,
  userId,
  courseId
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const { fetchAllCourses } = useSupabaseCourses();
  const { fetchAllProfiles } = useSupabaseProfiles();

  const [certificateInDb, setCertificateInDb] = React.useState<boolean | null>(null);
  const [registryNumber, setRegistryNumber] = React.useState<string>('');
  const [certificateData, setCertificateData] = React.useState<any>(null);
  const [actualCertificateId, setActualCertificateId] = React.useState<string>('');

  // Check if certificate exists in database
  React.useEffect(() => {
    const checkCertificateInDatabase = async () => {
      if (!supabase || (!certificateId && !userId && !courseId)) {
        console.warn('Certificate check skipped - insufficient data');
        setCertificateInDb(false);
        return;
      }
      
      try {
        console.log('🔍 Checking certificate in database for user/course:', userId, courseId);
        console.log('🔍 User ID:', userId);
        console.log('🔍 Course ID:', courseId);
        
        // Wait a moment for database to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Primary search: by user_id and course_id (most reliable)
        let certificateFound = null;
        if (userId && courseId) {
          console.log('🔍 Method 1: Searching by user_id and course_id...');
          const { data: userCertData, error: userCertError } = await supabase
            .from('certificates')
            .select('*')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .eq('is_valid', true)
            .maybeSingle();
          console.log('🔍 User/course search result:', { data: userCertData, error: userCertError });
          
          if (userCertData) {
            certificateFound = userCertData;
            console.log('✅ Certificate found by user/course lookup:', userCertData);
          } else if (userCertError && userCertError.code !== 'PGRST116') {
            console.error('❌ Database error searching by user/course:', userCertError);
          } else {
            console.log('🔍 No certificate found by user/course lookup');
          }
        }
        
        // Fallback: search by provided certificate ID if available
        if (!certificateFound && certificateId) {
          console.log('🔍 Method 2: Searching by provided certificate_id...');
          const { data, error } = await supabase
            .from('certificates')
            .select('*')
            .eq('certificate_id', certificateId)
            .eq('is_valid', true)
            .maybeSingle();
          
          if (data) {
            certificateFound = data;
            console.log('✅ Certificate found by certificate_id:', data);
          } else if (error && error.code !== 'PGRST116') {
            console.error('❌ Database error in certificate_id search:', error);
          }
        }
        
        if (certificateFound) {
          setCertificateInDb(certificateFound.is_valid);
          setRegistryNumber(certificateFound.registry_number);
          setCertificateData(certificateFound);
          setActualCertificateId(certificateFound.certificate_id);
          console.log('✅ Certificate verification successful:', {
            id: certificateFound.certificate_id,
            valid: certificateFound.is_valid,
            registry: certificateFound.registry_number
          });
        } else {
          console.log('❌ Certificate not found in database');
          console.log('🔍 Searched for user_id:', userId);
          console.log('🔍 Searched for course_id:', courseId);
          console.log('🔍 Searched for certificate_id:', certificateId);
          setCertificateInDb(false);
        }
      } catch (error) {
        console.error('❌ Critical error checking certificate in database:', error);
        setCertificateInDb(false);
      }
    };

    checkCertificateInDatabase();
  }, [certificateId, userId, courseId]);

  // Use the actual certificate ID from database, or fallback to provided ID
  const displayCertificateId = actualCertificateId || 
    certificateId || 
    (userId && courseId 
      ? `OOG-${userId.slice(0, 4).toUpperCase()}-${courseId.slice(0, 4).toUpperCase()}-PENDING`
      : 'OOG-XXXX-XXXX-PENDING'
    );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Certificate Preview */}
      <div 
        ref={certificateRef}
        className="relative bg-white text-black p-8 sm:p-12 rounded-lg shadow-2xl border-2 border-black mb-8"
        style={{ aspectRatio: '210/297' }} // A4 ratio
      >
        {/* EOC Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-between items-start mb-8">
            <div className="text-left">
              <img
                src="/EOC.png"
                alt="EOC Logo"
                className="h-16 w-auto mb-2"
                loading="lazy"
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.className = 'text-3xl font-bold text-black mb-2';
                  fallback.textContent = 'EOC';
                  e.currentTarget.parentNode?.insertBefore(fallback, e.currentTarget);
                }}
              />
              <div className="text-xs text-black font-medium">
                <div>OAKRIDGE OPERATIONS GROUP</div>
                <div>EDUCATION CENTER</div>
              </div>
            </div>
            <div className="text-right text-xs text-gray-600">
              <div>Certificate ID: {displayCertificateId}</div>
              <div>Registry: {registryNumber || `REG-${(certificateId || displayCertificateId).slice(-8)}`}</div>
            </div>
          </div>
        </div>

        {/* Certificate content */}
        <div className="text-center space-y-6">
          <div className="border-b-2 border-black pb-4 mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-black font-serif">
              CERTIFICATE OF COMPLETION
            </h1>
          </div>

          <div className="space-y-4 mb-8">
            <p className="text-lg text-black">
              This is to certify that
            </p>

            <h2 className="text-3xl md:text-4xl font-bold text-black py-3 border-b-2 border-black mx-auto inline-block px-8">
              {studentName}
            </h2>

            <p className="text-lg text-black">
              has successfully completed the comprehensive training program
            </p>

            <h3 className="text-2xl md:text-3xl font-bold text-black border-b-2 border-black pb-2 mx-auto inline-block px-4">
              {courseName}
            </h3>

            <div className="space-y-2 text-base text-black">
              <p>demonstrating proficiency in the required competencies</p>
              <p>and meeting all educational standards set forth by this institution.</p>
            </div>

            <div className="space-y-2 text-lg text-black font-medium mt-6">
              <p>This achievement represents dedication to professional development</p>
              <p>and commitment to excellence in nuclear operations education.</p>
            </div>
          </div>

          <div className="flex items-center justify-center text-black text-base font-bold mb-8">
            <Calendar className="h-5 w-5 mr-2" />
            <span>
              Completed on {new Date(completionDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>

          <div className="text-sm text-black mb-8">
            <p>Accredited by the Nuclear Education Standards Board</p>
            <p>Recognized for Professional Development and Training Excellence</p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xl font-bold text-black">
                OAKRIDGE OPERATIONS GROUP
              </h4>
              <p className="text-base text-black">Nuclear Education and Training Division</p>
            </div>
            
            {/* Signature lines */}
            <div className="text-center mt-12">
              <div className="w-64 border-b-2 border-black mb-2 mx-auto"></div>
              {/* Signature Image */}
              <div className="mb-4">
                <img
                  src="/gdesa.png"
                  alt="Signature"
                  className="h-16 mx-auto"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback if signature image doesn't load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="space-y-1">
                <p className="text-base text-black font-bold">chrxs_dev</p>
                <p className="text-sm text-black font-medium">Operations Director</p>
                <p className="text-sm text-black">Oakridge Operations Group</p>
              </div>
            </div>

            {/* Official Seal */}
            <div className="flex justify-center mt-8">
              <div className="w-24 h-24 border-4 border-black rounded-full flex flex-col items-center justify-center">
                <span className="text-xs font-bold text-black">OFFICIAL</span>
                <span className="text-xs font-bold text-black">SEAL</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-4 text-xs text-gray-600 space-y-1">
            <div>Date Issued: {new Date().toLocaleDateString()}</div>
            <div>Valid Until: {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {/* Certificate verification status */}
      <div className="mt-8 bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 text-blue-600 mr-2" />
          Certificate Verification Status
        </h3>
        
        {certificateInDb === null ? (
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-3"></div>
            <span className="text-gray-700">Checking database...</span>
          </div>
        ) : certificateInDb ? (
          <div className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <p className="text-green-800 font-medium">✅ Certificate verified in database</p>
              <p className="text-green-700 text-sm">
                This certificate is authentic and stored in our secure database.
                {certificateData && (
                  <span className="block mt-1">
                    Registry: {certificateData.registry_number} | 
                    Issued: {new Date(certificateData.issued_date).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
            <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
            <div>
              <p className="text-red-800 font-medium">❌ Certificate not found in database</p>
              <p className="text-red-700 text-sm">
                This certificate was not found in our verification system. It may be invalid or fraudulent.
                {import.meta.env.DEV && (
                  <span className="block mt-2 text-xs">
                    Debug: Searched for ID "{certificateId}" {userId && `and user "${userId}"`}
                  </span>
                )}
              </p>
            </div>
          </div>
        )}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-800 font-medium text-sm">Verify this certificate online:</p>
              <p className="text-blue-700 text-xs">https://oakridge.app/verify?id={displayCertificateId}</p>
            </div>
            <a
              href={`https://oakridge.app/verify?id=${displayCertificateId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
            >
              Verify Online
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        </div>

        {/* Certificate details */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Award className="h-5 w-5 text-gray-600 mr-2" />
            Certificate Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Student:</span>
              <span className="ml-2 text-gray-900">{studentName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Course:</span>
              <span className="ml-2 text-gray-900">{courseName}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Completion Date:</span>
              <span className="ml-2 text-gray-900">
                {new Date(completionDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Certificate ID:</span>
              <span className="ml-2 text-gray-900 font-mono">{displayCertificateId}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Valid Until:</span>
              <span className="ml-2 text-gray-900">
                {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Registry Number:</span>
              <span className="ml-2 text-gray-900 font-mono">{registryNumber || `REG-${(displayCertificateId || 'PENDING').slice(-8)}`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;