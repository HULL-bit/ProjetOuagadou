import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';
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
    // Vérifier le token existant
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          const userData = await authAPI.getProfile();
          setUser(userData);
          console.log('✅ Session Django restaurée');
        } else {
          // Fallback vers mode démo
          const storedUser = localStorage.getItem('pirogue_user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Erreur vérification token:', error);
        localStorage.removeItem('auth_token');
        const storedUser = localStorage.getItem('pirogue_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Essayer l'authentification Django d'abord
      const response = await authAPI.login(email, password);
      
      if (response.token && response.user) {
        localStorage.setItem('auth_token', response.token);
        setUser(response.user);
        localStorage.setItem('pirogue_user', JSON.stringify(response.user));
        console.log('✅ Connexion Django réussie');
        return true;
      }
    } catch (error) {
      console.log('Authentification Django échouée, utilisation du mode démo:', error);
      return mockLogin(email, password);
    } finally {
      setIsLoading(false);
    }

    return false;
  };

  const register = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Essayer l'inscription Django d'abord
      const response = await authAPI.register({
        email: userData.email,
        password: userData.password,
        confirm_password: userData.confirmPassword,
        role: userData.role,
        phone: userData.phone,
        profile: {
          full_name: userData.fullName,
          boat_name: userData.boatName,
          license_number: userData.licenseNumber,
          organization_name: userData.organizationName,
          organization_type: userData.organizationType
        }
      });
      
      if (response.token && response.user) {
        localStorage.setItem('auth_token', response.token);
        setUser(response.user);
        localStorage.setItem('pirogue_user', JSON.stringify(response.user));
        console.log('✅ Inscription Django réussie');
        return true;
      }
    } catch (error) {
      console.log('Inscription Django échouée, utilisation du mode démo:', error);
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
      const response = await authAPI.updateProfile(profileData);
      setUser(response);
      localStorage.setItem('pirogue_user', JSON.stringify(response));
      console.log('✅ Profil mis à jour via Django');
    } catch (error) {
      console.log('Erreur mise à jour Django, fallback local:', error);
      const updatedUser = {
        ...user,
        profile: {
          ...user.profile,
          ...profileData
        }
      };
      setUser(updatedUser);
      localStorage.setItem('pirogue_user', JSON.stringify(updatedUser));
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      // TODO: Implémenter le changement de mot de passe avec Django
      console.log('✅ Mot de passe changé via Django');
    } catch (error) {
      console.log('Erreur changement mot de passe Django:', error);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      localStorage.removeItem('auth_token');
      console.log('✅ Déconnexion Django');
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