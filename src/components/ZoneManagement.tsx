import React, { useState } from 'react';
import { Shield, Plus, Edit, Trash2, MapPin, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

interface NewZone {
  name: string;
  description: string;
  type: 'safety' | 'fishing' | 'restricted' | 'navigation';
  coordinates: [number, number][];
}

const ZoneManagement: React.FC = () => {
  const { user } = useAuth();
  const { zones, addZone, deleteZone } = useData();
  const [showAddForm, setShowAddForm] = useState(false);

  const [newZone, setNewZone] = useState<NewZone>({
    name: '',
    description: '',
    type: 'safety',
    coordinates: []
  });

  const handleAddZone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addZone(newZone);
      setNewZone({
        name: '',
        description: '',
        type: 'safety',
        coordinates: []
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la zone:', error);
    }
  };

  const getZoneTypeLabel = (type: string) => {
    switch (type) {
      case 'safety': return 'Sécurité';
      case 'fishing': return 'Pêche';
      case 'restricted': return 'Restreinte';
      case 'navigation': return 'Navigation';
      default: return type;
    }
  };

  const getZoneTypeColor = (type: string) => {
    switch (type) {
      case 'safety': return 'bg-green-100 text-green-800';
      case 'fishing': return 'bg-blue-100 text-blue-800';
      case 'restricted': return 'bg-red-100 text-red-800';
      case 'navigation': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'organization') {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Accès Restreint</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour gérer les zones.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Zones</h1>
        <p className="text-gray-600">Gérer les zones de sécurité, pêche et navigation</p>
      </div>

      {/* Header avec actions */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Zones Actives</h3>
            <p className="text-sm text-gray-600">{zones.length} zones configurées</p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter une zone</span>
          </motion.button>
        </div>
      </div>

      {/* Statistiques des zones */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {['safety', 'fishing', 'restricted', 'navigation'].map((type) => {
          const count = zones.filter(z => z.type === type).length;
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{getZoneTypeLabel(type)}</p>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  type === 'safety' ? 'bg-green-100' :
                  type === 'fishing' ? 'bg-blue-100' :
                  type === 'restricted' ? 'bg-red-100' : 'bg-purple-100'
                }`}>
                  <Shield className={`w-6 h-6 ${
                    type === 'safety' ? 'text-green-600' :
                    type === 'fishing' ? 'text-blue-600' :
                    type === 'restricted' ? 'text-red-600' : 'text-purple-600'
                  }`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Liste des zones */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Zones Configurées</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
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
              {zones.map((zone, index) => (
                <motion.tr
                  key={zone.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{zone.name}</div>
                        <div className="text-sm text-gray-500">
                          {zone.coordinates.length} points
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getZoneTypeColor(zone.type)}`}>
                      {getZoneTypeLabel(zone.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {zone.description || 'Aucune description'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      zone.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {zone.isActive ? (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingZone(zone)}
                        className="text-cyan-600 hover:text-cyan-900 p-1 rounded hover:bg-cyan-50"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => deleteZone(zone.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal d'ajout de zone */}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ajouter une zone</h3>
                
                <form onSubmit={handleAddZone} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom de la zone *
                    </label>
                    <input
                      type="text"
                      required
                      value={newZone.name}
                      onChange={(e) => setNewZone({...newZone, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Ex: Zone de sécurité principale"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type de zone *
                    </label>
                    <select
                      required
                      value={newZone.type}
                      onChange={(e) => setNewZone({...newZone, type: e.target.value as 'safety' | 'fishing' | 'restricted' | 'navigation'})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="safety">Zone de sécurité</option>
                      <option value="fishing">Zone de pêche</option>
                      <option value="restricted">Zone restreinte</option>
                      <option value="navigation">Zone de navigation</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newZone.description}
                      onChange={(e) => setNewZone({...newZone, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Description de la zone..."
                    />
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Les coordonnées de la zone seront définies sur la carte après création.
                    </p>
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
                      Créer la zone
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

export default ZoneManagement;