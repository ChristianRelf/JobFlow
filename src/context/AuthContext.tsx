import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  username: string;
  avatar: string;
  role: 'applicant' | 'student' | 'staff' | 'admin';
  status: 'pending' | 'accepted' | 'denied';
  discordId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signInWithDiscord: () => Promise<void>;
  signOut: () => Promise<void>;
  updateUserRole: (userId: string, role: User['role']) => void;
  login: (userData: User) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        if (!supabase) {
          console.warn('⚠️ Supabase client not available - running in offline mode');
          console.warn('Database features will be limited until Supabase is connected');
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        console.log('🔄 Initializing auth...');

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('✅ Found existing session for user:', session.user.id);
          await loadUserProfile(session.user);
        } else if (mounted) {
          console.log('ℹ️ No existing session found');
          setUser(null);
          setIsLoading(false);
        }

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (!mounted) return;
          
          console.log('Auth state changed:', event, session?.user?.id);
          
          if (event === 'SIGNED_IN' && session?.user) {
            console.log('User signed in, loading profile...');
            await loadUserProfile(session.user);
          } else if (event === 'SIGNED_OUT' || !session) {
            console.log('User signed out or no session');
            setUser(null);
            setIsLoading(false);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    const loadUserProfile = async (authUser: any) => {
      try {
        console.log('🔄 Loading profile for user:', authUser.id);

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('❌ Error loading profile:', error);
          if (mounted) setIsLoading(false);
          return;
        }

        if (!profile) {
          console.log('🔄 Creating new profile for user:', authUser.id);

          // Extract Discord info from user metadata
          const discordUsername = authUser.user_metadata?.full_name || 
                                 authUser.user_metadata?.name || 
                                 authUser.user_metadata?.preferred_username ||
                                 authUser.email?.split('@')[0] || 
                                 'User';
          
          // Get Discord avatar URL  
          const discordAvatar = authUser.user_metadata?.avatar_url || 
                               authUser.user_metadata?.picture ||
                               `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 6)}.png`;

          // Check if this Discord ID should be an admin
          const discordId = authUser.user_metadata?.provider_id || 
                           authUser.user_metadata?.sub || 
                           authUser.user_metadata?.custom_claims?.discord_id ||
                           null;
          
          console.log('🔍 Discord ID from metadata:', discordId);
          console.log('🔍 Discord Avatar from metadata:', discordAvatar);
          console.log('🔍 Full user metadata:', authUser.user_metadata);

          const isAdmin = discordId === '541551772288811009' || 
                         authUser.user_metadata?.provider_id === '541551772288811009' ||
                         authUser.user_metadata?.sub === '541551772288811009';
          
          console.log('🔍 Is admin check:', isAdmin);
          
          const newProfile = {
            id: authUser.id,
            username: discordUsername,
            avatar: discordAvatar,
            discord_id: discordId,
            role: isAdmin ? 'admin' as const : 'applicant' as const,
            status: isAdmin ? 'accepted' as const : 'pending' as const
          };

          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();

          if (createError) {
            console.error('❌ Error creating profile:', createError);
            if (mounted) setIsLoading(false);
            return;
          }

          console.log('✅ Profile created successfully:', createdProfile.username);

          // Send Discord webhook for new user registration
          try {
            const webhookUrl = 'https://discord.com/api/webhooks/1402332073406234645/D-u77pnvJqNygs8fvrqkrE7vgRNKiTx9DU1813eV93qFFZlhOVAqX2svazovqcL357hh';
            
            const webhookData = {
              embeds: [{
                title: '🎉 New User Registered',
                description: `A new user has joined the platform`,
                color: 0x00ff00,
                fields: [
                  {
                    name: 'Username',
                    value: createdProfile.username,
                    inline: true
                  },
                  {
                    name: 'Role',
                    value: createdProfile.role,
                    inline: true
                  },
                  {
                    name: 'Status',
                    value: createdProfile.status,
                    inline: true
                  },
                  {
                    name: 'Discord ID',
                    value: createdProfile.discord_id || 'Not available',
                    inline: true
                  },
                  {
                    name: 'Registration Date',
                    value: new Date().toLocaleString(),
                    inline: false
                  }
                ],
                timestamp: new Date().toISOString(),
                footer: {
                  text: 'Oakridge Education Portal'
                },
                thumbnail: {
                  url: createdProfile.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png'
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
          } catch (webhookError) {
            console.warn('Failed to send Discord webhook for new user:', webhookError);
          }

          if (mounted) {
            setUser({
              id: createdProfile.id,
              username: createdProfile.username,
              avatar: createdProfile.avatar,
              role: createdProfile.role,
              status: createdProfile.status,
              discordId: createdProfile.discord_id
            });
            setIsLoading(false);
          }
        } else {
          console.log('✅ Profile loaded successfully:', profile.username);

          // Update avatar if it's changed or missing
          const currentAvatar = authUser.user_metadata?.avatar_url || 
                               authUser.user_metadata?.picture ||
                               profile.avatar ||
                               `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 6)}.png`;
          
          // Update profile avatar if it's different
          if (profile.avatar !== currentAvatar) {
            console.log('🔄 Updating user avatar...');
            try {
              await supabase
                .from('profiles')
                .update({ 
                  avatar: currentAvatar,
                  updated_at: new Date().toISOString()
                })
                .eq('id', authUser.id);
              
              profile.avatar = currentAvatar; // Update local copy
            } catch (updateError) {
              console.warn('Failed to update avatar:', updateError);
            }
          }

          if (mounted) {
            setUser({
              id: profile.id,
              username: profile.username,
              avatar: currentAvatar,
              role: profile.role,
              status: profile.status,
              discordId: profile.discord_id
            });

            // Send Discord webhook for user login
            try {
              const webhookUrl = 'https://discord.com/api/webhooks/1402332073406234645/D-u77pnvJqNygs8fvrqkrE7vgRNKiTx9DU1813eV93qFFZlhOVAqX2svazovqcL357hh';
              
              const webhookData = {
                embeds: [{
                  title: '🔐 User Login',
                  description: `${profile.username} has logged into the platform`,
                  color: 0x00ff00,
                  fields: [
                    {
                      name: 'Username',
                      value: profile.username,
                      inline: true
                    },
                    {
                      name: 'Role',
                      value: profile.role,
                      inline: true
                    },
                    {
                      name: 'Status',
                      value: profile.status,
                      inline: true
                    },
                    {
                      name: 'Discord ID',
                      value: profile.discord_id || 'Not available',
                      inline: true
                    },
                    {
                      name: 'Login Time',
                      value: new Date().toLocaleString(),
                      inline: false
                    }
                  ],
                  timestamp: new Date().toISOString(),
                  footer: {
                    text: 'Oakridge Education Portal'
                  },
                  thumbnail: {
                    url: currentAvatar || 'https://cdn.discordapp.com/embed/avatars/0.png'
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
            } catch (webhookError) {
              console.warn('Failed to send Discord webhook for login:', webhookError);
            }

            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('❌ Error in loadUserProfile:', error);
        if (mounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array - only run once on mount

  const signInWithDiscord = async () => {
    try {
      if (!supabase) {
        console.error('❌ Supabase client not available - cannot sign in with Discord');
        alert('❌ Authentication service is not available. Please check the environment configuration.');
        return;
      }

      console.log('🔄 Initiating Discord sign in...');

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'discord',
        options: {
          redirectTo: `https://portal.oakridge.app/login`
        }
      });

      if (error) {
        console.error('❌ Error signing in with Discord:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ Discord sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      if (!supabase) {
        console.warn('⚠️ Supabase client not available - performing local logout');
        setUser(null);
        return;
      }

      console.log('🔄 Signing out...');

      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error signing out:', error);
        throw error;
      }
      
      setUser(null);
      
      // Clear any cached data on logout
      window.location.reload();
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  const updateUserRole = (userId: string, role: 'applicant' | 'student' | 'staff' | 'admin') => {
    // This would typically update the database
    console.log('Update user role:', userId, role);
  };

  const login = async (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };
  
  const value = {
    user,
    isLoading,
    signInWithDiscord,
    signOut,
    updateUserRole,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};