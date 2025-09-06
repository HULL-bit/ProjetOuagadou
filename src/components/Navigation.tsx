import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  Ship, 
  Shield, 
  History, 
  User, 
  Activity, 
  Satellite,
  FileText,
  LogOut,
  Menu,
  X,
  Anchor,
  Waves,
  Building2,
  Anchor as AnchorIcon,
  MessageCircle,
  Image,
  CloudRain,
  Settings,
  Warehouse
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ 
  activeView, 
  onViewChange, 
  isSidebarOpen, 
  onToggleSidebar 
}) => {
  const { user, logout } = useAuth();

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
      { id: 'map', label: 'Carte Marine', icon: Map },
      { id: 'gps-tracking', label: 'Tracking GPS', icon: Satellite },
      { id: 'history', label: 'Historique', icon: History },
      { id: 'weather', label: 'Météo', icon: CloudRain },
      { id: 'profile', label: 'Profil', icon: User },
    ];

    // Éléments pour tous les utilisateurs
    const commonItems = [
      { id: 'armateurs', label: 'Armateurs', icon: Building2 },
      { id: 'balises', label: 'Balises', icon: AnchorIcon },
      { id: 'pirogues', label: 'Pirogues', icon: Ship },
      { id: 'quais', label: 'Quais', icon: Warehouse },
      { id: 'media', label: 'Galerie Média', icon: Image },
      { id: 'support', label: 'Support', icon: MessageCircle },
    ];

    // Ajouter les éléments communs
    baseItems.push(...commonItems);

    if (user?.role === 'organization' || user?.role === 'admin') {
      baseItems.splice(2, 0, 
        { id: 'fleet', label: 'Gestion Flotte', icon: Ship },
        { id: 'users', label: 'Utilisateurs', icon: Users }
      );
    }

    if (user?.role === 'admin') {
      baseItems.push(
        { id: 'zones', label: 'Zones', icon: Shield },
        { id: 'monitoring', label: 'Monitoring', icon: Activity },
        { id: 'logs', label: 'Logs Système', icon: FileText }
      );
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden bg-white shadow-lg border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div 
            whileHover={{ rotate: 10 }}
            className="w-10 h-10 bg-gradient-to-br from-maritime-600 to-ocean-600 rounded-xl flex items-center justify-center"
          >
            <Anchor className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-maritime-600 to-ocean-600 bg-clip-text text-transparent">
              PIROGUE-SMART
            </h1>
            <p className="text-xs text-gray-600">Système Maritime Intelligent</p>
          </div>
        </div>
        
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl border-r border-gray-100 lg:translate-x-0"
          >
            {/* Header avec logo pirogue */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-maritime-50 to-ocean-50">
              <div className="flex items-center space-x-3">
                <motion.div 
                  whileHover={{ rotate: 10, scale: 1.05 }}
                  className="relative"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-maritime-600 to-ocean-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Anchor className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-maritime-400 rounded-full animate-pulse"></div>
                  <Waves className="absolute -bottom-2 -right-2 w-4 h-4 text-ocean-400 opacity-60" />
                </motion.div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-maritime-600 to-ocean-600 bg-clip-text text-transparent">
                    PIROGUE-SMART
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">Système Maritime</p>
                </div>
              </div>
            </div>

            {/* User info */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-maritime-50/30">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-maritime-500 to-ocean-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user?.profile?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.profile.fullName}
                  </p>
                  <p className="text-xs text-gray-600 capitalize">
                    {user?.role === 'fisherman' ? 'Pêcheur' : 
                     user?.role === 'organization' ? 'Organisation' : 'Administrateur'}
                  </p>
                  {user?.profile.boatName && (
                    <p className="text-xs text-maritime-600 font-medium">
                      🚢 {user.profile.boatName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-300px)]">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => onViewChange(item.id)}
                    className={`
                      w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-r from-maritime-600 to-ocean-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-maritime-50 hover:text-maritime-700'
                      }
                    `}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
            </nav>

            {/* Footer avec déconnexion */}
            <div className="p-4 border-t border-gray-100">
              <motion.button
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={logout}
                className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Déconnexion</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay pour mobile */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onToggleSidebar}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Collapsed sidebar pour desktop */}
      {!isSidebarOpen && (
        <motion.div
          initial={{ width: 256 }}
          animate={{ width: 80 }}
          transition={{ duration: 0.3 }}
          className="hidden lg:block fixed inset-y-0 left-0 z-50 bg-white shadow-lg border-r border-gray-100"
        >
          <div className="p-4 border-b border-gray-100">
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={onToggleSidebar}
              className="w-12 h-12 bg-gradient-to-br from-maritime-600 to-ocean-600 rounded-xl flex items-center justify-center"
            >
              <Anchor className="w-6 h-6 text-white" />
            </motion.button>
          </div>
          
          <nav className="p-2 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => onViewChange(item.id)}
                  title={item.label}
                  className={`
                    w-full h-12 flex items-center justify-center rounded-xl transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-r from-maritime-600 to-ocean-600 text-white shadow-lg' 
                      : 'text-gray-600 hover:bg-maritime-50 hover:text-maritime-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                </motion.button>
              );
            })}
          </nav>
        </motion.div>
      )}
    </>
  );
};

export default Navigation;