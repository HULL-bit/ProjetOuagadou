import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import LoginForm from './components/LoginForm';
import WagaduInspiredHeader from './components/WagaduInspiredHeader';
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
          <div className="p-6 bg-gray-50 min-h-full">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">Carte Marine Complète</h1>
                <p className="text-gray-600">Vue d'ensemble des positions et zones maritimes</p>
              </div>
              <div className="h-[calc(100vh-160px)]">
                <MapView className="h-full" />
              </div>
            </div>
          </div>
        );
      case 'alerts':
        return (
          <div className="p-6 bg-gray-50 min-h-full">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Centre d'Alertes</h1>
              <p className="text-gray-600">Gestion des alertes et notifications système</p>
            </div>
            <AlertsPanel />
          </div>
        );
      case 'communication':
        return (
          <div className="p-6 bg-gray-50 min-h-full">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Communication</h1>
              <p className="text-gray-600">Messagerie et coordination entre équipes</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-gray-600 text-center py-12">
                Utilisez le widget de chat flottant pour communiquer en temps réel
              </p>
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
          <div className="p-6 bg-gray-50 min-h-full">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Fonctionnalité en Développement
              </h2>
              <p className="text-gray-600">
                Cette section sera disponible dans une prochaine mise à jour.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <WagaduInspiredHeader activeView={activeView} onViewChange={setActiveView} />
      
      <main className="overflow-hidden relative">
        {renderMainContent()}
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