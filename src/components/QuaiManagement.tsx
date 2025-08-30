import React, { useState } from 'react';
import { Building, Plus, Edit, Trash2, Search, MapPin, Users, Ship, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface Quai {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  capacity: number;
  currentOccupancy: number;
  facilities: string[];
  manager: string;
  operatingHours: {
    open: string;
    close: string;
  };
  status: 'active' | 'maintenance' | 'closed';
  fees: {
    daily: number;
    monthly: number;
  };
}

const QuaiManagement: React.FC = () => {
  const { user } = useAuth();
  const [quais, setQuais] = useState<Quai[]>([
    {
      id: '1',
      name: 'Quai Principal Cayar',
      location: {
        latitude: 14.9325,
        longitude: -17.1925,
        address: 'Port de Cayar, Sénégal'
      },
      capacity: 50,
      currentOccupancy: 32,
      facilities: ['Eau potable', 'Électricité', 'Réparation', 'Carburant', 'Glace'],
      manager: 'Moussa Diop',
      operatingHours: {
        open: '05:00',
        close: '20:00'
      },
      status: 'active',
      fees: {
        daily: 2000,
        monthly: 50000
      }
    },
    {
      id: '2',
      name: 'Quai des Pêcheurs',
      location: {
        latitude: 14.9300,
        longitude: -17.1950,
        address: 'Zone Pêcheurs, Cayar'
      },
      capacity: 30,
      currentOccupancy: 18,
      facilities: ['Eau potable', 'Stockage', 'Marché'],
      manager: 'Awa Ndiaye',
      operatingHours: {
        open: '04:30',
        close: '19:00'
      },
      status: 'active',
      fees: {
        daily: 1500,
        monthly: 35000
      }
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuai, setEditingQuai] = useState<Quai | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredQuais = quais.filter(quai =>
    quai.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quai.location.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const percentage = (occupancy / capacity) * 100;
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Quais de Pêche</h1>
        <p className="text-gray-600">Gérer les infrastructures portuaires et leur occupation</p>
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
              <p className="text-sm font-medium text-gray-600">Total Quais</p>
              <p className="text-2xl font-bold text-gray-900">{quais.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">Capacité Totale</p>
              <p className="text-2xl font-bold text-green-600">
                {quais.reduce((sum, q) => sum + q.capacity, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Ship className="w-6 h-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600">Occupation</p>
              <p className="text-2xl font-bold text-yellow-600">
                {quais.reduce((sum, q) => sum + q.currentOccupancy, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-yellow-600" />
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
              <p className="text-sm font-medium text-gray-600">Taux d'Occupation</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round((quais.reduce((sum, q) => sum + q.currentOccupancy, 0) / quais.reduce((sum, q) => sum + q.capacity, 0)) * 100)}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Header avec actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un quai..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter un quai</span>
          </motion.button>
        </div>
      </div>

      {/* Grille des quais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredQuais.map((quai, index) => (
          <motion.div
            key={quai.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{quai.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {quai.location.address}
                    </p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quai.status)}`}>
                  {quai.status}
                </span>
              </div>

              <div className="space-y-4">
                {/* Occupation */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Occupation</span>
                    <span className={`text-sm font-bold ${getOccupancyColor(quai.currentOccupancy, quai.capacity)}`}>
                      {quai.currentOccupancy}/{quai.capacity}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(quai.currentOccupancy / quai.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Horaires */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Horaires:
                  </span>
                  <span className="font-medium">{quai.operatingHours.open} - {quai.operatingHours.close}</span>
                </div>

                {/* Gestionnaire */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Gestionnaire:</span>
                  <span className="font-medium">{quai.manager}</span>
                </div>

                {/* Tarifs */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Tarifs</div>
                  <div className="flex justify-between text-sm">
                    <span>Journalier: {quai.fees.daily.toLocaleString()} FCFA</span>
                    <span>Mensuel: {quai.fees.monthly.toLocaleString()} FCFA</span>
                  </div>
                </div>

                {/* Équipements */}
                <div>
                  <div className="text-xs text-gray-600 mb-2">Équipements disponibles</div>
                  <div className="flex flex-wrap gap-1">
                    {quai.facilities.map((facility, idx) => (
                      <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setEditingQuai(quai)}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Modifier</span>
                </button>
                <button className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all">
                  <MapPin className="w-4 h-4" />
                  <span>Localiser</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default QuaiManagement;