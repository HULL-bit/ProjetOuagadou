import React, { useState, useEffect } from 'react';
import { 
  Ship, 
  Plus, 
  Edit, 
  Search, 
  MapPin, 
  Activity, 
  Battery, 
  Signal, 
  Calendar,
  Eye,
  Trash2,
  Settings,
  Navigation,
  Anchor,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Filter,
  Download,
  Upload,
  Info,
  Compass,
  Wind,
  Waves,
  Thermometer,
  Clock,
  Star,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import MarineMap from './MarineMap';

interface Pirogue {
  id: string;
  name: string;
  armateurId: string;
  armateurName: string;
  status: 'active' | 'maintenance' | 'retired' | 'docked';
  deviceId?: string;
  lastTrip?: string;
  totalCatch?: number;
  totalTrips?: number;
  captain?: string;
  crew?: string[];
  capacity?: number;
  length?: number;
  width?: number;
  engine?: string;
  fuelCapacity?: number;
  currentFuel?: number;
  lastMaintenance?: string;
  nextMaintenance?: string;
  insuranceExpiry?: string;
  registrationNumber?: string;
  location?: {
    latitude: number;
    longitude: number;
    timestamp: string;
    speed?: number;
    heading?: number;
    altitude?: number;
  };
  weather?: {
    temperature: number;
    windSpeed: number;
    windDirection: number;
    waveHeight: number;
    visibility: number;
  };
  performance?: {
    avgSpeed: number;
    maxSpeed: number;
    efficiency: number;
    safetyScore: number;
  };
}

interface PirogueStats {
  total: number;
  active: number;
  maintenance: number;
  docked: number;
  retired: number;
  totalCatch: number;
  totalTrips: number;
  avgEfficiency: number;
}

const PirogueManagement: React.FC = () => {
  const { user } = useAuth();
  const { pirogues, updatePirogue } = useData();
  const [piroguesData, setPiroguesData] = useState<Pirogue[]>([]);
  const [filteredPirogues, setFilteredPirogues] = useState<Pirogue[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterArmateur, setFilterArmateur] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPirogue, setEditingPirogue] = useState<Pirogue | null>(null);
  const [selectedPirogue, setSelectedPirogue] = useState<Pirogue | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [pirogueStats, setPirogueStats] = useState<PirogueStats>({
    total: 0,
    active: 0,
    maintenance: 0,
    docked: 0,
    retired: 0,
    totalCatch: 0,
    totalTrips: 0,
    avgEfficiency: 0
  });

  useEffect(() => {
    loadPiroguesData();
  }, []);

  useEffect(() => {
    filterPirogues();
    updateStats();
  }, [piroguesData, searchTerm, filterStatus, filterArmateur]);

  const loadPiroguesData = () => {
    // Données enrichies des pirogues avec localisation et météo
    const enrichedPirogues: Pirogue[] = [
      {
        id: '1',
        name: 'Pirogue Diop 1',
        armateurId: '1',
        armateurName: 'Armement Diop & Fils',
        status: 'active',
        deviceId: '000019246001',
        lastTrip: '2024-09-01T08:00:00',
        totalCatch: 450,
        totalTrips: 45,
        captain: 'Moussa Diop',
        crew: ['Awa Ndiaye', 'Ibrahima Sall'],
        capacity: 8,
        length: 12,
        width: 3,
        engine: 'Yamaha 40HP',
        fuelCapacity: 200,
        currentFuel: 85,
        lastMaintenance: '2024-08-15',
        nextMaintenance: '2024-11-15',
        insuranceExpiry: '2025-06-30',
        registrationNumber: 'SN-PIR-001',
        location: {
          latitude: 14.741551,
          longitude: -17.421184,
          timestamp: '2024-09-01T13:30:00',
          speed: 12.5,
          heading: 45,
          altitude: 0
        },
        weather: {
          temperature: 28,
          windSpeed: 12,
          windDirection: 45,
          waveHeight: 0.5,
          visibility: 10
        },
        performance: {
          avgSpeed: 15.2,
          maxSpeed: 25.0,
          efficiency: 85,
          safetyScore: 92
        }
      },
      {
        id: '2',
        name: 'Pirogue Diop 2',
        armateurId: '1',
        armateurName: 'Armement Diop & Fils',
        status: 'active',
        deviceId: '000019246002',
        lastTrip: '2024-08-30T06:30:00',
        totalCatch: 380,
        totalTrips: 38,
        captain: 'Awa Ndiaye',
        crew: ['Moussa Ba', 'Fatou Diallo'],
        capacity: 6,
        length: 10,
        width: 2.5,
        engine: 'Honda 30HP',
        fuelCapacity: 150,
        currentFuel: 120,
        lastMaintenance: '2024-08-20',
        nextMaintenance: '2024-11-20',
        insuranceExpiry: '2025-05-15',
        registrationNumber: 'SN-PIR-002',
        location: {
          latitude: 14.897359,
          longitude: -17.292868,
          timestamp: '2024-09-01T13:25:00',
          speed: 8.2,
          heading: 180,
          altitude: 0
        },
        weather: {
          temperature: 26,
          windSpeed: 8,
          windDirection: 180,
          waveHeight: 0.3,
          visibility: 12
        },
        performance: {
          avgSpeed: 12.8,
          maxSpeed: 20.0,
          efficiency: 78,
          safetyScore: 88
        }
      },
      {
        id: '3',
        name: 'Pirogue Diop 3',
        armateurId: '1',
        armateurName: 'Armement Diop & Fils',
        status: 'maintenance',
        lastTrip: '2024-08-25T07:00:00',
        totalCatch: 420,
        totalTrips: 42,
        captain: 'Ibrahima Sall',
        crew: ['Mariama Diop', 'Ousmane Ba'],
        capacity: 7,
        length: 11,
        width: 2.8,
        engine: 'Yamaha 35HP',
        fuelCapacity: 180,
        currentFuel: 0,
        lastMaintenance: '2024-09-01',
        nextMaintenance: '2024-12-01',
        insuranceExpiry: '2025-07-20',
        registrationNumber: 'SN-PIR-003',
        location: {
          latitude: 14.7167,
          longitude: -17.4677,
          timestamp: '2024-09-01T13:00:00',
          speed: 0,
          heading: 0,
          altitude: 0
        },
        performance: {
          avgSpeed: 14.5,
          maxSpeed: 22.0,
          efficiency: 82,
          safetyScore: 90
        }
      },
      {
        id: '4',
        name: 'Pirogue Ndiaye 1',
        armateurId: '2',
        armateurName: 'GIE Femmes Pêcheuses Cayar',
        status: 'active',
        deviceId: '000019246004',
        lastTrip: '2024-09-01T06:00:00',
        totalCatch: 320,
        totalTrips: 32,
        captain: 'Fatou Ndiaye',
        crew: ['Aissatou Diallo', 'Mariama Ba'],
        capacity: 5,
        length: 9,
        width: 2.2,
        engine: 'Honda 25HP',
        fuelCapacity: 120,
        currentFuel: 95,
        lastMaintenance: '2024-08-10',
        nextMaintenance: '2024-11-10',
        insuranceExpiry: '2025-03-15',
        registrationNumber: 'SN-PIR-004',
        location: {
          latitude: 14.729613,
          longitude: -17.478385,
          timestamp: '2024-09-01T13:20:00',
          speed: 15.8,
          heading: 90,
          altitude: 0
        },
        weather: {
          temperature: 27,
          windSpeed: 10,
          windDirection: 90,
          waveHeight: 0.4,
          visibility: 11
        },
        performance: {
          avgSpeed: 13.2,
          maxSpeed: 18.0,
          efficiency: 75,
          safetyScore: 85
        }
      },
      {
        id: '5',
        name: 'Pirogue Ndiaye 2',
        armateurId: '2',
        armateurName: 'GIE Femmes Pêcheuses Cayar',
        status: 'active',
        deviceId: '000019246005',
        lastTrip: '2024-08-31T05:30:00',
        totalCatch: 570,
        totalTrips: 57,
        captain: 'Aissatou Ndiaye',
        crew: ['Fatou Ba', 'Mariama Diallo'],
        capacity: 6,
        length: 10,
        width: 2.5,
        engine: 'Yamaha 30HP',
        fuelCapacity: 140,
        currentFuel: 110,
        lastMaintenance: '2024-08-05',
        nextMaintenance: '2024-11-05',
        insuranceExpiry: '2025-04-20',
        registrationNumber: 'SN-PIR-005',
        location: {
          latitude: 14.901550,
          longitude: -17.210240,
          timestamp: '2024-09-01T13:15:00',
          speed: 18.5,
          heading: 135,
          altitude: 0
        },
        weather: {
          temperature: 29,
          windSpeed: 15,
          windDirection: 135,
          waveHeight: 0.7,
          visibility: 8
        },
        performance: {
          avgSpeed: 16.8,
          maxSpeed: 23.0,
          efficiency: 88,
          safetyScore: 94
        }
      }
    ];
    
    setPiroguesData(enrichedPirogues);
  };

  const filterPirogues = () => {
    let filtered = piroguesData.filter(pirogue => {
      const matchesSearch = pirogue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pirogue.captain?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           pirogue.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || pirogue.status === filterStatus;
      const matchesArmateur = filterArmateur === 'all' || pirogue.armateurId === filterArmateur;
      return matchesSearch && matchesStatus && matchesArmateur;
    });
    setFilteredPirogues(filtered);
  };

  const updateStats = () => {
    const total = piroguesData.length;
    const active = piroguesData.filter(p => p.status === 'active').length;
    const maintenance = piroguesData.filter(p => p.status === 'maintenance').length;
    const docked = piroguesData.filter(p => p.status === 'docked').length;
    const retired = piroguesData.filter(p => p.status === 'retired').length;
    const totalCatch = piroguesData.reduce((sum, p) => sum + (p.totalCatch || 0), 0);
    const totalTrips = piroguesData.reduce((sum, p) => sum + (p.totalTrips || 0), 0);
    const avgEfficiency = piroguesData.length > 0 ? 
      piroguesData.reduce((sum, p) => sum + (p.performance?.efficiency || 0), 0) / piroguesData.length : 0;

    setPirogueStats({
      total,
      active,
      maintenance,
      docked,
      retired,
      totalCatch,
      totalTrips,
      avgEfficiency
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'docked': return 'bg-blue-100 text-blue-800';
      case 'retired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'maintenance': return <Settings className="w-4 h-4" />;
      case 'docked': return <Anchor className="w-4 h-4" />;
      case 'retired': return <XCircle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatSpeed = (speed?: number) => {
    if (!speed) return 'N/A';
    return `${speed.toFixed(1)} km/h`;
  };

  const formatHeading = (heading?: number) => {
    if (!heading) return 'N/A';
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return `${heading.toFixed(0)}° ${directions[index]}`;
  };

  const getUniqueArmateurs = () => {
    const armateurs = piroguesData.map(p => ({ id: p.armateurId, name: p.armateurName }));
    return armateurs.filter((a, index, self) => 
      index === self.findIndex(t => t.id === a.id)
    );
  };

  // Transformer les données pour la carte marine
  const getMapData = () => {
    return piroguesData
      .filter(p => p.location && p.status === 'active')
      .map(p => ({
        id: p.id,
        deviceId: p.deviceId || p.id,
        deviceType: 'gps_tracker' as const,
        userId: p.armateurId,
        isActive: p.status === 'active',
        batteryLevel: 85, // Simulation
        signalStrength: 4, // Simulation
        status: p.status === 'active' ? 'En ligne' : 'Hors ligne',
        lastCommunication: p.location?.timestamp || new Date().toISOString(),
        imei: p.deviceId,
        phoneNumber: p.captain
      }));
  };

  const getMapLocations = () => {
    return piroguesData
      .filter(p => p.location)
      .map(p => ({
        id: p.id,
        userId: p.armateurId,
        latitude: p.location!.latitude,
        longitude: p.location!.longitude,
        timestamp: p.location!.timestamp,
        speed: p.location!.speed,
        heading: p.location!.heading,
        altitude: p.location!.altitude,
        accuracy: 10
      }));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Gestion des Pirogues</h1>
        <p className="text-gray-600">Surveillance et gestion de la flotte de pirogues</p>
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
              <p className="text-2xl font-bold text-gray-900">{pirogueStats.total}</p>
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
              <p className="text-sm font-medium text-gray-600">En Mer</p>
              <p className="text-2xl font-bold text-green-600">{pirogueStats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Navigation className="w-6 h-6 text-green-600" />
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
              <p className="text-sm font-medium text-gray-600">Total Prises</p>
              <p className="text-2xl font-bold text-purple-600">{pirogueStats.totalCatch} kg</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
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
              <p className="text-sm font-medium text-gray-600">Efficacité Moy.</p>
              <p className="text-2xl font-bold text-orange-600">{pirogueStats.avgEfficiency.toFixed(0)}%</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une pirogue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">En mer</option>
            <option value="maintenance">Maintenance</option>
            <option value="docked">À quai</option>
            <option value="retired">Retirée</option>
          </select>
          
          <select
            value={filterArmateur}
            onChange={(e) => setFilterArmateur(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les armateurs</option>
            {getUniqueArmateurs().map(armateur => (
              <option key={armateur.id} value={armateur.id}>{armateur.name}</option>
            ))}
          </select>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Ship className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('map')}
              className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <MapPin className="w-4 h-4" />
            </motion.button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddForm(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter Pirogue</span>
          </motion.button>
        </div>
      </div>

      {/* Vue Carte */}
      {viewMode === 'map' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Carte des Pirogues Actives</h3>
              </div>
              <span className="text-sm text-gray-600">
                {piroguesData.filter(p => p.status === 'active' && p.location).length} pirogues en mer
              </span>
            </div>
          </div>
          
          <div className="h-96">
            <MarineMap
              devices={getMapData()}
              locations={getMapLocations()}
              selectedDevice={null}
              onDeviceSelect={() => {}}
              isFullscreen={false}
            />
          </div>
        </div>
      )}

      {/* Liste des pirogues */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPirogues.map((pirogue, index) => (
            <motion.div
              key={pirogue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Ship className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{pirogue.name}</h3>
                        <p className="text-sm text-gray-600">{pirogue.armateurName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(pirogue.status)} flex items-center space-x-1`}>
                        {getStatusIcon(pirogue.status)}
                        <span>
                          {pirogue.status === 'active' ? 'En mer' : 
                           pirogue.status === 'maintenance' ? 'Maintenance' : 
                           pirogue.status === 'docked' ? 'À quai' : 'Retirée'}
                        </span>
                      </span>
                      {pirogue.deviceId && (
                        <span className="text-xs text-gray-500">GPS: {pirogue.deviceId}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedPirogue(pirogue);
                        setShowDetails(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setEditingPirogue(pirogue)}
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette pirogue ?')) {
                          setPiroguesData(piroguesData.filter(p => p.id !== pirogue.id));
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>Capitaine: {pirogue.captain}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>Dernière sortie: {pirogue.lastTrip ? formatDate(pirogue.lastTrip) : 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-gray-400" />
                    <span>Total prises: {pirogue.totalCatch || 0} kg</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Navigation className="w-4 h-4 text-gray-400" />
                    <span>Total sorties: {pirogue.totalTrips || 0}</span>
                  </div>
                </div>
                
                {pirogue.location && pirogue.status === 'active' && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">Position actuelle</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Vitesse: {formatSpeed(pirogue.location.speed)}</div>
                      <div>Cap: {formatHeading(pirogue.location.heading)}</div>
                      <div>Lat: {pirogue.location.latitude.toFixed(6)}</div>
                      <div>Lon: {pirogue.location.longitude.toFixed(6)}</div>
                    </div>
                  </div>
                )}
                
                {pirogue.weather && pirogue.status === 'active' && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Thermometer className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium">Conditions météo</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>Temp: {pirogue.weather.temperature}°C</div>
                      <div>Vent: {pirogue.weather.windSpeed} km/h</div>
                      <div>Vagues: {pirogue.weather.waveHeight}m</div>
                      <div>Visibilité: {pirogue.weather.visibility}km</div>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Immatriculation: {pirogue.registrationNumber}</span>
                  <span>Efficacité: {pirogue.performance?.efficiency || 0}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {filteredPirogues.length === 0 && (
        <div className="text-center py-12">
          <Ship className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune pirogue trouvée</h3>
          <p className="text-gray-600">Aucune pirogue ne correspond à vos critères de recherche</p>
        </div>
      )}

      {/* Modal de détails */}
      <AnimatePresence>
        {showDetails && selectedPirogue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Détails de la Pirogue</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Informations Générales</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nom</label>
                        <p className="text-gray-900">{selectedPirogue.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Armateur</label>
                        <p className="text-gray-900">{selectedPirogue.armateurName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Capitaine</label>
                        <p className="text-gray-900">{selectedPirogue.captain || 'Non assigné'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Immatriculation</label>
                        <p className="text-gray-900">{selectedPirogue.registrationNumber}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Statistiques</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total prises:</span>
                        <span className="font-medium">{selectedPirogue.totalCatch || 0} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total sorties:</span>
                        <span className="font-medium">{selectedPirogue.totalTrips || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Efficacité:</span>
                        <span className="font-medium">{selectedPirogue.performance?.efficiency || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Score sécurité:</span>
                        <span className="font-medium">{selectedPirogue.performance?.safetyScore || 0}/100</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {selectedPirogue.location && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Position Actuelle</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-900">Coordonnées</div>
                        <div className="text-sm text-blue-600">
                          {selectedPirogue.location.latitude.toFixed(6)}, {selectedPirogue.location.longitude.toFixed(6)}
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium text-green-900">Vitesse</div>
                        <div className="text-sm text-green-600">{formatSpeed(selectedPirogue.location.speed)}</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm font-medium text-purple-900">Cap</div>
                        <div className="text-sm text-purple-600">{formatHeading(selectedPirogue.location.heading)}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {selectedPirogue.weather && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">Conditions Météo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <div className="text-sm font-medium text-orange-900">Température</div>
                        <div className="text-sm text-orange-600">{selectedPirogue.weather.temperature}°C</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="text-sm font-medium text-blue-900">Vent</div>
                        <div className="text-sm text-blue-600">{selectedPirogue.weather.windSpeed} km/h</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-sm font-medium text-green-900">Vagues</div>
                        <div className="text-sm text-green-600">{selectedPirogue.weather.waveHeight}m</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="text-sm font-medium text-purple-900">Visibilité</div>
                        <div className="text-sm text-purple-600">{selectedPirogue.weather.visibility}km</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Formulaire d'ajout de pirogue */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-gray-900">Nouvelle Pirogue</h3>
              </div>
              
              <div className="p-6">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const pirogueData = {
                    id: Date.now().toString(),
                    name: formData.get('name') as string,
                    armateurId: formData.get('armateurId') as string,
                    armateurName: getUniqueArmateurs().find(a => a.id === formData.get('armateurId'))?.name || '',
                    captain: formData.get('captain') as string,
                    registrationNumber: formData.get('registrationNumber') as string,
                    capacity: parseInt(formData.get('capacity') as string),
                    length: parseFloat(formData.get('length') as string),
                    width: parseFloat(formData.get('width') as string),
                    engine: formData.get('engine') as string,
                    status: 'docked' as const,
                    totalCatch: 0,
                    totalTrips: 0,
                    crew: [],
                    fuelCapacity: parseInt(formData.get('fuelCapacity') as string),
                    currentFuel: parseInt(formData.get('fuelCapacity') as string),
                    lastMaintenance: new Date().toISOString().split('T')[0],
                    nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    insuranceExpiry: formData.get('insuranceExpiry') as string,
                    performance: {
                      avgSpeed: 0,
                      maxSpeed: 0,
                      efficiency: 100,
                      safetyScore: 100
                    }
                  };
                  
                  const updatedPirogues = [pirogueData, ...piroguesData];
                  setPiroguesData(updatedPirogues);
                  setShowAddForm(false);
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la pirogue</label>
                      <input
                        type="text"
                        name="name"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Armateur</label>
                      <select
                        name="armateurId"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner un armateur</option>
                        {getUniqueArmateurs().map(armateur => (
                          <option key={armateur.id} value={armateur.id}>{armateur.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capitaine</label>
                      <input
                        type="text"
                        name="captain"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Immatriculation</label>
                      <input
                        type="text"
                        name="registrationNumber"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacité (personnes)</label>
                      <input
                        type="number"
                        name="capacity"
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Longueur (m)</label>
                      <input
                        type="number"
                        name="length"
                        required
                        min="1"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Largeur (m)</label>
                      <input
                        type="number"
                        name="width"
                        required
                        min="1"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Moteur</label>
                      <input
                        type="text"
                        name="engine"
                        required
                        placeholder="Ex: Yamaha 40HP"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Capacité carburant (L)</label>
                      <input
                        type="number"
                        name="fuelCapacity"
                        required
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiration assurance</label>
                      <input
                        type="date"
                        name="insuranceExpiry"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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