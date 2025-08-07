import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Database, ExternalLink } from 'lucide-react';
import { supabase, getSupabaseStatus } from '../lib/supabase';

const SupabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<{
    hasUrl: boolean;
    hasKey: boolean;
    canConnect: boolean;
    error?: string;
    isProduction: boolean;
    clientCreated: boolean;
  }>({
    hasUrl: false,
    hasKey: false,
    canConnect: false,
    isProduction: false,
    clientCreated: false
  });

  useEffect(() => {
    const checkSupabaseConfig = async () => {
      const supabaseStatus = getSupabaseStatus();
      const isProduction = import.meta.env.PROD;
      
      console.log('=== SupabaseStatus Component Check ===');
      console.log('Status:', supabaseStatus);
      console.log('Production:', isProduction);
      
      let canConnect = false;
      let error: string | undefined;

      if (supabaseStatus.hasUrl && supabaseStatus.hasKey && supabaseStatus.clientCreated) {
        try {
          if (!supabase) {
            error = 'Supabase client failed to initialize';
            console.error('Supabase client is null despite having credentials');
          } else {
            // Test connection with a simple query
            console.log('Testing Supabase connection...');
            // Try a simple auth check first, then profiles
            const { data: { session }, error: authError } = await supabase.auth.getSession();
            
            if (authError) {
              console.warn('Auth check failed, trying profiles table:', authError);
              // Fallback to profiles table check
              const { data, error: connectionError } = await supabase
                .from('profiles')
                .select('id')
                .limit(1);
              
              if (connectionError) {
                error = `Connection failed: ${connectionError.message}`;
                console.error('Supabase connection error:', connectionError);
              } else {
                canConnect = true;
                console.log('✅ Supabase connection successful via profiles table');
              }
            } else {
              canConnect = true;
              console.log('✅ Supabase connection successful via auth');
            }
          }
        } catch (err) {
          error = err instanceof Error ? err.message : 'Unknown connection error';
          console.error('Supabase connection test error:', err);
        }
      } else {
        const missing = [];
        if (!supabaseStatus.hasUrl) missing.push('VITE_SUPABASE_URL');
        if (!supabaseStatus.hasKey) missing.push('VITE_SUPABASE_ANON_KEY');
        if (!supabaseStatus.clientCreated) missing.push('Client initialization failed');
        error = `Issues: ${missing.join(', ')}`;
        console.error('Missing or invalid Supabase configuration:', missing);
      }

      setStatus({
        hasUrl: supabaseStatus.hasUrl,
        hasKey: supabaseStatus.hasKey,
        canConnect,
        error,
        isProduction,
        clientCreated: supabaseStatus.clientCreated
      });
    };

    checkSupabaseConfig();
  }, []);

  // Hide in production if everything is working
  if (status.isProduction && status.canConnect && status.hasUrl && status.hasKey && status.clientCreated) {
    return null;
  }
  
  // Hide in development if everything is working and no errors
  if (!status.isProduction && status.canConnect && status.hasUrl && status.hasKey && status.clientCreated && !status.error) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white rounded-lg shadow-lg border p-4 max-w-md">
      <div className="flex items-center mb-3">
        <Database className="h-5 w-5 text-blue-600 mr-2" />
        <h3 className="font-semibold text-gray-900">
          Database Status {status.isProduction ? '(Production)' : '(Development)'}
        </h3>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center">
          {status.hasUrl ? (
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500 mr-2" />
          )}
          <span>Database URL: {status.hasUrl ? 'Configured' : 'Missing'}</span>
        </div>
        
        <div className="flex items-center">
          {status.hasKey ? (
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500 mr-2" />
          )}
          <span>Database Key: {status.hasKey ? 'Configured' : 'Missing'}</span>
        </div>

        <div className="flex items-center">
          {status.clientCreated ? (
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500 mr-2" />
          )}
          <span>Client: {status.clientCreated ? 'Created' : 'Failed'}</span>
        </div>
        
        <div className="flex items-center">
          {status.canConnect ? (
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500 mr-2" />
          )}
          <span>Connection: {status.canConnect ? 'Working' : 'Failed'}</span>
        </div>
        
        {status.canConnect && status.hasUrl && status.hasKey && status.clientCreated && (
          <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-green-700 text-xs font-medium">✅ Database connected successfully!</span>
            </div>
          </div>
        )}
        
        {status.error && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-red-700 text-xs">{status.error}</span>
            </div>
          </div>
        )}
        
        {status.isProduction && (!status.hasUrl || !status.hasKey) && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-yellow-700 text-xs">
                <p className="font-medium mb-2">🚨 Production Deployment Issue:</p>
                <p className="mb-2">Database connection failed. Environment variables missing:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs mb-3">
                  <li>Click "Connect to Supabase" button in the top right</li>
                  <li>Or manually add environment variables in Netlify:</li>
                  <li className="ml-4">• <code className="bg-yellow-200 px-1 rounded">VITE_SUPABASE_URL</code></li>
                  <li className="ml-4">• <code className="bg-yellow-200 px-1 rounded">VITE_SUPABASE_ANON_KEY</code></li>
                </ol>
                <div className="bg-red-100 border border-red-300 rounded p-2 mb-2">
                  <p className="font-medium text-red-800 mb-1">⚠️ Current Status:</p>
                  <p className="text-red-700 text-xs mb-1">• URL: {status.hasUrl ? '✅ Present' : '❌ Missing'}</p>
                  <p className="text-red-700 text-xs mb-1">• Key: {status.hasKey ? '✅ Present' : '❌ Missing'}</p>
                  <p className="text-red-700 text-xs">• Client: {status.clientCreated ? '✅ Created' : '❌ Failed'}</p>
                </div>
                <div className="flex gap-2">
                  <a 
                    href="https://app.netlify.com/sites/oakridge-app/settings/env" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-yellow-800 hover:text-yellow-900 font-medium text-xs"
                  >
                    Netlify Settings
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  <span className="text-yellow-600">|</span>
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-yellow-800 hover:text-yellow-900 font-medium text-xs"
                  >
                    Retry Connection
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!status.isProduction && (!status.hasUrl || !status.hasKey) && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-blue-700 text-xs">
                <p className="font-medium mb-2">🔧 Development Mode:</p>
                <p className="mb-2">Click "Connect to Supabase" in the top right to set up the database connection.</p>
                <p className="text-blue-600">The app will work with local storage until connected.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupabaseStatus;