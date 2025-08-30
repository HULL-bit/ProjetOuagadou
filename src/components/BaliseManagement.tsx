import React, { useState } from 'react';
import { Radio, Plus, Edit, Trash2, Search, MapPin, Activity, Signal, Battery, Wifi } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface Balise {
  id: string;
  name: string;
  type: 'navigation' | 'emergency' | 'weather' | 'communication';
  location: {
    latitude: number;
    longitude: number;
  };
  status: 'active' | 'inactive' | 'maintenance';
  batteryLevel: number;
  signalStrength: number;
  lastCommunication: string;
  zone: string;
  frequency: string;
  range: number; // en km
}

const BaliseManagement: React.FC = () => {
  const { user } = useAuth();
  const [balises, setBalises] = useState<Balise[]>([
    {
      id: '1',
      name: 'Balise Cayar Nord',
      type: 'navigation',
      location: {
        latitude: 14.9425,
        longitude: -17.1825
      },
      status: 'active',
      batteryLevel: 85,
      signalStrength: 92,
      lastCommunication: new Date().toISOString(),
      zone: 'Zone de Sécurité Nord',
      frequency: '156.800 MHz',
      range: 15
    },
    {
      id: '2',
      name: 'Balise Urgence Sud',
      type: 'emergency',
      location: {
        latitude: 14.9225,
        longitude: -17.2025
      },
      status: 'active',
      batteryLevel: 67,
      signalStrength: 78,
      lastCommunication: new Date(Date.now() - 300000).toISOString(),
      zone: 'Zone d\'Urgence Sud',
      frequency: '121.500 MHz',
      range: 25
    },
    {
      id: '3',
      name: 'Station Météo',
      type: 'weather',
      location: {
        latitude: 14.9325,
        longitude: -17.1925
      },
      status: 'maintenance',
      batteryLevel: 45,
      signalStrength: 65,
      lastCommunication: new Date(Date.now() - 1800000).toISOString(),
      zone: 'Port Principal',
      frequency: '162.550 MHz',
      range: 20
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBalises = balises.filter(balise =>
    balise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    balise.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'navigation': return <MapPin className="w-4 h-4" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4" />;
      case 'weather': return <Cloud className="w-4 h-4" />;
      case 'communication': return <Radio className="w-4 h-4" />;
      default: return <Radio className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'navigation': return 'bg-blue-100 text-blue-800';
      case 'emergency': return 'bg-red-100 text-red-800';
      case 'weather': return 'bg-green-100 text-green-800';
      case 'communication': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 60) return 'text-green-600';
    if (level > 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSignalColor = (strength: number) => {
    if (strength > 80) return 'text-green-600';
    if (strength > 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Balises</h1>
        <p className="text-gray-600">Surveillance et configuration des balises de navigation et communication</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Balises</p>
              <p className="text-2xl font-bold text-gray-900">{balises.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Radio className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Actives</p>
              <p className="text-2xl font-bold text-green-600">
                {balises.filter(b => b.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">
                {balises.filter(b => b.status === 'maintenance').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Settings className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Couverture</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(balises.reduce((sum, b) => sum + b.range, 0) / balises.length)} km
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wifi className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Liste des balises */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Balises Déployées</h3>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredBalises.map((balise, index) => (
            <motion.div
              key={balise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-6 hover:bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(balise.type)}`}>
                      {getTypeIcon(balise.type)}
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">{balise.name}</h4>
                      <p className="text-sm text-gray-600">{balise.zone}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(balise.status)}`}>
                      {balise.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Battery className={`w-4 h-4 ${getBatteryColor(balise.batteryLevel)}`} />
                      <span>Batterie: {balise.batteryLevel}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Signal className={`w-4 h-4 ${getSignalColor(balise.signalStrength)}`} />
                      <span>Signal: {balise.signalStrength}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Radio className="w-4 h-4 text-gray-400" />
                      <span>{balise.frequency}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wifi className="w-4 h-4 text-gray-400" />
                      <span>Portée: {balise.range} km</span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Dernière communication: {new Date(balise.lastCommunication).toLocaleString('fr-FR')}
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => setEditingBalise(balise)}
                    className="p-2 text-cyan-600 hover:text-cyan-900 hover:bg-cyan-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setBalises(prev => prev.filter(b => b.id !== balise.id))}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BaliseManagement;