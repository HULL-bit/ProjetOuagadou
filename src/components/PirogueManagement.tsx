import React, { useState } from 'react';
import { Ship, Plus, Edit, Trash2, Search, MapPin, Activity, Anchor, User, Phone, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface Pirogue {
  id: string;
  name: string;
  registrationNumber: string;
  ownerId: string;
  ownerName: string;
  length: number;
  capacity: number;
  enginePower: number;
  gpsDeviceId?: string;
  isActive: boolean;
  lastMaintenance?: string;
  nextMaintenance?: string;
  status: 'active' | 'maintenance' | 'inactive';
}

const PirogueManagement: React.FC = () => {
  const { user } = useAuth();
  const { users, locations } = useData();
  const [pirogues, setPirogues] = useState<Pirogue[]>([
    {
      id: '1',
      name: 'Ndakaaru',
      registrationNumber: 'SN-CAY-001',
      ownerId: '550e8400-e29b-41d4-a716-446655440001',
      ownerName: 'Amadou Diallo',
      length: 12.5,
      capacity: 8,
      enginePower: 40,
      gpsDeviceId: 'GPS-001',
      isActive: true,
      lastMaintenance: '2024-12-01',
      nextMaintenance: '2025-03-01',
      status: 'active'
    },
    {
      id: '2',
      name: 'Teranga',
      registrationNumber: 'SN-CAY-002',
      ownerId: '550e8400-e29b-41d4-a716-446655440002',
      ownerName: 'Fatou Sow',
      length: 10.0,
      capacity: 6,
      enginePower: 25,
      isActive: true,
      status: 'active'
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPirogue, setEditingPirogue] = useState<Pirogue | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newPirogue, setNewPirogue] = useState<Partial<Pirogue>>({
    name: '',
    registrationNumber: '',
    ownerId: '',
    length: 0,
    capacity: 0,
    enginePower: 0,
    status: 'active'
  });

  const filteredPirogues = pirogues.filter(pirogue =>
    pirogue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pirogue.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pirogue.ownerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPirogue = (e: React.FormEvent) => {
    e.preventDefault();
    const owner = users.find(u => u.id === newPirogue.ownerId);
    if (!owner) return;

    const pirogue: Pirogue = {
      id: Date.now().toString(),
      name: newPirogue.name!,
      registrationNumber: newPirogue.registrationNumber!,
      ownerId: newPirogue.ownerId!,
      ownerName: owner.profile.fullName,
      length: newPirogue.length!,
      capacity: newPirogue.capacity!,
      enginePower: newPirogue.enginePower!,
      isActive: true,
      status: 'active'
    };

    setPirogues(prev => [...prev, pirogue]);
    setNewPirogue({
      name: '',
      registrationNumber: '',
      ownerId: '',
      length: 0,
      capacity: 0,
      enginePower: 0,
      status: 'active'
    });
    setShowAddForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'maintenance': return 'Maintenance';
      case 'inactive': return 'Inactive';
      default: return status;
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Pirogues</h1>
        <p className="text-gray-600">Gérer la flotte de pirogues et leurs informations</p>
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
              <p className="text-sm font-medium text-gray-600">Total Pirogues</p>
              <p className="text-2xl font-bold text-gray-900">{pirogues.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Ship className="w-6 h-6 text-blue-600" />
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
                {pirogues.filter(p => p.status === 'active').length}
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
              <p className="text-sm font-medium text-gray-600">En Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pirogues.filter(p => p.status === 'maintenance').length}
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
              <p className="text-sm font-medium text-gray-600">Capacité Totale</p>
              <p className="text-2xl font-bold text-purple-600">
                {pirogues.reduce((sum, p) => sum + p.capacity, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
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
              placeholder="Rechercher une pirogue..."
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
            <span>Ajouter une pirogue</span>
          </motion.button>
        </div>
      </div>

      {/* Liste des pirogues */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pirogue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Propriétaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spécifications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPirogues.map((pirogue, index) => (
                <motion.tr
                  key={pirogue.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <Ship className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{pirogue.name}</div>
                        <div className="text-sm text-gray-500">{pirogue.registrationNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="text-sm text-gray-900">{pirogue.ownerName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div>Longueur: {pirogue.length}m</div>
                      <div>Capacité: {pirogue.capacity} pers.</div>
                      <div>Moteur: {pirogue.enginePower} CV</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(pirogue.status)}`}>
                      {getStatusLabel(pirogue.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingPirogue(pirogue)}
                        className="text-cyan-600 hover:text-cyan-900 p-1 rounded hover:bg-cyan-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setPirogues(prev => prev.filter(p => p.id !== pirogue.id))}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter une pirogue</h3>
                
                <form onSubmit={handleAddPirogue} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de la pirogue *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPirogue.name}
                      onChange={(e) => setNewPirogue({...newPirogue, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Ex: Ndakaaru"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numéro d'immatriculation *
                    </label>
                    <input
                      type="text"
                      required
                      value={newPirogue.registrationNumber}
                      onChange={(e) => setNewPirogue({...newPirogue, registrationNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Ex: SN-CAY-003"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Propriétaire *
                    </label>
                    <select
                      required
                      value={newPirogue.ownerId}
                      onChange={(e) => setNewPirogue({...newPirogue, ownerId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Sélectionner un propriétaire</option>
                      {users.filter(u => u.role === 'fisherman').map(u => (
                        <option key={u.id} value={u.id}>{u.profile.fullName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longueur (m)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newPirogue.length}
                        onChange={(e) => setNewPirogue({...newPirogue, length: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacité (pers.)
                      </label>
                      <input
                        type="number"
                        value={newPirogue.capacity}
                        onChange={(e) => setNewPirogue({...newPirogue, capacity: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Puissance moteur (CV)
                    </label>
                    <input
                      type="number"
                      value={newPirogue.enginePower}
                      onChange={(e) => setNewPirogue({...newPirogue, enginePower: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700"
                    >
                      Ajouter
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PirogueManagement;