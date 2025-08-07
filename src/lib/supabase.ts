import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('=== Supabase Configuration Debug ===');
console.log('URL exists:', !!supabaseUrl);
console.log('Key exists:', !!supabaseAnonKey);
console.log('URL value:', supabaseUrl || 'MISSING');
console.log('Key value:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');
console.log('Environment:', import.meta.env.MODE);
console.log('All env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));

let supabase: any = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'undefined' && supabaseAnonKey !== 'undefined') {
  try {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        debug: true
      },
      global: {
        headers: {
          'X-Client-Info': 'oakridge-education-portal'
        }
      }
    });
    console.log('✅ Supabase client created successfully');
  } catch (error) {
    console.error('❌ Error creating Supabase client:', error);
    supabase = null;
  }
} else {
  console.error('❌ Missing Supabase environment variables');
  console.error('URL:', supabaseUrl);
  console.error('Key:', supabaseAnonKey ? 'Present' : 'Missing');
}

export { supabase };

export const getSupabaseStatus = () => {
  const hasUrl = !!supabaseUrl && supabaseUrl !== 'undefined';
  const hasKey = !!supabaseAnonKey && supabaseAnonKey !== 'undefined';
  const clientCreated = !!supabase;
  
  console.log('=== Supabase Status Check ===');
  console.log('Has URL:', hasUrl);
  console.log('Has Key:', hasKey);
  console.log('Client Created:', clientCreated);
  
  if (!hasUrl || !hasKey) {
    console.error('❌ Missing environment variables:');
    if (!hasUrl) console.error('  - VITE_SUPABASE_URL is missing or undefined');
    if (!hasKey) console.error('  - VITE_SUPABASE_ANON_KEY is missing or undefined');
  }
  
  return {
    hasUrl,
    hasKey,
    clientCreated,
    url: supabaseUrl,
    keyLength: supabaseAnonKey ? supabaseAnonKey.length : 0
  };
};