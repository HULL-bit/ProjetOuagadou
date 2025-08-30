import React, { useState } from 'react';
import { 
  Ship, 
  Map, 
  MessageSquare, 
  AlertTriangle, 
  Settings, 
  LogOut, 
  Users, 
  BarChart3,
  Shield,
  User,
  Anchor,
  FileText,
  ChevronLeft,
  ChevronRight,
  Waves,
  Activity,
  MapPin,
  Camera,
  History,
  HelpCircle,
  Radio,
  Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange }) => {
  const { user, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Tableau de Bord', icon: Ship },
      { id: 'map', label: 'Carte Marine', icon: Map },
      { id: 'communication', label: 'Communication', icon: MessageSquare },
      { id: 'alerts', label: 'Alertes', icon: AlertTriangle },
    ];

    switch (user?.role) {
      case 'fisherman':
        return [
          ...baseItems,
          { id: 'profile', label: 'Mon Profil', icon: User },
          { id: 'history', label: 'Historique', icon: BarChart3 },
        ];
      
      case 'organization':
        return [
          ...baseItems,
          { id: 'fleet-management', label: 'Gestion Flotte', icon: Anchor },
          { id: 'user-management', label: 'Utilisateurs', icon: Users },
          { id: 'statistics', label: 'Statistiques', icon: BarChart3 },
          { id: 'zones', label: 'Zones Sécurité', icon: Shield },
        ];
      
      case 'admin':
        return [
          ...baseItems,
          { id: 'fleet-management', label: 'Gestion Flotte', icon: Anchor },
          { id: 'user-management', label: 'Utilisateurs', icon: Users },
          { id: 'system-monitoring', label: 'Monitoring', icon: BarChart3 },
          { id: 'zones', label: 'Zones Sécurité', icon: Shield },
          { id: 'logs', label: 'Logs Système', icon: FileText },
          { id: 'system-settings', label: 'Configuration', icon: Settings },
        ];
      
      default:
        return baseItems;
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <motion.nav 
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-gradient-to-b from-slate-900 to-slate-800 backdrop-blur-xl border-r border-slate-700/50 min-h-screen flex flex-col relative shadow-2xl"
    >
      {/* Collapse Toggle */}
      <motion.button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full p-1.5 shadow-lg hover:shadow-xl transition-all duration-300 z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </motion.button>

      {/* Logo and user info */}
      <div className="p-6 border-b border-slate-700/50">
        <motion.div 
          className="flex items-center mb-6"
          animate={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
        >
          <div className="relative">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl p-3 shadow-lg">
              <Ship className="w-6 h-6 text-white" />
            </div>
            <motion.div
              className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-4 h-4 flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Activity className="w-2 h-2 text-white" />
            </motion.div>
          </div>
          
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="ml-3"
              >
                <h1 className="text-xl font-bold text-white">PIROGUE</h1>
                <div className="flex items-center space-x-1">
                  <p className="text-sm text-cyan-400 font-semibold">SMART</p>
                  <Waves className="w-3 h-3 text-cyan-400 animate-pulse" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        <AnimatePresence>
          {user && !isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm rounded-xl p-4 border border-slate-600/30"
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user.profile.fullName}</p>
                  <p className="text-xs text-slate-400 capitalize flex items-center">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    {user.role}
                  </p>
                </div>
              </div>
              {user.profile.boatName && (
                <div className="flex items-center text-xs text-cyan-400 bg-cyan-500/10 rounded-lg p-2 mt-2">
                  <Anchor className="w-3 h-3 mr-1" />
                  <span>{user.profile.boatName}</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation items */}
      <div className="flex-1 py-6 px-3">
        <motion.ul className="space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <motion.li 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <motion.button
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full flex items-center rounded-xl text-left transition-all duration-300 group relative overflow-hidden
                    ${isActive 
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ padding: isCollapsed ? '12px' : '12px 16px' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  
                  <motion.div
                    className="relative flex items-center"
                    animate={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                  >
                    <Icon className="w-5 h-5 relative z-10" />
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                          className="text-sm font-medium ml-3 relative z-10"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  
                  {/* Hover effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ pointerEvents: 'none' }}
                  />
                </motion.button>
              </motion.li>
            );
          })}
        </motion.ul>
      </div>

      {/* Settings and logout */}
      <div className="border-t border-slate-700/50 p-3">
        <motion.ul className="space-y-2">
          <motion.li whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              onClick={() => onViewChange('settings')}
              className={`
                w-full flex items-center rounded-xl text-left transition-all duration-300 group relative
                ${activeView === 'settings' 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' 
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }
              `}
              style={{ padding: isCollapsed ? '12px' : '12px 16px' }}
            >
              <motion.div
                className="relative flex items-center"
                animate={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
              >
                <Settings className="w-5 h-5" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium ml-3"
                    >
                      Paramètres
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </button>
          </motion.li>
          
          <motion.li whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <button
              onClick={logout}
              className="w-full flex items-center rounded-xl text-left text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 group"
              style={{ padding: isCollapsed ? '12px' : '12px 16px' }}
            >
              <motion.div
                className="relative flex items-center"
                animate={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
              >
                <LogOut className="w-5 h-5" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="text-sm font-medium ml-3"
                    >
                      Déconnexion
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </button>
          </motion.li>
        </motion.ul>
      </div>

      {/* Gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900/20 pointer-events-none"></div>
    </motion.nav>
  );
};

export default Navigation;