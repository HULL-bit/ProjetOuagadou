import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Variables Supabase manquantes, utilisation du mode démo');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Helper functions pour les opérations Supabase
export const supabaseHelpers = {
  // Gestion des utilisateurs
  async createUserProfile(userData: any) {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userData.id,
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
  },

  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, updates: any) {
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
  },

  async deleteProfile(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  },

  // Gestion des positions
  async insertLocation(location: any) {
    const { data, error } = await supabase
      .from('locations')
      .insert({
        user_id: location.userId,
        latitude: location.latitude,
        longitude: location.longitude,
        speed: location.speed,
        heading: location.heading,
        accuracy: location.accuracy,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getRecentLocations(limit = 100) {
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
    return data || [];
  },

  // Gestion des alertes
  async createAlert(alert: any) {
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        user_id: alert.userId,
        type: alert.type,
        title: alert.type.toUpperCase(),
        message: alert.message,
        severity: alert.severity,
        status: 'active',
        location_id: alert.locationId,
        metadata: alert.metadata,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getActiveAlerts() {
    const { data, error } = await supabase
      .from('alerts')
      .select(`
        *,
        profiles (
          full_name,
          boat_name
        ),
        locations (
          latitude,
          longitude
        )
      `)
      .in('status', ['active', 'acknowledged'])
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateAlert(alertId: string, updates: any) {
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
  },

  // Gestion des messages
  async sendMessage(message: any) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: message.senderId,
        receiver_id: message.receiverId,
        channel_id: message.channelId,
        content: message.content,
        message_type: message.type || 'text',
        metadata: message.metadata,
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getChannelMessages(channelId: string, limit = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        profiles!messages_sender_id_fkey (
          full_name,
          boat_name,
          avatar_url
        )
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  },

  // Gestion des zones
  async getActiveZones() {
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Gestion des sorties
  async createTrip(trip: any) {
    const { data, error } = await supabase
      .from('trips')
      .insert({
        user_id: trip.userId,
        start_time: trip.startTime,
        start_location_id: trip.startLocationId,
        weather_conditions: trip.weatherConditions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserTrips(userId: string, limit = 20) {
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
    return data || [];
  },

  // Upload de fichiers
  async uploadFile(file: File, bucket: string, path: string) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (error) throw error;
    return data;
  },

  async getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  // Statistiques de flotte
  async getFleetStatistics() {
    try {
      const [usersResult, tripsResult, alertsResult, locationsResult] = await Promise.all([
        supabase.from('profiles').select('role').eq('role', 'fisherman'),
        supabase.from('trips').select('id').is('end_time', null),
        supabase.from('alerts').select('id').eq('status', 'active'),
        supabase.from('locations').select('user_id').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ]);

      return {
        totalFishermen: usersResult.data?.length || 0,
        activeTrips: tripsResult.data?.length || 0,
        activeAlerts: alertsResult.data?.length || 0,
        activePirogues: new Set(locationsResult.data?.map(l => l.user_id)).size || 0
      };
    } catch (error) {
      console.error('Erreur statistiques flotte:', error);
      return {
        totalFishermen: 0,
        activeTrips: 0,
        activeAlerts: 0,
        activePirogues: 0
      };
    }
  }
};