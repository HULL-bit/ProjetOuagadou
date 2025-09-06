import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { authAPI, trackingAPI, alertsAPI, communicationAPI, zonesAPI, weatherAPI } from '../lib/djangoApi';
import { logger } from '../lib/logger';
import { weatherService } from '../lib/weatherApi';
import { testPirogues } from '../lib/testData';
import { Location, Alert, Message, WeatherCondition, Zone, Trip, User, TrackerDevice } from '../types';

interface DataContextType {
  locations: Location[];
  alerts: Alert[];
  messages: Message[];
  weather: WeatherCondition | null;
  zones: Zone[];
  trips: Trip[];
  users: User[];
  trackerDevices: TrackerDevice[];
  fleetStats: any;
  updateLocation: (location: Omit<Location, 'id' | 'timestamp'>) => Promise<void>;
  sendMessage: (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
  createAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  addUser: (userData: any) => Promise<void>;
  updateUser: (userId: string, userData: any) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  uploadFile: (file: File, bucket: string, path: string) => Promise<string>;
  addZone: (zoneData: any) => Promise<void>;
  updateZone: (zoneId: string, zoneData: any) => Promise<void>;
  deleteZone: (zoneId: string) => Promise<void>;
  refreshData: () => Promise<void>;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Données de démonstration pour le mode hors ligne
const mockData = {
  zones: [
    {
      id: '1',
      name: 'Zone de Sécurité Cayar',
      coordinates: [
        [14.9225, -17.2025],
        [14.9225, -17.1825],
        [14.9425, -17.1825],
        [14.9425, -17.2025],
        [14.9225, -17.2025]
      ] as [number, number][],
      type: 'safety' as const,
      isActive: true
    },
    {
      id: '2',
      name: 'Zone de Pêche Traditionnelle',
      coordinates: [
        [14.9125, -17.2125],
        [14.9125, -17.1925],
        [14.9325, -17.1925],
        [14.9325, -17.2125],
        [14.9125, -17.2125]
      ] as [number, number][],
      type: 'fishing' as const,
      isActive: true
    },
    {
      id: '3',
      name: 'Zone Restreinte',
      coordinates: [
        [14.9525, -17.1725],
        [14.9525, -17.1525],
        [14.9725, -17.1525],
        [14.9725, -17.1725],
        [14.9525, -17.1725]
      ] as [number, number][],
      type: 'restricted' as const,
      isActive: true
    }
  ],
  messages: [
    {
      id: '1',
      senderId: 'user1',
      channelId: 'general',
      content: 'Bonjour à tous ! Comment va la pêche aujourd\'hui ?',
      type: 'text',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      isRead: true
    },
    {
      id: '2',
      senderId: 'user2',
      channelId: 'general',
      content: 'Très bien ! Les conditions sont excellentes ce matin.',
      type: 'text',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      isRead: true
    },
    {
      id: '3',
      senderId: 'user3',
      channelId: 'weather',
      content: 'Attention, vent fort prévu cet après-midi.',
      type: 'text',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      isRead: false
    },
    {
      id: '4',
      senderId: 'user1',
      channelId: 'emergency',
      content: 'Urgence : Pirogue en difficulté au large de Cayar',
      type: 'text',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      isRead: false
    }
  ]
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [weather, setWeather] = useState<WeatherCondition | null>(null);
  const [zones, setZones] = useState<Zone[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [trackerDevices, setTrackerDevices] = useState<TrackerDevice[]>([]);
  const [fleetStats, setFleetStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDjangoConnected, setIsDjangoConnected] = useState(false);

  // Vérifier la connexion Django
  useEffect(() => {
    checkDjangoConnection();
  }, []);

  const checkDjangoConnection = async () => {
    try {
      // Ne pas appeler l'API si l'utilisateur n'est pas authentifié
      const hasToken = authAPI.isAuthenticated ? authAPI.isAuthenticated() : !!localStorage.getItem('authToken');
      if (!hasToken) {
        setIsDjangoConnected(false);
        return;
      }

      // Test simple de connexion
      const response = await fetch('http://localhost:8000/api/users/profile/', {
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setIsDjangoConnected(true);
        console.log('✅ Connexion Django établie');
      } else {
        setIsDjangoConnected(false);
        console.warn('⚠️ Django non disponible, utilisation du mode démo');
      }
    } catch (error) {
      console.warn('⚠️ Django non disponible, utilisation du mode démo');
      setIsDjangoConnected(false);
    }
  };

  const loadInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      if (isDjangoConnected) {
        await Promise.all([
          loadUsers(),
          loadMessages(),
          loadAlerts(),
          loadZones(),
          loadTrips(),
          loadTrackerDevices(),
          loadFleetStats()
        ]);
      } else {
        // Utiliser les données de démonstration
        setZones(mockData.zones);
        setUsers(testPirogues);
        loadMessagesFromLogs();
        loadAlertsFromLogs();
      }
      
      // Charger les positions GPS
      loadLocations();
      
      // Charger la météo réelle
      await loadRealWeather();
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setZones(mockData.zones);
      setUsers(testPirogues);
    } finally {
      setIsLoading(false);
    }
  }, [isDjangoConnected]);

  const refreshData = useCallback(async () => {
    try {
      loadLocations();
      await loadRealWeather();
      
      if (isDjangoConnected) {
        await Promise.all([
          loadMessages(),
          loadAlerts(),
          loadZones(),
          loadTrackerDevices(),
          loadFleetStats()
        ]);
      }
    } catch (error) {
      console.error('Erreur actualisation données:', error);
    }
  }, [isDjangoConnected]);

  // Charger les données initiales
  useEffect(() => {
    if (user) {
      loadInitialData();
      
      // Actualiser les données toutes les 30 secondes
      const interval = setInterval(refreshData, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isDjangoConnected, loadInitialData, refreshData]);

  const loadUsers = async () => {
    try {
      if (isDjangoConnected) {
        const data = await authAPI.getUsers();
        if (Array.isArray(data)) {
          const transformedUsers = data.map((u: any) => ({
            id: u.id,
            email: u.email,
            username: u.username,
            role: u.role,
            profile: {
              fullName: u.profile?.full_name || u.username,
              phone: u.profile?.phone,
              avatar: u.profile?.avatar_url,
              boatName: u.profile?.boat_name,
              licenseNumber: u.profile?.license_number,
              emergencyContact: u.profile?.emergency_contact,
              organizationName: u.profile?.organization_name,
              organizationType: u.profile?.organization_type
            }
          }));
          setUsers(transformedUsers);
          console.log('👥 Utilisateurs chargés depuis Django:', transformedUsers.length);
        } else {
          console.warn('Réponse API users non-array:', data);
          setUsers(testPirogues);
        }
      } else {
        console.warn('Django non connecté, utilisation des données de test');
        setUsers(testPirogues);
      }
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      setUsers(testPirogues);
    }
  };

  const loadTrackerDevices = async () => {
    try {
      const data = await trackingAPI.getDevices();
      if (Array.isArray(data)) {
        const transformedDevices = data.map((device: any) => ({
          id: device.id,
          deviceId: device.device_id,
          deviceType: device.device_type,
          userId: device.user,
          imei: device.imei,
          phoneNumber: device.phone_number,
          isActive: device.is_active,
          lastCommunication: device.last_communication,
          batteryLevel: device.battery_level,
          signalStrength: device.signal_strength,
          status: device.is_active ? 'En ligne' : 'Hors ligne'
        }));
        setTrackerDevices(transformedDevices);
      } else {
        console.warn('Réponse API tracker devices non-array:', data);
      }
    } catch (error) {
      console.error('Erreur chargement dispositifs:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const data = await communicationAPI.getMessages();
      if (Array.isArray(data)) {
        const transformedMessages = data.map((msg: any) => ({
          id: msg.id,
          senderId: msg.sender,
          receiverId: msg.receiver,
          channelId: msg.channel_id,
          content: msg.content,
          type: msg.message_type,
          timestamp: msg.created_at,
          isRead: msg.is_read,
          imageUrl: msg.image_url,
          metadata: msg.metadata
        }));
        setMessages(transformedMessages);
      } else {
        console.warn('Réponse API messages non-array:', data);
        loadMessagesFromLogs();
      }
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      loadMessagesFromLogs();
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await alertsAPI.getAlerts();
      if (Array.isArray(data)) {
        const transformedAlerts = data.map((alert: any) => ({
          id: alert.id,
          userId: alert.user,
          type: alert.alert_type,
          message: alert.message,
          severity: alert.severity,
          status: alert.status,
          createdAt: alert.created_at,
          location: alert.location ? {
            id: alert.location.id,
            userId: alert.user,
            latitude: alert.location.latitude,
            longitude: alert.location.longitude,
            timestamp: alert.location.timestamp,
            speed: alert.location.speed,
            heading: alert.location.heading
          } : undefined,
          metadata: alert.metadata
        }));
        setAlerts(transformedAlerts);
      } else {
        console.warn('Réponse API alerts non-array:', data);
        loadAlertsFromLogs();
      }
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
      loadAlertsFromLogs();
    }
  };

  const loadMessagesFromLogs = () => {
    // Utiliser les données de test si pas de messages dans les logs
    const loggedMessages = logger.getRecentMessages('general', 100);
    if (loggedMessages.length > 0) {
      const transformedMessages = loggedMessages.map(log => ({
        id: log.id,
        senderId: log.content.senderId,
        receiverId: log.content.receiverId,
        channelId: log.content.channelId,
        content: log.content.content,
        type: log.content.type,
        timestamp: log.timestamp,
        isRead: log.content.isRead || false,
        metadata: log.metadata
      }));
      setMessages(transformedMessages);
    } else {
      // Utiliser les données de test
      setMessages(mockData.messages);
    }
  };

  const loadAlertsFromLogs = () => {
    const loggedAlerts = logger.getRecentAlerts(50);
    const transformedAlerts = loggedAlerts.map(log => ({
      id: log.id,
      userId: log.content.userId,
      type: log.content.type,
      message: log.content.message,
      severity: log.content.severity,
      status: log.content.status || 'active',
      createdAt: log.timestamp,
      location: log.content.location,
      metadata: log.metadata
    }));
    setAlerts(transformedAlerts);
  };

  const loadLocations = async () => {
    try {
      if (isDjangoConnected) {
        const data = await trackingAPI.getLocations();
        if (Array.isArray(data)) {
          const transformedLocations = data.map((loc: any) => ({
            id: loc.id,
            userId: loc.user,
            latitude: loc.latitude,
            longitude: loc.longitude,
            speed: loc.speed || 0,
            heading: loc.heading || 0,
            altitude: loc.altitude || 0,
            accuracy: loc.accuracy || 0,
            timestamp: loc.timestamp
          }));
          setLocations(transformedLocations);
          console.log('📍 Positions GPS chargées depuis Django:', transformedLocations.length);
        } else {
          console.warn('Réponse API locations non-array:', data);
          setLocations([]);
        }
      } else {
        console.warn('Django non connecté, utilisation des données de test');
        // Créer quelques positions de test basées sur les utilisateurs
        const testLocations = users.slice(0, 3).map((user, index) => ({
          id: `test-loc-${index}`,
          userId: user.id,
          latitude: 14.9325 + (index * 0.01),
          longitude: -17.1925 + (index * 0.01),
          speed: 8 + (index * 2),
          heading: 45 + (index * 30),
          altitude: 0,
          accuracy: 10,
          timestamp: new Date().toISOString()
        }));
        setLocations(testLocations);
      }
    } catch (error) {
      console.error('Erreur chargement positions GPS:', error);
      setLocations([]);
    }
  };


  const loadRealWeather = async () => {
    try {
      if (isDjangoConnected) {
        // Coordonnées par défaut pour Cayar, Sénégal
        const defaultLat = 14.9325;
        const defaultLon = -17.1925;
        
        const weatherData = await weatherAPI.getCurrentWeather(defaultLat, defaultLon);
        setWeather(weatherData);
      } else {
        const weatherData = await weatherService.getCurrentWeather();
        setWeather(weatherData);
      }
      console.log('🌤️ Météo chargée');
    } catch (error) {
      console.error('Erreur chargement météo:', error);
    }
  };

  const loadZones = async () => {
    try {
      const data = await zonesAPI.getZones();
      if (Array.isArray(data)) {
        const transformedZones = data.map((zone: any) => ({
          id: zone.id,
          name: zone.name,
          description: zone.description,
          coordinates: zone.coordinates?.coordinates?.[0]?.map((coord: number[]) => [coord[1], coord[0]]) || [],
          type: zone.zone_type,
          isActive: zone.is_active,
          createdBy: zone.created_by
        }));
        setZones(transformedZones);
      } else {
        console.warn('Réponse API zones non-array:', data);
        setZones(mockData.zones);
      }
    } catch (error) {
      console.error('Erreur chargement zones:', error);
      setZones(mockData.zones);
    }
  };

  const loadTrips = async () => {
    try {
      if (user) {
        if (isDjangoConnected) {
          const data = await trackingAPI.getTrips(user.id);
          if (Array.isArray(data)) {
            const transformedTrips = data.map((trip: any) => ({
              id: trip.id,
              userId: trip.user,
              startTime: trip.start_time,
              endTime: trip.end_time,
              startLocation: {
                id: trip.start_location?.id || '',
                userId: trip.user,
                latitude: trip.start_location?.latitude || 14.9325,
                longitude: trip.start_location?.longitude || -17.1925,
                timestamp: trip.start_time,
                speed: 0,
                heading: 0
              },
              distance: trip.distance_km || 0,
              maxSpeed: trip.max_speed || 0,
              avgSpeed: trip.avg_speed || 0
            }));
            setTrips(transformedTrips);
          } else {
            console.warn('Réponse API trips non-array:', data);
            setTrips([]);
          }
        } else {
          // Mode démo - créer quelques sorties simulées
          const mockTrips = [
            {
              id: '1',
              userId: user.id,
              startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
              endTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
              startLocation: {
                id: '1',
                userId: user.id,
                latitude: 14.9325,
                longitude: -17.1925,
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
                speed: 0,
                heading: 0
              },
              distance: 12.5,
              maxSpeed: 18.2,
              avgSpeed: 12.8,
              status: 'completed'
            }
          ];
          setTrips(mockTrips);
        }
      }
    } catch (error) {
      console.error('Erreur chargement sorties:', error);
      setTrips([]);
    }
  };

  const loadFleetStats = async () => {
    try {
      if (user?.role === 'admin' || user?.role === 'organization') {
        const locations = await trackingAPI.getLocations();
        const alerts = await alertsAPI.getAlerts();
        
        const activeBoats = new Set(locations.map((loc: any) => loc.user)).size;
        const activeAlerts = alerts.filter((alert: any) => alert.status === 'active').length;
        
        setFleetStats({
          activeBoats,
          activeAlerts,
          totalLocations: locations.length
        });
      }
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    }
  };

  // Actions
  const updateLocation = async (location: Omit<Location, 'id' | 'timestamp'>) => {
    try {
      if (isDjangoConnected) {
        await trackingAPI.updateLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          speed: location.speed,
          heading: location.heading,
          altitude: location.altitude,
          accuracy: location.accuracy,
          timestamp: new Date().toISOString()
        });
      }
      
      // Toujours mettre à jour les positions locales
      const newLocation: Location = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...location
      };
      setLocations(prev => [newLocation, ...prev.slice(0, 99)]);
    } catch (error) {
      console.error('Erreur mise à jour position:', error);
    }
  };

  const sendMessage = async (message: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
    try {
      let messageId: string;
      
      if (isDjangoConnected) {
        const response = await communicationAPI.sendMessage({
          sender: message.senderId,
          receiver: message.receiverId,
          channel_id: message.channelId,
          content: message.content,
          message_type: message.type,
          metadata: message.metadata
        });
        messageId = response.id;
        console.log('💬 Message envoyé à Django');
      } else {
        messageId = logger.logMessage(message.senderId, message);
        console.log('💬 Message loggé en mode démo');
      }
      
      const newMessage: Message = {
        id: messageId,
        timestamp: new Date().toISOString(),
        isRead: false,
        ...message
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      if (!isDjangoConnected) {
        setTimeout(() => {
          loadMessagesFromLogs();
        }, 100);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      const messageId = logger.logMessage(message.senderId, message);
      const newMessage: Message = {
        id: messageId,
        timestamp: new Date().toISOString(),
        isRead: false,
        ...message
      };
      setMessages(prev => [...prev, newMessage]);
    }
  };

  const createAlert = async (alert: Omit<Alert, 'id' | 'createdAt' | 'status'>) => {
    try {
      let alertId: string;
      
      if (isDjangoConnected) {
        const response = await alertsAPI.createAlert({
          user: alert.userId,
          alert_type: alert.type,
          title: alert.message,
          message: alert.message,
          severity: alert.severity,
          location: alert.location ? {
            latitude: alert.location.latitude,
            longitude: alert.location.longitude,
            speed: alert.location.speed,
            heading: alert.location.heading,
            timestamp: alert.location.timestamp
          } : null,
          metadata: alert.metadata
        });
        alertId = response.id;
        console.log('🚨 Alerte envoyée à Django');
      } else {
        alertId = logger.logAlert(alert.userId, { ...alert, status: 'active' });
        console.log('🚨 Alerte loggée en mode démo');
      }
      
      const newAlert: Alert = {
        id: alertId,
        createdAt: new Date().toISOString(),
        status: 'active',
        ...alert
      };
      
      setAlerts(prev => [newAlert, ...prev]);
    } catch (error) {
      console.error('Erreur création alerte:', error);
      const alertId = logger.logAlert(alert.userId, { ...alert, status: 'active' });
      const newAlert: Alert = {
        id: alertId,
        createdAt: new Date().toISOString(),
        status: 'active',
        ...alert
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      if (isDjangoConnected) {
        await alertsAPI.acknowledgeAlert(alertId);
        console.log('✅ Alerte acquittée via Django');
      }
      
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'acknowledged' as const } : alert
      ));
    } catch (error) {
      console.error('Erreur acquittement alerte:', error);
    }
  };

  const addUser = async (userData: any) => {
    try {
      if (isDjangoConnected) {
        await authAPI.register(userData);
        await loadUsers();
      } else {
        const newUser: User = {
          id: Date.now().toString(),
          email: userData.email,
          username: userData.email.split('@')[0],
          role: userData.role,
          profile: {
            fullName: userData.fullName,
            phone: userData.phone,
            boatName: userData.boatName,
            licenseNumber: userData.licenseNumber
          }
        };
        setUsers(prev => [newUser, ...prev]);
      }
    } catch (error) {
      console.error('Erreur ajout utilisateur:', error);
      throw error;
    }
  };

  const updateUser = async (userId: string, userData: any) => {
    try {
      if (isDjangoConnected) {
        await authAPI.updateProfile(userData);
        await loadUsers();
      } else {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, profile: { ...user.profile, ...userData } } : user
        ));
      }
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      console.warn('Suppression utilisateur non implémentée côté Django');
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      throw error;
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
    try {
      if (isDjangoConnected) {
        const response = await communicationAPI.uploadFile(file, bucket);
        return response.file_url;
      } else {
        return URL.createObjectURL(file);
      }
    } catch (error) {
      console.error('Erreur upload fichier:', error);
      throw error;
    }
  };

  const addZone = async (zoneData: any) => {
    try {
      if (isDjangoConnected) {
        await zonesAPI.createZone({
          name: zoneData.name,
          description: zoneData.description,
          zone_type: zoneData.type,
          coordinates: {
            type: 'Polygon',
            coordinates: [zoneData.coordinates]
          },
          is_active: true,
          created_by: user?.id
        });
        await loadZones();
      } else {
        const newZone: Zone = {
          id: Date.now().toString(),
          name: zoneData.name,
          coordinates: zoneData.coordinates,
          type: zoneData.type,
          isActive: true
        };
        setZones(prev => [newZone, ...prev]);
      }
    } catch (error) {
      console.error('Erreur ajout zone:', error);
      throw error;
    }
  };

  const updateZone = async (zoneId: string, zoneData: any) => {
    try {
      if (isDjangoConnected) {
        await zonesAPI.updateZone(zoneId, zoneData);
        await loadZones();
      } else {
        setZones(prev => prev.map(zone => 
          zone.id === zoneId ? { ...zone, ...zoneData } : zone
        ));
      }
    } catch (error) {
      console.error('Erreur mise à jour zone:', error);
      throw error;
    }
  };

  const deleteZone = async (zoneId: string) => {
    try {
      if (isDjangoConnected) {
        await zonesAPI.deleteZone(zoneId);
        await loadZones();
      } else {
        setZones(prev => prev.filter(zone => zone.id !== zoneId));
      }
    } catch (error) {
      console.error('Erreur suppression zone:', error);
      throw error;
    }
  };

  return (
    <DataContext.Provider value={{
      locations,
      alerts,
      messages,
      weather,
      zones,
      trips,
      users,
      trackerDevices,
      fleetStats,
      updateLocation,
      sendMessage,
      createAlert,
      acknowledgeAlert,
      addUser,
      updateUser,
      deleteUser,
      uploadFile,
      addZone,
      updateZone,
      deleteZone,
      refreshData,
      isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
};