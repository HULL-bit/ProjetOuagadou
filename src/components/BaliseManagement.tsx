import React, { useState, useEffect } from 'react';
import { MapPin, Signal, Wifi, AlertTriangle, Edit, Trash2, Plus, Search } from 'lucide-react';

interface Balise {
  id: string;
  name: string;
  type: 'gps' | 'vms' | 'ais' | 'emergency';
  status: 'active' | 'inactive' | 'maintenance' | 'error';
  batteryLevel: number;
  signalStrength: number;
  lastUpdate: string;
  location: [number, number];
  vesselId: string;
  vesselName: string;
  frequency: string;
  power: string;
  notes: string;
}

interface BaliseStats {
  total: number;
  active: number;
  inactive: number;
  maintenance: number;
  error: number;
}

const BaliseManagement: React.FC = () => {
  const [balises, setBalises] = useState<Balise[]>([]);
  const [filteredBalises, setFilteredBalises] = useState<Balise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBalise, setEditingBalise] = useState<Balise | null>(null);
  const [stats, setStats] = useState<BaliseStats>({
    total: 0,
    active: 0,
    inactive: 0,
    maintenance: 0,
    error: 0
  });

  useEffect(() => {
    loadBalises();
  }, []);

  useEffect(() => {
    filterBalises();
    updateStats();
  }, [balises, searchTerm, statusFilter, typeFilter]);

  const loadBalises = async () => {
    // Simulation de chargement des balises
    const mockBalises: Balise[] = [
      {
        id: '1',
        name: 'Balise GPS-001',
        type: 'gps',
        status: 'active',
        batteryLevel: 85,
        signalStrength: 90,
        lastUpdate: new Date().toISOString(),
        location: [14.7167, -17.4677],
        vesselId: 'vessel-1',
        vesselName: 'Pirogue de la Paix',
        frequency: '1575.42 MHz',
        power: '50W',
        notes: 'Balise GPS principale'
      },
      {
        id: '2',
        name: 'Balise VMS-001',
        type: 'vms',
        status: 'active',
        batteryLevel: 72,
        signalStrength: 85,
        lastUpdate: new Date(Date.now() - 300000).toISOString(),
        location: [16.0333, -16.5000],
        vesselId: 'vessel-2',
        vesselName: 'Espoir des Mers',
        frequency: '162.4 MHz',
        power: '25W',
        notes: 'Balise VMS de surveillance'
      },
      {
        id: '3',
        name: 'Balise AIS-001',
        type: 'ais',
        status: 'maintenance',
        batteryLevel: 45,
        signalStrength: 60,
        lastUpdate: new Date(Date.now() - 600000).toISOString(),
        location: [14.7167, -17.4677],
        vesselId: 'vessel-3',
        vesselName: 'Pirogue Commerciale',
        frequency: '161.975 MHz',
        power: '12.5W',
        notes: 'En maintenance - batterie faible'
      }
    ];
    setBalises(mockBalises);
  };

  const filterBalises = () => {
    let filtered = balises;

    if (searchTerm) {
      filtered = filtered.filter(balise =>
        balise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        balise.vesselName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(balise => balise.status === statusFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(balise => balise.type === typeFilter);
    }

    setFilteredBalises(filtered);
  };

  const updateStats = () => {
    const total = balises.length;
    const active = balises.filter(b => b.status === 'active').length;
    const inactive = balises.filter(b => b.status === 'inactive').length;
    const maintenance = balises.filter(b => b.status === 'maintenance').length;
    const error = balises.filter(b => b.status === 'error').length;

    setStats({ total, active, inactive, maintenance, error });
  };

  const handleAddBalise = async (baliseData: Omit<Balise, 'id'>) => {
    const newBalise: Balise = {
      ...baliseData,
      id: Date.now().toString()
    };
    setBalises(prev => [newBalise, ...prev]);
    setShowAddForm(false);
  };

  const handleEditBalise = async (baliseId: string, baliseData: Partial<Balise>) => {
    setBalises(prev => prev.map(balise =>
      balise.id === baliseId ? { ...balise, ...baliseData } : balise
    ));
    setEditingBalise(null);
  };

  const handleDeleteBalise = async (baliseId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette balise ?')) {
      setBalises(prev => prev.filter(balise => balise.id !== baliseId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gps': return <MapPin className="w-4 h-4 text-blue-600" />;
      case 'vms': return <Signal className="w-4 h-4 text-green-600" />;
      case 'ais': return <Wifi className="w-4 h-4 text-purple-600" />;
      case 'emergency': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Signal className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'gps': return 'GPS';
      case 'vms': return 'VMS';
      case 'ais': return 'AIS';
      case 'emergency': return 'Urgence';
      default: return 'Inconnu';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 70) return 'text-green-600';
    if (level > 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSignalColor = (strength: number) => {
    if (strength > 80) return 'text-green-600';
    if (strength > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Balises</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Nouvelle Balise
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Signal className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Signal className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-green-600">Actives</p>
              <p className="text-2xl font-bold text-green-900">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center">
            <Signal className="w-8 h-8 text-gray-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Inactives</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-yellow-600">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.maintenance}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm text-red-600">Erreurs</p>
              <p className="text-2xl font-bold text-red-900">{stats.error}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher une balise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les statuts</option>
          <option value="active">Actives</option>
          <option value="inactive">Inactives</option>
          <option value="maintenance">Maintenance</option>
          <option value="error">Erreurs</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">Tous les types</option>
          <option value="gps">GPS</option>
          <option value="vms">VMS</option>
          <option value="ais">AIS</option>
          <option value="emergency">Urgence</option>
        </select>
      </div>

      {/* Liste des balises */}
      <div className="space-y-4">
        {filteredBalises.map(balise => (
          <div key={balise.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getTypeIcon(balise.type)}
                  <h3 className="text-lg font-semibold text-gray-900">{balise.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(balise.status)}`}>
                    {balise.status === 'active' ? 'Active' : 
                     balise.status === 'inactive' ? 'Inactive' : 
                     balise.status === 'maintenance' ? 'Maintenance' : 'Erreur'}
                  </span>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {getTypeLabel(balise.type)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>
                    <p><strong>Navire:</strong> {balise.vesselName}</p>
                    <p><strong>Fréquence:</strong> {balise.frequency}</p>
                    <p><strong>Puissance:</strong> {balise.power}</p>
                  </div>
                  <div>
                    <p><strong>Batterie:</strong> 
                      <span className={`ml-1 ${getBatteryColor(balise.batteryLevel)}`}>
                        {balise.batteryLevel}%
                      </span>
                    </p>
                    <p><strong>Signal:</strong> 
                      <span className={`ml-1 ${getSignalColor(balise.signalStrength)}`}>
                        {balise.signalStrength}%
                      </span>
                    </p>
                    <p><strong>Dernière mise à jour:</strong> {formatDate(balise.lastUpdate)}</p>
                  </div>
                  <div>
                    <p><strong>Latitude:</strong> {balise.location[0].toFixed(4)}</p>
                    <p><strong>Longitude:</strong> {balise.location[1].toFixed(4)}</p>
                  </div>
                </div>
                {balise.notes && (
                  <p className="mt-2 text-sm text-gray-500 italic">"{balise.notes}"</p>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => setEditingBalise(balise)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteBalise(balise.id)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBalises.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Signal className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Aucune balise trouvée</p>
          <p className="text-sm">Aucune balise ne correspond à vos critères de recherche</p>
        </div>
      )}

      {/* Formulaire d'ajout/édition */}
      {(showAddForm || editingBalise) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingBalise ? 'Modifier la Balise' : 'Nouvelle Balise'}
            </h3>
            
                        <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const baliseData = {
                name: formData.get('name') as string,
                type: formData.get('type') as 'gps' | 'vms' | 'ais' | 'emergency',
                status: formData.get('status') as 'active' | 'inactive' | 'maintenance' | 'error',
                vesselName: formData.get('vesselName') as string,
                frequency: formData.get('frequency') as string,
                power: formData.get('power') as string,
                notes: formData.get('notes') as string
              };

              if (editingBalise) {
                handleEditBalise(editingBalise.id, baliseData);
              } else {
                handleAddBalise({
                  ...baliseData,
                  batteryLevel: 100,
                  signalStrength: 100,
                  lastUpdate: new Date().toISOString(),
                  location: [0, 0],
                  vesselId: 'vessel-1'
                });
              }
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingBalise?.name}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="type"
                    defaultValue={editingBalise?.type || 'gps'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="gps">GPS</option>
                    <option value="vms">VMS</option>
                    <option value="ais">AIS</option>
                    <option value="emergency">Urgence</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <select
                    name="status"
                    defaultValue={editingBalise?.status || 'active'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="error">Erreur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom du navire</label>
                  <input
                    type="text"
                    name="vesselName"
                    defaultValue={editingBalise?.vesselName}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
                  <input
                    type="text"
                    name="frequency"
                    defaultValue={editingBalise?.frequency}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Puissance</label>
                  <input
                    type="text"
                    name="power"
                    defaultValue={editingBalise?.power}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  name="notes"
                  defaultValue={editingBalise?.notes}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingBalise(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingBalise ? 'Modifier' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaliseManagement;
