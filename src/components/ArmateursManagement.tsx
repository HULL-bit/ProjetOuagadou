import React, { useState } from 'react';
import { Users, Plus, Edit, Search, Ship, Phone, Mail, MapPin, Building } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface Armateur {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  pirogues: string[];
  fishermen: string[];
  licenseNumber: string;
  registrationDate: string;
  status: 'active' | 'suspended' | 'inactive';
}

const ArmateursManagement: React.FC = () => {
  const { user } = useAuth();
  const { users } = useData();
  const [armateurs, setArmateurs] = useState<Armateur[]>([
    {
      id: '1',
      name: 'Moussa Diop',
      company: 'Armement Diop & Fils',
      email: 'moussa.diop@armement-cayar.sn',
      phone: '+221 77 123 4567',
      address: 'Cayar, Thiès, Sénégal',
      pirogues: ['1', '2', '3'],
      fishermen: ['550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002'],
      licenseNumber: 'ARM-SN-001',
      registrationDate: '2020-01-15',
      status: 'active'
    },
    {
      id: '2',
      name: 'Awa Ndiaye',
      company: 'GIE Femmes Pêcheuses Cayar',
      email: 'awa.ndiaye@gie-cayar.sn',
      phone: '+221 77 987 6543',
      address: 'Quartier Pêcheurs, Cayar',
      pirogues: ['4', '5'],
      fishermen: ['550e8400-e29b-41d4-a716-446655440003'],
      licenseNumber: 'ARM-SN-002',
      registrationDate: '2019-06-20',
      status: 'active'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingArmateur, setEditingArmateur] = useState<Armateur | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArmateurs = armateurs.filter(armateur =>
    armateur.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    armateur.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Armateurs</h1>
        <p className="text-gray-600">Gérer les familles d'appartenance et armements des pêcheurs</p>
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
              <p className="text-sm font-medium text-gray-600">Total Armateurs</p>
              <p className="text-2xl font-bold text-gray-900">{armateurs.length}</p>
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
              <p className="text-sm font-medium text-gray-600">Pirogues Gérées</p>
              <p className="text-2xl font-bold text-green-600">
                {armateurs.reduce((sum, a) => sum + a.pirogues.length, 0)}
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
              <p className="text-sm font-medium text-gray-600">Pêcheurs Affiliés</p>
              <p className="text-2xl font-bold text-purple-600">
                {armateurs.reduce((sum, a) => sum + a.fishermen.length, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
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
              <p className="text-sm font-medium text-gray-600">Actifs</p>
              <p className="text-2xl font-bold text-cyan-600">
                {armateurs.filter(a => a.status === 'active').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-cyan-600" />
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
              placeholder="Rechercher un armateur..."
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
            <span>Ajouter un armateur</span>
          </motion.button>
        </div>
      </div>

      {/* Grille des armateurs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredArmateurs.map((armateur, index) => (
          <motion.div
            key={armateur.id}
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
                    <h3 className="text-lg font-semibold text-gray-900">{armateur.name}</h3>
                    <p className="text-sm text-gray-600">{armateur.company}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(armateur.status)}`}>
                  {armateur.status}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{armateur.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{armateur.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{armateur.address}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Pirogues:</span>
                    <span className="ml-2 font-medium text-blue-600">{armateur.pirogues.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Pêcheurs:</span>
                    <span className="ml-2 font-medium text-green-600">{armateur.fishermen.length}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => setEditingArmateur(armateur)}
                  className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-cyan-600 border border-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Modifier</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ArmateursManagement;