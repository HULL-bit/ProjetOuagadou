import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Activity, Clock, Speed, Compass, Satellite, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import MapView from './MapView';

interface GPSDevice {
  id: string;
  deviceId: string;
  name: string;
  userId: string;
  userName: string;
  status: 'online' | 'offline' | 'low_battery';
  batteryLevel: number;
  lastUpdate: string;
  accuracy: number;
  speed: number;
  heading: number;
}

const GPSTracking: React.FC = () => {
  const { user } = useAuth();
  const { locations, users } = useData();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [trackingMode, setTrackingMode] = useState<'realtime' | 'history'>('realtime');
  const [isTracking, setIsTracking] = useState(false);

  const [gpsDevices, setGpsDevices] = useState<GPSDevice[]>([
    {
      id: '1',
      deviceId: 'GPS-CAY-001',
      name: 'Tracker Ndakaaru',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      userName: 'Amadou Diallo',
      status: 'online',
      batteryLevel: 85,
      lastUpdate: new Date().toISOString(),
      accuracy: 3.2,
      speed: 12.5,
      heading: 45
    },
    {
      id: '2',
      deviceId: 'GPS-CAY-002',
      name: 'Tracker Teranga',
      userId: '550e8400-e29b-41d4-a716-446655440002',
      userName: 'Fatou Sow',
      status: 'online',
      batteryLevel: 67,
      lastUpdate: new Date(Date.now() - 120000).toISOString(),
      accuracy: 2.8,
      speed: 8.3,
      heading: 120
    },
    {
      id: '3',
      deviceId: 'GPS-CAY-003',
      name: 'Tracker Baobab',
      userId: '550e8400-e29b-41d4-a716-446655440003',
      userName: 'Ibrahima Fall',
      status: 'low_battery',
      batteryLevel: 15,
      lastUpdate: new Date(Date.now() - 600000).toISOString(),
      accuracy: 5.1,
      speed: 0,
      heading: 0
    }
  ]);

  // Simuler les mises à jour GPS en temps réel
  useEffect(() => {
    if (isTracking) {
      const interval = setInterval(() => {
        setGpsDevices(prev => prev.map(device => ({
          ...device,
          batteryLevel: Math.max(0, device.batteryLevel - Math.random() * 0.5),
          lastUpdate: new Date().toISOString(),
          speed: device.status === 'online' ? 5 + Math.random() * 15 : 0,
          heading: device.status === 'online' ? (device.heading + (Math.random() - 0.5) * 20) % 360 : device.heading,
          accuracy: 2 + Math.random() * 3
        })));
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [isTracking]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800';
      case 'offline': return 'bg-red-100 text-red-800';
      case 'low_battery': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return 'text-green-600';
    if (level > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy < 3) return 'text-green-600';
    if (accuracy < 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">GPS Tracking</h1>
        <p className="text-gray-600">Suivi GPS en temps réel des pirogues et dispositifs</p>
      </div>

      {/* Contrôles de tracking */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setTrackingMode('realtime')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  trackingMode === 'realtime'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Temps Réel
              </button>
              <button
                onClick={() => setTrackingMode('history')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  trackingMode === 'history'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Historique
              </button>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isTracking ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {isTracking ? 'Tracking actif' : 'Tracking arrêté'}
              </span>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsTracking(!isTracking)}
            className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
              isTracking
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-700 hover:to-blue-700'
            }`}
          >
            <RefreshCw className={`w-5 h-5 ${isTracking ? 'animate-spin' : ''}`} />
            <span>{isTracking ? 'Arrêter' : 'Démarrer'} le tracking</span>
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Carte GPS */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Satellite className="w-5 h-5 mr-2 text-cyan-600" />
                Carte GPS - Suivi en Temps Réel
              </h3>
            </div>
            <div className="h-[500px]">
              <MapView className="h-full" />
            </div>
          </div>
        </div>

        {/* Liste des dispositifs GPS */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Navigation className="w-5 h-5 mr-2 text-cyan-600" />
              Dispositifs GPS
            </h3>
            
            <div className="space-y-3">
              {gpsDevices.map((device, index) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedDevice === device.id
                      ? 'border-cyan-500 bg-cyan-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedDevice(device.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{device.name}</h4>
                      <p className="text-sm text-gray-600">{device.userName}</p>
                      <p className="text-xs text-gray-500">{device.deviceId}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                      {device.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Battery className={`w-3 h-3 mr-1 ${getBatteryColor(device.batteryLevel)}`} />
                        Batterie:
                      </span>
                      <span className={`font-medium ${getBatteryColor(device.batteryLevel)}`}>
                        {Math.round(device.batteryLevel)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Speed className="w-3 h-3 mr-1" />
                        Vitesse:
                      </span>
                      <span className="font-medium">{device.speed.toFixed(1)} kt</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <Compass className="w-3 h-3 mr-1" />
                        Cap:
                      </span>
                      <span className="font-medium">{Math.round(device.heading)}°</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 flex items-center">
                        <MapPin className={`w-3 h-3 mr-1 ${getAccuracyColor(device.accuracy)}`} />
                        Précision:
                      </span>
                      <span className={`font-medium ${getAccuracyColor(device.accuracy)}`}>
                        ±{device.accuracy.toFixed(1)}m
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-gray-600 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Dernière mise à jour:
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(device.lastUpdate).toLocaleString('fr-FR')}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Statistiques GPS */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques GPS</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dispositifs en ligne:</span>
                <span className="font-bold text-green-600">
                  {gpsDevices.filter(d => d.status === 'online').length}/{gpsDevices.length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Précision moyenne:</span>
                <span className="font-bold text-blue-600">
                  ±{(gpsDevices.reduce((sum, d) => sum + d.accuracy, 0) / gpsDevices.length).toFixed(1)}m
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Vitesse moyenne:</span>
                <span className="font-bold text-purple-600">
                  {(gpsDevices.reduce((sum, d) => sum + d.speed, 0) / gpsDevices.length).toFixed(1)} kt
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Batterie moyenne:</span>
                <span className="font-bold text-yellow-600">
                  {Math.round(gpsDevices.reduce((sum, d) => sum + d.batteryLevel, 0) / gpsDevices.length)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GPSTracking;