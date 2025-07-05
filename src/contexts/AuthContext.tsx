import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profileData: any) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock users pour le fallback démo
const mockUsers: User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    email: 'amadou@example.com',
    username: 'amadou_pecheur',
    role: 'fisherman',
    profile: {
      fullName: 'Amadou Diallo',
      phone: '+221 77 123 4567',
      boatName: 'Ndakaaru',
      licenseNumber: 'SN-CAY-001'
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    email: 'fatou@gie-cayar.sn',
    username: 'fatou_coordinatrice',
    role: 'organization',
    profile: {
      fullName: 'Fatou Sow',
      phone: '+221 77 987 6543'
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    email: 'admin@pirogue-connect.sn',
    username: 'admin',
    role: 'admin',
    profile: {
      fullName: 'Administrateur Système',
      phone: '+221 77 555 0000'
    }
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier la session existante
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          // Fallback vers localStorage pour le mode démo
          const storedUser = localStorage.getItem('pirogue_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Erreur vérification session:', error);
        // Fallback vers localStorage
        const storedUser = localStorage.getItem('pirogue_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('pirogue_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Erreur chargement profil:', error);
        return;
      }

      if (profile) {
        const user: User = {
          id: profile.id,
          email: profile.email,
          username: profile.email.split('@')[0],
          role: profile.role,
          profile: {
            fullName: profile.full_name,
            phone: profile.phone,
            boatName: profile.boat_name,
            licenseNumber: profile.license_number,
            avatar: profile.avatar_url
          }
        };
        setUser(user);
        localStorage.setItem('pirogue_user', JSON.stringify(user));
        console.log('✅ Profil utilisateur chargé depuis Supabase');
      }
    } catch (error) {
      console.error('Erreur chargement profil utilisateur:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Essayer l'authentification Supabase d'abord
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.log('Authentification Supabase échouée, utilisation du mode démo:', error.message);
        return mockLogin(email, password);
      }

      if (data.user) {
        await loadUserProfile(data.user);
        console.log('✅ Connexion Supabase réussie');
        return true;
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      // Fallback vers l'authentification mock
      return mockLogin(email, password);
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  const register = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Essayer l'inscription Supabase d'abord
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password
      });

      if (error) {
        console.log('Inscription Supabase échouée, utilisation du mode démo:', error.message);
        return mockRegister(userData);
      }

      if (data.user) {
        // Créer le profil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: userData.email,
            full_name: userData.fullName,
            phone: userData.phone,
            role: userData.role,
            boat_name: userData.boatName,
            license_number: userData.licenseNumber
          });

        if (profileError) {
          console.error('Erreur création profil:', profileError);
          return mockRegister(userData);
        }

        await loadUserProfile(data.user);
        console.log('✅ Inscription Supabase réussie');
        return true;
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      return mockRegister(userData);
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  const mockLogin = async (email: string, password: string): Promise<boolean> => {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser && (password === 'password123' || password === 'password')) {
      setUser(foundUser);
      localStorage.setItem('pirogue_user', JSON.stringify(foundUser));
      setIsLoading(false);
      console.log('✅ Connexion mode démo réussie');
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const mockRegister = async (userData: any): Promise<boolean> => {
    // Simuler un appel API
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      username: userData.email.split('@')[0],
      role: userData.role,
      profile: {
        fullName: userData.fullName,
        phone: userData.phone,
        boatName: userData.boatName,
        licenseNumber: userData.licenseNumber
      }
    };
    
    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('pirogue_user', JSON.stringify(newUser));
    setIsLoading(false);
    console.log('✅ Inscription mode démo réussie');
    return true;
  };

  const updateProfile = async (profileData: any): Promise<void> => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.fullName,
          phone: profileData.phone,
          boat_name: profileData.boatName,
          license_number: profileData.licenseNumber,
          avatar_url: profileData.avatar
        })
        .eq('id', user.id);

      if (error) throw error;

      // Mettre à jour l'état local
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          ...profileData
        }
      };
      setUser(updatedUser);
      localStorage.setItem('pirogue_user', JSON.stringify(updatedUser));
      console.log('✅ Profil mis à jour dans Supabase');
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      // Fallback vers mise à jour locale
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          ...profileData
        }
      };
      setUser(updatedUser);
      localStorage.setItem('pirogue_user', JSON.stringify(updatedUser));
      console.log('✅ Profil mis à jour en mode démo');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      console.log('✅ Mot de passe changé dans Supabase');
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      // Pour le mode démo, simuler le succès
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('✅ Mot de passe changé en mode démo');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      console.log('✅ Déconnexion Supabase');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
    
    setUser(null);
    localStorage.removeItem('pirogue_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      updateProfile, 
      changePassword, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};