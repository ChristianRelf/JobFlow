import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export interface Profile {
  id: string;
  discord_id: string | null;
  username: string;
  avatar: string | null;
  role: 'applicant' | 'student' | 'staff' | 'admin';
  status: 'pending' | 'accepted' | 'denied';
  created_at: string;
  updated_at: string;
  last_active: string | null;
}

export function useSupabaseProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProfiles = async (forceLoad = false) => {
    if (!supabase) {
      console.warn('Supabase not available');
      setLoading(false);
      return;
    }

    // Allow fetching profiles for certificate verification even without user
    if (!user && !forceLoad) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching profiles:', error);
        setError(error.message);
        return;
      }

      setProfiles(data || []);
      setError(null);
    } catch (err) {
      console.error('Error in fetchProfiles:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'applicant' | 'student' | 'staff' | 'admin') => {
    if (!supabase || !user) {
      throw new Error('Supabase not available or user not authenticated');
    }

    // Validate user ID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!userId || !uuidRegex.test(userId)) {
      throw new Error('Invalid user ID format');
    }
    
    // Validate role
    const validRoles = ['applicant', 'student', 'staff', 'admin'];
    if (!validRoles.includes(newRole)) {
      throw new Error('Invalid role specified');
    }
    
    // Prevent users from modifying their own role (except admins can demote themselves)
    if (userId === user.id && user.role !== 'admin') {
      throw new Error('Cannot modify your own role');
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          role: newRole,
          status: newRole === 'applicant' ? 'pending' : 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating user role:', error);
        throw error;
      }

      // Send Discord webhook for role change
      try {
        const staffWebhookUrl = 'https://discord.com/api/webhooks/1402319981605290114/-KCOA_9a-PMM2qqZWqT4IF77WI-2xba27PwqFz1e4xm6-pzxc3eynXemllHslX2AZ_og';
        
        const webhookData = {
          embeds: [{
            title: '👤 User Role Updated',
            description: `${user.username} has updated a user's role`,
            color: 0xeac66d,
            fields: [
              {
                name: 'User',
                value: data.username,
                inline: true
              },
              {
                name: 'New Role',
                value: newRole,
                inline: true
              },
              {
                name: 'Updated By',
                value: user.username,
                inline: true
              },
              {
                name: 'Update Date',
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

        await fetch(staffWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData)
        });
      } catch (webhookError) {
        console.warn('Failed to send Discord webhook:', webhookError);
      }

      await fetchProfiles();
      return data;
    } catch (err) {
      console.error('Error in updateUserRole:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (user?.id && (user.role === 'staff' || user.role === 'admin')) {
      fetchProfiles();
    }
  }, [user?.id, user?.role]);

  return {
    profiles,
    loading,
    error,
    updateUserRole,
    refetch: fetchProfiles,
    fetchAllProfiles: () => fetchProfiles(true)
  };
}