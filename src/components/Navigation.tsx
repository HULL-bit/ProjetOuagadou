import React from 'react';
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
  FileText
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, onViewChange }) => {
  const { user, logout } = useAuth();

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
    <nav className="bg-white shadow-lg border-r border-gray-200 w-64 min-h-screen flex flex-col">
      {/* Logo and user info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center mb-4">
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg p-2 mr-3">
            <Ship className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">PIROGUE</h1>
            <p className="text-sm text-cyan-600 font-semibold">CONNECT</p>
          </div>
        </div>
        
        {user && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-semibold text-gray-900">{user.profile.fullName}</p>
            <p className="text-xs text-gray-600 capitalize">{user.role}</p>
            {user.profile.boatName && (
              <p className="text-xs text-cyan-600 mt-1">🚢 {user.profile.boatName}</p>
            )}
          </div>
        )}
      </div>

      {/* Navigation items */}
      <div className="flex-1 py-6">
        <ul className="space-y-2 px-3">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors
                    ${isActive 
                      ? 'bg-cyan-600 text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Settings and logout */}
      <div className="border-t border-gray-200 p-3">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => onViewChange('settings')}
              className={`
                w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors
                ${activeView === 'settings' 
                  ? 'bg-cyan-600 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              <Settings className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Paramètres</span>
            </button>
          </li>
          <li>
            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;