import React, { useState } from 'react';
import { History, Calendar, Clock, MapPin, Ship, TrendingUp, Filter, Download, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface HistoryEntry {
  id: string;
  type: 'trip' | 'alert' | 'message' | 'maintenance' | 'system';
  title: string;
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
  metadata?: any;
  location?: {
    latitude: number;
    longitude: number;
  };
}

const HistoryManagement: React.FC = () => {
  const { user } = useAuth();
  const { trips, alerts, messages } = useData();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Générer l'historique à partir des données existantes
  const generateHistory = (): HistoryEntry[] => {
    const history: HistoryEntry[] = [];

    // Ajouter les sorties
    trips.forEach(trip => {
      history.push({
        id: `trip-${trip.id}`,
        type: 'trip',
        title: 'Sortie de pêche',
        description: `Sortie ${trip.endTime ? 'terminée' : 'en cours'} - Distance: ${trip.distance?.toFixed(1) || 0} km`,
        timestamp: trip.startTime,
        userId: trip.userId,
        userName: 'Pêcheur',
        metadata: trip,
        location: trip.startLocation ? {
          latitude: trip.startLocation.latitude,
          longitude: trip.startLocation.longitude
        } : undefined
      });
    });

    // Ajouter les alertes
    alerts.forEach(alert => {
      history.push({
        id: `alert-${alert.id}`,
        type: 'alert',
        title: `Alerte ${alert.type}`,
        description: alert.message,
        timestamp: alert.createdAt,
        userId: alert.userId,
        userName: 'Utilisateur',
        metadata: alert,
        location: alert.location ? {
          latitude: alert.location.latitude,
          longitude: alert.location.longitude
        } : undefined
      });
    });

    // Ajouter les messages importants
    messages.filter(msg => msg.type === 'location' || msg.content.includes('urgence')).forEach(message => {
      history.push({
        id: `message-${message.id}`,
        type: 'message',
        title: 'Message important',
        description: message.content,
        timestamp: message.timestamp,
        userId: message.senderId,
        userName: 'Utilisateur',
        metadata: message
      });
    });

    return history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const historyEntries = generateHistory();

  const filteredHistory = historyEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || entry.type === filterType;
    
    // Filtrer par période
    const entryDate = new Date(entry.timestamp);
    const now = new Date();
    let matchesPeriod = true;
    
    switch (selectedPeriod) {
      case 'day':
        matchesPeriod = entryDate.toDateString() === now.toDateString();
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesPeriod = entryDate >= weekAgo;
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        matchesPeriod = entryDate >= monthAgo;
        break;
    }
    
    return matchesSearch && matchesType && matchesPeriod;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'trip': return <Ship className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'message': return <MessageSquare className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'system': return <Activity className="w-4 h-4" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'trip': return 'bg-blue-100 text-blue-800';
      case 'alert': return 'bg-red-100 text-red-800';
      case 'message': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'system': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'trip': return 'Sortie';
      case 'alert': return 'Alerte';
      case 'message': return 'Message';
      case 'maintenance': return 'Maintenance';
      case 'system': return 'Système';
      default: return type;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Historique des Activités</h1>
        <p className="text-gray-600">Consultez l'historique complet des activités et événements</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        {['trip', 'alert', 'message', 'maintenance', 'system'].map((type) => {
          const count = historyEntries.filter(h => h.type === type).length;
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{getTypeLabel(type)}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(type).replace('text-', 'text-').replace('bg-', 'bg-').replace('-800', '-100')}`}>
                  {getTypeIcon(type)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher dans l'historique..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="day">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="all">Tout l'historique</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="trip">Sorties</option>
              <option value="alert">Alertes</option>
              <option value="message">Messages</option>
              <option value="maintenance">Maintenance</option>
              <option value="system">Système</option>
            </select>
          </div>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300">
            <Download className="w-4 h-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Timeline de l'historique */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Historique des Activités ({filteredHistory.length})
          </h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {filteredHistory.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun historique trouvé</h3>
              <p className="text-gray-600">Aucune activité ne correspond aux critères sélectionnés</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredHistory.map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-6 hover:bg-gray-50"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-2 rounded-lg ${getTypeColor(entry.type)}`}>
                      {getTypeIcon(entry.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{entry.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{entry.description}</p>
                          
                          {entry.location && (
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>
                                {entry.location.latitude.toFixed(4)}, {entry.location.longitude.toFixed(4)}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(entry.type)}`}>
                            {getTypeLabel(entry.type)}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(entry.timestamp).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryManagement;