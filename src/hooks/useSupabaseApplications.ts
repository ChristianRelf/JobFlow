import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface Application {
  id: string;
  user_id: string;
  responses: Record<string, string>;
  status: 'pending' | 'accepted' | 'denied';
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
}

export function useSupabaseApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchApplications = async () => {
    if (!supabase) {
      console.warn('Supabase not available, using local storage fallback');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          profiles!applications_user_id_fkey(username, avatar),
          reviewer:profiles!applications_reviewed_by_fkey(username)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching applications:', error);
        setError(error.message);
        return;
      }

      setApplications(data || []);
      setError(null);
    } catch (err) {
      console.error('Error in fetchApplications:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const submitApplication = async (responses: Record<string, string>) => {
    if (!supabase || !user) {
      console.error('submitApplication failed - supabase:', !!supabase, 'user:', !!user);
      throw new Error('Supabase not available or user not authenticated');
    }

    // Validate and sanitize responses
    const sanitizedResponses: Record<string, string> = {};
    
    for (const [questionId, response] of Object.entries(responses)) {
      // Validate question ID format (should be UUID or number)
      if (!questionId || (typeof questionId !== 'string' && typeof questionId !== 'number')) {
        throw new Error('Invalid question ID format');
      }
      
      // Validate response content
      if (typeof response !== 'string') {
        throw new Error('Invalid response format');
      }
      
      // Sanitize response (trim whitespace, limit length)
      const sanitizedResponse = response.trim().substring(0, 5000); // 5KB limit per response
      
      if (sanitizedResponse.length === 0) {
        continue; // Skip empty responses
      }
      
      sanitizedResponses[questionId.toString()] = sanitizedResponse;
    }
    try {
      console.log('Submitting application to database...');
      console.log('User ID:', user.id);
      console.log('Sanitized responses count:', Object.keys(sanitizedResponses).length);
      
      const { data, error } = await supabase
        .from('applications')
        .insert([{
          user_id: user.id,
          responses: sanitizedResponses,
          status: 'pending',
          submitted_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('Error submitting application:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Application submitted successfully:', data);

      // Send Discord webhook for new application
      try {
        const webhookUrl = 'https://discord.com/api/webhooks/1402319661781094471/WeucDSZhtqWifYWjieR0M4x5tmeuwtIIFAd9d_ZKGgg1xLVOqRRN99sovN23B90OFNcW';
        
        const webhookData = {
          embeds: [{
            title: '📝 New Application Submitted',
            description: `A new application has been submitted and is awaiting review`,
            color: 0xeac66d,
            fields: [
              {
                name: 'Application ID',
                value: `#${data.id.slice(0, 8)}`,
                inline: true
              },
              {
                name: 'Submitted By',
                value: user.username,
                inline: true
              },
              {
                name: 'Status',
                value: 'Pending Review',
                inline: true
              },
              {
                name: 'Submission Date',
                value: new Date().toLocaleString(),
                inline: true
              },
              {
                name: 'Discord Username',
                value: responses['1'] || 'Not provided',
                inline: false
              }
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: 'Oakridge Education Portal'
            }
          }]
        };

        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData)
        });
        console.log('Discord webhook sent successfully');
      } catch (webhookError) {
        console.warn('Failed to send Discord webhook:', webhookError);
      }

      await fetchApplications();
      return data;
    } catch (err) {
      console.error('Error in submitApplication:', err);
      console.error('Full error object:', err);
      throw err;
    }
  };

  const updateApplicationStatus = async (
    applicationId: string, 
    status: 'accepted' | 'denied', 
    notes?: string
  ) => {
    if (!supabase || !user) {
      throw new Error('Supabase not available or user not authenticated');
    }

    // Validate inputs
    if (!applicationId || typeof applicationId !== 'string') {
      throw new Error('Invalid application ID');
    }
    
    // Validate UUID format for application ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(applicationId)) {
      throw new Error('Invalid application ID format');
    }
    
    // Validate status
    if (!['accepted', 'denied'].includes(status)) {
      throw new Error('Invalid status value');
    }
    
    // Sanitize notes
    const sanitizedNotes = notes ? notes.trim().substring(0, 1000) : null; // 1KB limit for notes
    try {
      const { data, error } = await supabase
        .from('applications')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          notes: sanitizedNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)
        .select(`
          *,
          profiles!applications_user_id_fkey(username, avatar, id)
        `)
        .single();

      if (error) {
        console.error('Error updating application:', error);
        throw error;
      }

      // If application is accepted, update user role to student
      if (status === 'accepted' && data.user_id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            role: 'student',
            status: 'accepted',
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user_id);

        if (updateError) {
          console.error('Error updating user role:', updateError);
        } else {
          console.log('Successfully updated user role to student');
        }
      }

      // If application is denied, update user status to denied
      if (status === 'denied' && data.user_id) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            status: 'denied',
            updated_at: new Date().toISOString()
          })
          .eq('id', data.user_id);

        if (updateError) {
          console.error('Error updating user status to denied:', updateError);
        } else {
          console.log('Successfully updated user status to denied');
        }
      }

      // Send Discord webhook for application action
      const webhookUrl = 'https://discord.com/api/webhooks/1402319661781094471/WeucDSZhtqWifYWjieR0M4x5tmeuwtIIFAd9d_ZKGgg1xLVOqRRN99sovN23B90OFNcW';
      
      const webhookData = {
        embeds: [{
          title: `Application ${status.charAt(0).toUpperCase() + status.slice(1)}`,
          description: `Application #${applicationId.slice(0, 8)} has been ${status}`,
          color: status === 'accepted' ? 0x00ff00 : 0xff0000,
          fields: [
            {
              name: 'Application ID',
              value: `#${applicationId.slice(0, 8)}`,
              inline: true
            },
            {
              name: 'Status',
              value: status.charAt(0).toUpperCase() + status.slice(1),
              inline: true
            },
            {
              name: 'Reviewed By',
              value: user.username,
              inline: true
            },
            {
              name: 'Review Date',
              value: new Date().toLocaleString(),
              inline: true
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Oakridge Education Portal'
          }
        }]
      };

      // Send webhook (don't block on failure)
      try {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData)
        });
      } catch (webhookError) {
        console.warn('Failed to send Discord webhook:', webhookError);
      }

      await fetchApplications();
      return data;
    } catch (err) {
      console.error('Error in updateApplicationStatus:', err);
      throw err;
    }
  };

  const getUserApplication = async (userId: string) => {
    if (!supabase) {
      console.log('Supabase not available, returning null');
      return null;
    }

    try {
      console.log('Fetching application for user:', userId);
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user application:', error);
        return null;
      }

      console.log('User application data:', data);
      return data;
    } catch (err) {
      console.error('Error in getUserApplication:', err);
      return null;
    }
  };

  useEffect(() => {
    if (supabase && user?.id && (user.role === 'staff' || user.role === 'admin')) {
      fetchApplications();
    }
  }, [user?.id, user?.role]);

  return {
    applications,
    loading,
    error,
    submitApplication,
    updateApplicationStatus,
    getUserApplication,
    refetch: fetchApplications
  };
}