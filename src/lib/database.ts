import { createClient } from '@supabase/supabase-js';

// Configuration pour PostgreSQL local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:8000';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  }
});

// Helper pour les requêtes directes PostgreSQL
export class DatabaseManager {
  private connectionString: string;

  constructor() {
    this.connectionString = import.meta.env.DATABASE_URL || 
      'postgresql://pirogue_user:pirogue_password@localhost:5432/pirogue_connect';
  }

  // Gestion des utilisateurs
  async createUser(userData: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: crypto.randomUUID(),
          email: userData.email,
          full_name: userData.fullName,
          phone: userData.phone,
          role: userData.role,
          boat_name: userData.boatName,
          license_number: userData.licenseNumber,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error);
      throw error;
    }
  }

  async deleteUser(userId: string) {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Erreur suppression utilisateur:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
      throw error;
    }
  }

  // Gestion des positions
  async insertLocation(locationData: any) {
    try {
      const { data, error } = await supabase
        .from('locations')
        .insert({
          user_id: locationData.userId,
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          speed: locationData.speed,
          heading: locationData.heading,
          accuracy: locationData.accuracy,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur insertion position:', error);
      throw error;
    }
  }

  async getRecentLocations(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select(`
          *,
          profiles (
            full_name,
            boat_name,
            role
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération positions:', error);
      throw error;
    }
  }

  // Gestion des alertes
  async createAlert(alertData: any) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .insert({
          user_id: alertData.userId,
          type: alertData.type,
          title: alertData.title,
          message: alertData.message,
          severity: alertData.severity,
          status: 'active',
          location_id: alertData.locationId,
          metadata: alertData.metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création alerte:', error);
      throw error;
    }
  }

  async updateAlert(alertId: string, updates: any) {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur mise à jour alerte:', error);
      throw error;
    }
  }

  async getActiveAlerts() {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select(`
          *,
          profiles (
            full_name,
            boat_name
          )
        `)
        .in('status', ['active', 'acknowledged'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération alertes:', error);
      throw error;
    }
  }

  // Gestion des messages
  async sendMessage(messageData: any) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: messageData.senderId,
          receiver_id: messageData.receiverId,
          channel_id: messageData.channelId,
          content: messageData.content,
          message_type: messageData.type || 'text',
          metadata: messageData.metadata,
          is_read: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur envoi message:', error);
      throw error;
    }
  }

  async getChannelMessages(channelId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!messages_sender_id_fkey (
            full_name,
            boat_name
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération messages:', error);
      throw error;
    }
  }

  // Gestion des zones
  async createZone(zoneData: any) {
    try {
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
          created_by: zoneData.createdBy,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création zone:', error);
      throw error;
    }
  }

  async getActiveZones() {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération zones:', error);
      throw error;
    }
  }

  // Gestion des sorties (trips)
  async createTrip(tripData: any) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: tripData.userId,
          start_time: tripData.startTime,
          start_location_id: tripData.startLocationId,
          weather_conditions: tripData.weatherConditions,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur création sortie:', error);
      throw error;
    }
  }

  async endTrip(tripId: string, endData: any) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .update({
          end_time: endData.endTime,
          end_location_id: endData.endLocationId,
          distance_km: endData.distance,
          max_speed: endData.maxSpeed,
          avg_speed: endData.avgSpeed,
          fuel_consumed: endData.fuelConsumed,
          catch_weight: endData.catchWeight,
          notes: endData.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', tripId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur fin de sortie:', error);
      throw error;
    }
  }

  async getUserTrips(userId: string, limit = 20) {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          start_location:locations!trips_start_location_id_fkey (
            latitude,
            longitude
          ),
          end_location:locations!trips_end_location_id_fkey (
            latitude,
            longitude
          )
        `)
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération sorties:', error);
      throw error;
    }
  }

  // Gestion de la météo
  async insertWeatherData(weatherData: any) {
    try {
      const { data, error } = await supabase
        .from('weather_data')
        .insert({
          location: `POINT(${weatherData.longitude} ${weatherData.latitude})`,
          temperature: weatherData.temperature,
          wind_speed: weatherData.windSpeed,
          wind_direction: weatherData.windDirection,
          wave_height: weatherData.waveHeight,
          visibility: weatherData.visibility,
          pressure: weatherData.pressure,
          humidity: weatherData.humidity,
          condition: weatherData.condition,
          icon: weatherData.icon,
          forecast_time: weatherData.forecastTime,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur insertion météo:', error);
      throw error;
    }
  }

  async getLatestWeather(latitude: number, longitude: number) {
    try {
      const { data, error } = await supabase
        .from('weather_data')
        .select('*')
        .order('forecast_time', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur récupération météo:', error);
      throw error;
    }
  }

  // Statistiques et analytics
  async getFleetStatistics() {
    try {
      const { data: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('role')
        .eq('role', 'fisherman');

      const { data: activeTrips, error: tripsError } = await supabase
        .from('trips')
        .select('id')
        .is('end_time', null);

      const { data: activeAlerts, error: alertsError } = await supabase
        .from('alerts')
        .select('id')
        .eq('status', 'active');

      const { data: recentLocations, error: locationsError } = await supabase
        .from('locations')
        .select('user_id')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (usersError || tripsError || alertsError || locationsError) {
        throw new Error('Erreur récupération statistiques');
      }

      return {
        totalFishermen: totalUsers?.length || 0,
        activeTrips: activeTrips?.length || 0,
        activeAlerts: activeAlerts?.length || 0,
        activePirogues: new Set(recentLocations?.map(l => l.user_id)).size || 0
      };
    } catch (error) {
      console.error('Erreur statistiques flotte:', error);
      throw error;
    }
  }
}

export const db = new DatabaseManager();