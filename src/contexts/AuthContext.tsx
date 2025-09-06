import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../lib/djangoApi';

// Données de test pour le mode démo
const testUsers = [
  {
    id: 1,
    username: 'amadou',
    email: 'amadou@example.com',
    role: 'fisherman',
    profile: {
      full_name: 'Amadou Diallo',
      phone: '+221771234567',
      boat_name: 'Ndakaaru',
      license_number: 'SN-CAY-001'
    }
  },
  {
    id: 2,
    username: 'fatou',
    email: 'fatou@gie-cayar.sn',
    role: 'organization',
    profile: {
      full_name: 'Fatou Sow',
      phone: '+221779876543',
      organization_name: 'GIE Cayar',
      organization_type: 'gie'
    }
  },
  {
    id: 3,
    username: 'admin',
    email: 'admin@pirogue-connect.sn',
    role: 'admin',
    profile: {
      full_name: 'Administrateur Système',
      phone: '+221775550000'
    }
  }
];

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  profile: {
    full_name: string;
    phone?: string;
    boat_name?: string;
    license_number?: string;
  };
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User['profile']>) => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'fisherman' | 'organization' | 'admin';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est déjà connecté au chargement
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const savedUser = localStorage.getItem('user');
        
        if (token && savedUser) {
          const currentUser = authAPI.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            return;
          }
          
          // Essayer de récupérer le profil depuis Django
          try {
            if (authAPI.isAuthenticated && authAPI.isAuthenticated()) {
              const profile = await authAPI.getProfile();
              setUser(profile);
            }
          } catch (apiError) {
            // Si Django n'est pas disponible, utiliser les données sauvegardées
            const userData = JSON.parse(savedUser);
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        // Supprimer les données invalides
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Essayer d'abord avec Django
      try {
        const response = await authAPI.login({ email, password });
        setUser(response.user);
        return true;
      } catch (djangoError) {
        console.warn('Django non disponible, utilisation du mode démo');
        
        // Mode démo - vérifier les comptes de test
        const testUser = testUsers.find(u => u.email === email);
        if (testUser && password === 'password123') {
          // Simuler un token
          const token = `demo_token_${testUser.id}_${Date.now()}`;
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify(testUser));
          setUser(testUser);
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      
      try {
        const response = await authAPI.register(userData);
        setUser(response.user);
      } catch (djangoError) {
        console.warn('Django non disponible, création de compte en mode démo');
        
        // Mode démo - créer un utilisateur local
        const newUser = {
          id: Date.now(),
          username: userData.email.split('@')[0],
          email: userData.email,
          role: userData.role,
          profile: {
            full_name: userData.username
          }
        };
        
        const token = `demo_token_${newUser.id}_${Date.now()}`;
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
      }
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User['profile']>) => {
    try {
      const updatedUser = await authAPI.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};