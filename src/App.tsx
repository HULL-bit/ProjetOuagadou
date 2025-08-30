import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase, supabaseHelpers } from '../lib/supabaseHelpers';
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
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Vérifier la connexion Supabase
  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const checkSupabaseConnection = async () => {
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (!error) {
        setIsSupabaseConnected(true);
        console.log('✅ Connexion Supabase établie');
      } else {
        console.warn('⚠️ Supabase non configuré, utilisation du mode démo');
        setIsSupabaseConnected(false);
      }
    } catch (error) {
      console.warn('⚠️ Erreur connexion Supabase, utilisation du mode démo');
      setIsSupabaseConnected(false);
    }
  };

  // Charger les données initiales
  useEffect(() => {
    if (user) {
      loadInitialData();
      
      if (isSupabaseConnected) {
        setupRealtimeSubscriptions();
      }
      
      // Actualiser les données toutes les 30 secondes
      const interval = setInterval(refreshData, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isSupabaseConnected]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les utilisateurs de test
      const allUsers = [...testPirogues];
      if (user && !allUsers.find(u => u.id === user.id)) {
        allUsers.push(user);
      }
      setUsers(allUsers);
      
      if (isSupabaseConnected) {
        await Promise.all([
          loadZones(),
          loadTrips(),
          loadFleetStats()
        ]);
      } else {
        // Utiliser les données de démonstration
        setZones(mockData.zones);
      }
      
      // Charger les messages et alertes depuis les logs
      loadMessagesFromLogs();
      loadAlertsFromLogs();
      
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

  const setupRealtimeSubscriptions = () => {
    // Subscription pour les zones seulement (messages et alertes sont dans les logs)
    const zonesSubscription = supabase
      .channel('zones')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'zones' },
        () => loadZones()
      )
      .subscribe();

    return () => {
      zonesSubscription.unsubscribe();
    };
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
      const data = await supabaseHelpers.getActiveZones();
      const transformedZones = data.map(transformZone);
      setZones(transformedZones);
    } catch (error) {
      console.error('Erreur chargement zones:', error);
      setZones(mockData.zones);
    }
  };

  const loadTrips = async () => {
    try {
      if (user) {
        const data = await supabaseHelpers.getUserTrips(user.id);
        const transformedTrips = data.map(transformTrip);
        setTrips(transformedTrips);
      }
    } catch (error) {
      console.error('Erreur chargement sorties:', error);
    }
  };

  const loadFleetStats = async () => {
    try {
      if (user?.role === 'admin' || user?.role === 'organization') {
        const stats = await supabaseHelpers.getFleetStatistics();
        setFleetStats(stats);
      }
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    }
  };

  // Fonctions de transformation
  const transformZone = (dbZone: any): Zone => ({
    id: dbZone.id,
    name: dbZone.name,
    coordinates: dbZone.coordinates?.coordinates?.[0]?.map((coord: number[]) => [coord[1], coord[0]]) || [],
    type: dbZone.zone_type,
    isActive: dbZone.is_active
  });

  const transformTrip = (dbTrip: any): Trip => ({
    id: dbTrip.id,
    userId: dbTrip.user_id,
    startTime: dbTrip.start_time,
    endTime: dbTrip.end_time,
    startLocation: dbTrip.start_location ? {
      id: dbTrip.start_location_id,
      userId: dbTrip.user_id,
      latitude: dbTrip.start_location.latitude,
      longitude: dbTrip.start_location.longitude,
      timestamp: dbTrip.start_time,
      speed: 0,
      heading: 0
    } : {
      id: '',
      userId: dbTrip.user_id,
      latitude: 14.9325,
      longitude: -17.1925,
      timestamp: dbTrip.start_time,
      speed: 0,
      heading: 0
    },
    distance: dbTrip.distance_km || 0,
    maxSpeed: dbTrip.max_speed || 0,
    avgSpeed: dbTrip.avg_speed || 0
  });

  // Actions
  const updateLocation = async (location: Omit<Location, 'id' | 'timestamp'>) => {
    try {
      if (isSupabaseConnected) {
        await supabaseHelpers.insertLocation(location);
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
      
      if (isSupabaseConnected) {
        // Envoyer à Supabase
        const dbMessage = await supabaseHelpers.insertMessage(message);
        messageId = dbMessage.id;
        console.log('💬 Message envoyé à Supabase');
      } else {
        // Fallback vers logs
        messageId = logger.logMessage(message.senderId, message, { channelId: message.channelId });
        console.log('💬 Message loggé en mode démo');
      }
      
      const newMessage: Message = {
        id: messageId,
        timestamp: new Date().toISOString(),
        isRead: false,
        ...message
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      if (!isSupabaseConnected) {
        // Simuler la réception en temps réel pour les autres utilisateurs
        setTimeout(() => {
          loadMessagesFromLogs();
        }, 100);
      }
    } catch (error) {
      console.error('Erreur envoi message:', error);
      // Fallback vers logs en cas d'erreur Supabase
      const messageId = logger.logMessage(message.senderId, message, { channelId: message.channelId });
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
      
      if (isSupabaseConnected) {
        // Envoyer à Supabase
        const dbAlert = await supabaseHelpers.insertAlert(alert);
        alertId = dbAlert.id;
        console.log('🚨 Alerte envoyée à Supabase');
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
      // Fallback vers logs en cas d'erreur Supabase
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
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, status: 'acknowledged' as const } : alert
      ));
      console.log('✅ Alerte acquittée');
    } catch (error) {
      console.error('Erreur acquittement alerte:', error);
    }
  };

  const addUser = async (userData: any) => {
    try {
      if (isSupabaseConnected) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password
      case 'history':
        return <HistoryManagement />;
      case 'support':
        return <SupportCenter />;
        if (authError) throw authError;

        if (authData.user) {
          await supabaseHelpers.createUserProfile({
            id: authData.user.id,
            ...userData
          });
        }
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
      if (isSupabaseConnected) {
        await supabaseHelpers.updateProfile(userId, userData);
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
      if (isSupabaseConnected) {
        await supabaseHelpers.deleteProfile(userId);
      }
      
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      throw error;
    }
  };

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
    try {
      if (isSupabaseConnected) {
        await supabaseHelpers.uploadFile(file, bucket, path);
        return supabaseHelpers.getPublicUrl(bucket, path);
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
      if (isSupabaseConnected) {
        const { data, error } = await supabase
          .from('zones')
          .insert({
            name: zoneData.name,
            description: zoneData.description,
            zone_type: zoneData.type,
            coordinates: {
              type: 'Polygon',
              coordinates: [zoneData.coordinates]
            },
            is_active: true,
            created_by: user?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
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
      if (isSupabaseConnected) {
        const { error } = await supabase
          .from('zones')
          .update({
            ...zoneData,
            updated_at: new Date().toISOString()
          })
          .eq('id', zoneId);

        if (error) throw error;
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
      if (isSupabaseConnected) {
        const { error } = await supabase
          .from('zones')
          .delete()
          .eq('id', zoneId);

        if (error) throw error;
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
      
      if (isSupabaseConnected) {
        await Promise.all([
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