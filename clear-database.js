import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables from .env file
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', !!supabaseUrl);
  console.error('VITE_SUPABASE_ANON_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearAllData() {
  console.log('🧹 Starting database cleanup...');
  
  try {
    // Clear data from all tables (order matters due to foreign key constraints)
    const tables = [
      'quiz_results',
      'user_progress', 
      'quiz_questions',
      'quizzes',
      'modules',
      'courses',
      'applications',
      'application_questions'
    ];

    for (const table of tables) {
      console.log(`Clearing ${table}...`);
      const { error } = await supabase
        .from(table)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records
      
      if (error) {
        console.error(`Error clearing ${table}:`, error);
      } else {
        console.log(`✅ Cleared ${table}`);
      }
    }

    // Reset profiles to applicant status (but keep user accounts)
    console.log('Resetting user profiles...');
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        role: 'applicant',
        status: 'pending'
      })
      .neq('role', 'admin'); // Don't reset admin accounts

    if (profileError) {
      console.error('Error resetting profiles:', profileError);
    } else {
      console.log('✅ Reset user profiles to applicant status');
    }

    console.log('🎉 Database cleanup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  }
}

clearAllData();