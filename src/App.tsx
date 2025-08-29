import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginForm from './components/LoginForm';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import MapView from './components/MapView';
import EmergencyButton from './components/EmergencyButton';
import ChatWidget from './components/ChatWidget';
import AlertsPanel from './components/AlertsPanel';
import UserManagement from './components/UserManagement';
import ProfileSettings from './components/ProfileSettings';
import TripHistory from './components/TripHistory';
import SystemMonitoring from './components/SystemMonitoring';
import ZoneManagement from './components/ZoneManagement';
import FleetManagement from './components/FleetManagement';
import LogsViewer from './components/LogsViewer';
import { Ship } from 'lucide-react';



const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-900 to-blue-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Chargement de Pirogue Connect...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderMainContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'map':
        return (
          <div className="p-8 min-h-full">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
              <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-cyan-50/50 to-blue-50/50">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                  Carte Marine Complète
                </h1>
                <p className="text-slate-600 mt-2">Vue d'ensemble des positions et zones maritimes</p>
              </div>
              <div className="h-[calc(100vh-200px)]">
                <MapView className="h-full" />
              </div>
            </div>
          </div>
        );
      case 'alerts':
        return (
          <div className="p-8 min-h-full">
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
                Centre d'Alertes
              </h1>
              <p className="text-slate-600 text-lg">Gestion des alertes et notifications système</p>
            </div>
            <AlertsPanel />
          </div>
        );
      case 'communication':
        return (
          <div className="p-8 min-h-full">
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-3">
                Communication
              </h1>
              <p className="text-slate-600 text-lg">Messagerie et coordination entre équipes</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border border-white/20">
              <div className="w-20 h-20 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
                Centre de Communication
              </h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Utilisez le widget de chat flottant pour communiquer en temps réel avec les autres membres de l'équipe
              </p>
              <div className="inline-flex items-center space-x-2 bg-cyan-50/80 px-4 py-2 rounded-full border border-cyan-200/30">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-slate-700">Chat en direct disponible</span>
              </div>
            </div>
          </div>
        );
      case 'fleet-management':
        return <FleetManagement />;
      case 'user-management':
        return <UserManagement />;
      case 'profile':
      case 'settings':
        return <ProfileSettings />;
      case 'history':
        return <TripHistory />;
      case 'system-monitoring':
        return <SystemMonitoring />;
      case 'zones':
        return <ZoneManagement />;
      case 'logs':
        return <LogsViewer />;
      default:
        return (
          <div className="p-8 min-h-full flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-12 text-center max-w-md">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Ship className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-4">
                Fonctionnalité en Développement
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Cette section sera disponible dans une prochaine mise à jour.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/30 min-h-screen flex">
      <Navigation activeView={activeView} onViewChange={setActiveView} />
      
      <main className="flex-1 overflow-hidden relative">
        <div className="h-screen overflow-y-auto">
          {renderMainContent()}
        </div>
      </main>

      {/* Floating widgets - positioned to avoid overlap */}
      <div className="fixed bottom-6 right-6 z-40">
        <EmergencyButton />
      </div>
      
      <div className="fixed bottom-6 left-6 z-30">
        <ChatWidget />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
};

export default App;