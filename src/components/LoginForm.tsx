import React, { useState } from 'react';
import { Ship, Lock, Mail, AlertCircle,  Anchor, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import RegistrationForm from './RegistrationForm';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegistration, setShowRegistration] = useState(false);
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const success = await login(email, password);
    if (!success) {
      setError('Email ou mot de passe incorrect');
    }
  };

  if (showRegistration) {
    return <RegistrationForm onBackToLogin={() => setShowRegistration(false)} />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with maritime imagery */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/90 via-blue-900/85 to-slate-900/90" />
        
        {/* Animated waves */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-32 text-cyan-400/20" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <motion.path
              d="M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z"
              fill="currentColor"
              animate={{
                d: [
                  "M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z",
                  "M0,80 C300,40 600,100 900,80 C1050,60 1150,100 1200,80 L1200,120 L0,120 Z",
                  "M0,60 C300,120 600,0 900,60 C1050,90 1150,30 1200,60 L1200,120 L0,120 Z"
                ]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
        </div>
      </div>
      
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            {/* Logo and branding */}
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center mb-8"
            >
              <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl rotate-6"></div>
                <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-4">
                  <Ship className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">
                PIROGUE-SMART
              </h1>
              <p className="text-gray-600 font-medium">Système Intelligent de Gestion Maritime</p>
              <div className="flex items-center justify-center mt-2 text-sm text-gray-500">
                <Anchor className="w-4 h-4 mr-1" />
                <span>Cayar, Sénégal</span>
              </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-600 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-600 transition-colors" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </motion.div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200"
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </motion.div>
              )}

              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-cyan-700 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Connexion...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </motion.button>
            </form>

            {/* Registration link */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-6 text-center"
            >
              <button
                onClick={() => setShowRegistration(true)}
                className="flex items-center justify-center space-x-2 w-full py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
              >
                <UserPlus className="w-4 h-4" />
                <span>Créer un nouveau compte</span>
              </button>
            </motion.div>

            {/* Demo accounts */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="mt-8 pt-6 border-t border-gray-200"
            >
              <div className="text-sm text-gray-600">
                <p className="mb-3 font-semibold text-center">Comptes de démonstration</p>
                <div className="space-y-2 text-xs bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium">🎣 Pêcheur:</span>
                    <span>amadou@example.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">🏢 Organisation:</span>
                    <span>fatou@gie-cayar.sn</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">⚙️ Admin:</span>
                    <span>admin@pirogue-connect.sn</span>
                  </div>
                  <div className="text-center pt-2 border-t border-gray-200 text-gray-500">
                    Mot de passe: <span className="font-mono">password123</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginForm;