import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { authAPI, trackingAPI, alertsAPI, communicationAPI, zonesAPI, weatherAPI } from '../lib/api';
import { logger } from '../lib/logger';
import { weatherService } from '../lib/weatherApi';
import { testPirogues, pirogueSimulator } from '../lib/testData';
import { Location, Alert, Message, WeatherCondition, Zone, Trip, User } from '../types';

interface DataContextType {
  locations: Location[];
  alerts: Alert[];
  messages: Message[];
  weather: WeatherCondition | null;
  zones: Zone[];
  trips: Trip[];
  users: User[];
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
  const [fleetStats, setFleetStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDjangoConnected, setIsDjangoConnected] = useState(false);

  // Vérifier la connexion Django
  useEffect(() => {
    checkDjangoConnection();
  }, []);

  const checkDjangoConnection = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response) {
        setIsDjangoConnected(true);
        console.log('✅ Connexion Django établie');
      }
    } catch (error) {
      console.warn('⚠️ Django non disponible, utilisation du mode démo');
      setIsDjangoConnected(false);
    }
  };

  // Charger les données initiales
  useEffect(() => {
    if (user) {
      loadInitialData();
      
      // Actualiser les données toutes les 30 secondes
      const interval = setInterval(refreshData, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isDjangoConnected]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les utilisateurs de test
      const allUsers = [...testPirogues];
      if (user && !allUsers.find(u => u.id === user.id)) {
        allUsers.push(user);
      }
      setUsers(allUsers);
      
      if (isDjangoConnected) {
        await Promise.all([
          loadMessages(),
          loadAlerts(),
          loadZones(),
          loadTrips(),
          loadFleetStats()
        ]);
      } else {
        // Utiliser les données de démonstration
        setZones(mockData.zones);
      }
      
      if (!isDjangoConnected) {
        // Charger les messages et alertes depuis les logs en mode démo
        loadMessagesFromLogs();
        loadAlertsFromLogs();
      }
      
      // Charger les positions des pirogues de test
      loadTestPirogueLocations();
      
      // Charger la météo réelle
      await loadRealWeather();
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setZones(mockData.zones);
      setUsers(testPirogues);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const data = await communicationAPI.getMessages();
      const transformedMessages = data.map((msg: any) => ({
        id: msg.id,
        senderId: msg.sender,
        receiverId: msg.receiver,
        content: msg.content,
        type: msg.message_type,
        timestamp: msg.created_at,
        isRead: msg.is_read,
        metadata: msg.metadata
      }));
      setMessages(transformedMessages);
    } catch (error) {
      console.error('Erreur chargement messages:', error);
      loadMessagesFromLogs();
    }
  };

  const loadAlerts = async () => {
    try {
      const data = await alertsAPI.getAlerts();
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
    } catch (error) {
      console.error('Erreur chargement alertes:', error);
      loadAlertsFromLogs();
    }
  };

  const loadMessagesFromLogs = () => {
    const loggedMessages = logger.getRecentMessages('general', 100);
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

  const loadTestPirogueLocations = () => {
    const positions = pirogueSimulator.getCurrentPositions();
    setLocations(positions);
  };

  const loadRealWeather = async () => {
    try {
      const weatherData = await weatherService.getCurrentWeather();
      setWeather(weatherData);
      console.log('🌤️ Météo chargée:', weatherData);
    } catch (error) {
      console.error('Erreur chargement météo:', error);
    }
  };

  const loadZones = async () => {
    try {
      const data = await zonesAPI.getZones();
      const transformedZones = data.map((zone: any) => ({
        id: zone.id,
        name: zone.name,
        coordinates: zone.coordinates?.coordinates?.[0]?.map((coord: number[]) => [coord[1], coord[0]]) || [],
        type: zone.zone_type,
        isActive: zone.is_active
      }));
      setZones(transformedZones);
    } catch (error) {
      console.error('Erreur chargement zones:', error);
      setZones(mockData.zones);
    }
  };

  const loadTrips = async () => {
    try {
      if (user) {
        const data = await trackingAPI.getTrips(user.id);
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
      }
    } catch (error) {
      console.error('Erreur chargement sorties:', error);
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
        // Envoyer à Django
        const response = await communicationAPI.sendMessage({
          sender: message.senderId,
          receiver: message.receiverId,
          content: message.content,
          message_type: message.type,
          metadata: message.metadata
        });
        messageId = response.id;
        console.log('💬 Message envoyé à Django');
      } else {
        // Fallback vers logs
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
        // Simuler la réception en temps réel pour les autres utilisateurs
        setTimeout(() => {
          loadMessagesFromLogs();
        }, 100);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      // Fallback vers logs en cas d'erreur Django
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
        // Envoyer à Django
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
        // Fallback vers logs
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
      // Fallback vers logs en cas d'erreur Django
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
        const response = await authAPI.register(userData);
        const newUser: User = response.user;
        setUsers(prev => [newUser, ...prev]);
      } else {
        // Mode démo
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
      }
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, profile: { ...user.profile, ...userData } } : user
      ));
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error);
      throw error;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // Note: La suppression d'utilisateur nécessite une API spécifique
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
        // Mode démo - retourner une URL simulée
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
        // Mode démo
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

  const refreshData = async () => {
    try {
      // Actualiser les positions des pirogues de test
      loadTestPirogueLocations();
      
      // Actualiser la météo
      await loadRealWeather();
      
      if (isDjangoConnected) {
        await Promise.all([
          loadMessages(),
          loadAlerts(),
          loadZones(),
          loadFleetStats()
        ]);
      }
    } catch (error) {
      console.error('Erreur actualisation données:', error);
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