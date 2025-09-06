import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Compass, Wind, Waves, Anchor, MapPin, Clock, Speech as Speed, Battery, Signal, Ship, Info, ChevronLeft, ChevronRight, Settings, Layers, Search, Filter, Eye, EyeOff, RefreshCw, Maximize, Minimize, Globe, Satellite, Map } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Location, TrackerDevice } from '../types';

// Correction des icônes Leaflet
// Correction des icônes Leaflet
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Icône personnalisée pour les bateaux
const boatIcon = L.divIcon({
  className: 'custom-boat-icon',
  html: `
    <div style="
      width: 30px; 
      height: 30px; 
      background: linear-gradient(45deg, #1e40af, #3b82f6);
      border: 2px solid white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      position: relative;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
        <path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v2H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19zM6 6h12v3.97L12 8 6 9.97V6z"/>
      </svg>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

interface MarineMapProps {
  devices: TrackerDevice[];
  locations: Location[];
  selectedDevice: TrackerDevice | null;
  onDeviceSelect: (device: TrackerDevice) => void;
  isFullscreen?: boolean;
}

// Composant pour centrer la carte sur un dispositif
const MapController: React.FC<{ selectedDevice: TrackerDevice | null; locations: Location[] }> = ({ 
  selectedDevice, 
  locations 
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedDevice) {
      const deviceLocations = locations.filter(loc => loc.userId === selectedDevice.userId);
      if (deviceLocations.length > 0) {
        const lastLocation = deviceLocations[deviceLocations.length - 1];
        map.setView([lastLocation.latitude, lastLocation.longitude], 15);
      }
    }
  }, [selectedDevice, locations, map]);

  return null;
};

const MarineMap: React.FC<MarineMapProps> = ({
  devices,
  locations,
  selectedDevice,
  onDeviceSelect,
  isFullscreen = false
}) => {
  const [center, setCenter] = useState<[number, number]>([14.7167, -17.4677]); // Dakar
  const [zoom, setZoom] = useState(10);
  const [showTrails, setShowTrails] = useState(true);
  const [showInfoPanel, setShowInfoPanel] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mapType, setMapType] = useState<'osm' | 'satellite'>('osm');
  const [showAccuracy, setShowAccuracy] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Grouper les localisations par dispositif
  const deviceLocations = devices.reduce((acc, device) => {
    const deviceLocs = locations.filter(loc => loc.userId === device.userId);
    if (deviceLocs.length > 0) {
      acc[device.userId] = deviceLocs;
    }
    return acc;
  }, {} as Record<string, Location[]>);

  // Calculer le centre initial de la carte
  useEffect(() => {
    if (locations.length > 0) {
      const lats = locations.map(loc => loc.latitude);
      const lons = locations.map(loc => loc.longitude);
      const avgLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;
      const avgLon = lons.reduce((sum, lon) => sum + lon, 0) / lons.length;
      setCenter([avgLat, avgLon]);
    }
  }, [locations]);

  // Fonctions utilitaires
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDeviceStatusColor = (device: TrackerDevice) => {
    if (!device.isActive) return 'text-red-500';
    if (device.batteryLevel && device.batteryLevel < 20) return 'text-orange-500';
    return 'text-green-500';
  };

  const refreshData = () => {
    setLastUpdate(new Date());
    // Ici on pourrait appeler une fonction pour rafraîchir les données
  };

  return (
    <div className="relative w-full h-full bg-gray-100">
      {/* Sidebar flexible */}
      <AnimatePresence>
        {showInfoPanel && (
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            className={`absolute left-0 top-0 z-30 h-full bg-white shadow-xl border-r border-gray-200 ${
              sidebarCollapsed ? 'w-16' : 'w-80'
            } transition-all duration-300`}
          >
            <div className="h-full flex flex-col">
              {/* Header du sidebar */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  {!sidebarCollapsed && (
                    <div className="flex items-center space-x-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900">Carte Marine</h3>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={refreshData}
                      className="p-1 text-gray-600 hover:text-blue-600 rounded"
                      title="Actualiser"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      className="p-1 text-gray-600 hover:text-blue-600 rounded"
                      title={sidebarCollapsed ? "Étendre" : "Réduire"}
                    >
                      {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Contenu du sidebar */}
              {!sidebarCollapsed && (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {/* Statistiques */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3">Statistiques</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-blue-600 font-medium">Dispositifs actifs:</span>
                        <div className="text-lg font-bold text-blue-900">
                          {devices.filter(d => d.isActive).length}
                        </div>
                      </div>
                      <div>
                        <span className="text-blue-600 font-medium">Total positions:</span>
                        <div className="text-lg font-bold text-blue-900">{locations.length}</div>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-blue-600">
                      Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
                    </div>
                  </div>

                  {/* Contrôles */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Type de carte</span>
                      <select
                        value={mapType}
                        onChange={(e) => setMapType(e.target.value as 'osm' | 'satellite')}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="osm">Carte</option>
                        <option value="satellite">Satellite</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Trajets</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowTrails(!showTrails)}
                        className={`p-1 rounded ${showTrails ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                      >
                        {showTrails ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </motion.button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Précision GPS</span>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowAccuracy(!showAccuracy)}
                        className={`p-1 rounded ${showAccuracy ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}
                      >
                        {showAccuracy ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </motion.button>
                    </div>
                  </div>

                  {/* Liste des dispositifs */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Dispositifs Actifs</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {devices.filter(d => d.isActive).map(device => {
                        const deviceLocs = deviceLocations[device.userId] || [];
                        const lastLocation = deviceLocs[deviceLocs.length - 1];
                        
                        return (
                          <motion.div
                            key={device.id}
                            whileHover={{ scale: 1.02 }}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedDevice?.id === device.id 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                            onClick={() => onDeviceSelect(device)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Ship className={`w-4 h-4 ${getDeviceStatusColor(device)}`} />
                                <span className="font-medium text-sm">{device.deviceId}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Battery className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{device.batteryLevel || 0}%</span>
                              </div>
                            </div>
                            
                            {lastLocation && (
                              <div className="text-xs text-gray-600 space-y-1">
                                <div>Vitesse: {formatSpeed(lastLocation.speed)}</div>
                                <div>Cap: {formatHeading(lastLocation.heading)}</div>
                                <div>Dernière: {formatTime(lastLocation.timestamp)}</div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Sidebar réduit */}
              {sidebarCollapsed && (
                <div className="flex-1 flex flex-col items-center py-4 space-y-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMapType(mapType === 'osm' ? 'satellite' : 'osm')}
                    className="p-2 bg-blue-100 text-blue-600 rounded-lg"
                    title="Changer de carte"
                  >
                    {mapType === 'osm' ? <Satellite className="w-4 h-4" /> : <Map className="w-4 h-4" />}
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowTrails(!showTrails)}
                    className={`p-2 rounded-lg ${
                      showTrails ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                    }`}
                    title="Afficher trajets"
                  >
                    <Navigation className="w-4 h-4" />
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={refreshData}
                    className="p-2 bg-gray-100 text-gray-600 rounded-lg"
                    title="Actualiser"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton pour afficher/masquer le sidebar */}
      {!showInfoPanel && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowInfoPanel(true)}
          className="absolute left-4 top-4 z-30 p-2 bg-white shadow-lg rounded-lg text-gray-600 hover:text-blue-600"
        >
          <Info className="w-5 h-5" />
        </motion.button>
      )}

      {/* Carte Leaflet */}
      <div className={`h-full ${showInfoPanel ? (sidebarCollapsed ? 'ml-16' : 'ml-80') : ''} transition-all duration-300`}>
        <MapContainer
          center={center}
          zoom={zoom}
          className="w-full h-full"
          zoomControl={false}
        >
          <MapController selectedDevice={selectedDevice} locations={locations} />
          
          {/* Couches de tuiles */}
          {mapType === 'osm' ? (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          ) : (
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            />
          )}

          {/* Marqueurs des dispositifs */}
          {devices.filter(d => d.isActive).map(device => {
            const deviceLocs = deviceLocations[device.userId] || [];
            const lastLocation = deviceLocs[deviceLocs.length - 1];
            
            if (!lastLocation) return null;

            return (
              <React.Fragment key={device.id}>
                {/* Marqueur principal */}
                <Marker
                  position={[lastLocation.latitude, lastLocation.longitude]}
                  icon={boatIcon}
                  eventHandlers={{
                    click: () => onDeviceSelect(device)
                  }}
                >
                  <Popup>
                    <div className="p-2 min-w-64">
                      <div className="flex items-center space-x-2 mb-3">
                        <Ship className="w-5 h-5 text-blue-600" />
                        <h3 className="font-semibold text-gray-900">{device.deviceId}</h3>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Statut:</span>
                          <span className={`font-medium ${getDeviceStatusColor(device)}`}>
                            {device.isActive ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Vitesse:</span>
                          <span className="font-medium">{formatSpeed(lastLocation.speed)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Cap:</span>
                          <span className="font-medium">{formatHeading(lastLocation.heading)}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Batterie:</span>
                          <span className="font-medium">{device.batteryLevel || 0}%</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Signal:</span>
                          <span className="font-medium">{device.signalStrength || 0}/5</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Dernière:</span>
                          <span className="font-medium">{formatTime(lastLocation.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {/* Cercle de précision */}
                {showAccuracy && lastLocation.accuracy && (
                  <Circle
                    center={[lastLocation.latitude, lastLocation.longitude]}
                    radius={lastLocation.accuracy}
                    pathOptions={{
                      color: 'blue',
                      fillColor: 'blue',
                      fillOpacity: 0.1,
                      weight: 1
                    }}
                  />
                )}

                {/* Trajet */}
                {showTrails && deviceLocs.length > 1 && (
                  <Polyline
                    positions={deviceLocs.map(loc => [loc.latitude, loc.longitude])}
                    pathOptions={{
                      color: '#3b82f6',
                      weight: 3,
                      opacity: 0.7
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {/* Contrôles de carte */}
      <div className="absolute top-4 right-4 z-30 flex flex-col space-y-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowInfoPanel(!showInfoPanel)}
          className="p-2 bg-white shadow-lg rounded-lg text-gray-600 hover:text-blue-600"
          title={showInfoPanel ? "Masquer panneau" : "Afficher panneau"}
        >
          {showInfoPanel ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={refreshData}
          className="p-2 bg-white shadow-lg rounded-lg text-gray-600 hover:text-blue-600"
          title="Actualiser"
        >
          <RefreshCw className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Légende */}
      <div className="absolute bottom-4 left-4 z-30 bg-white shadow-lg rounded-lg p-3">
        <h4 className="font-medium text-gray-900 mb-2 text-sm">Légende</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Dispositif actif</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Dispositif inactif</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-1 bg-blue-500"></div>
            <span>Trajet</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarineMap;
