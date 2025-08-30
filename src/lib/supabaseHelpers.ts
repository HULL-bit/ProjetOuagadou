import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const supabaseHelpers = {
  // Profiles
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async createUserProfile(profileData: any) {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, profileData: any) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...profileData, updated_at: new Date().toISOString() })
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
  },

  // Locations
  async insertLocation(locationData: any) {
    const { data, error } = await supabase
      .from('locations')
      .insert({
        user_id: locationData.userId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        speed: locationData.speed,
        heading: locationData.heading,
        altitude: locationData.altitude,
        accuracy: locationData.accuracy,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getRecentLocations(limit: number = 100) {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Messages
  async insertMessage(messageData: any) {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: messageData.senderId,
        receiver_id: messageData.receiverId,
        channel_id: messageData.channelId || 'general',
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
  },

  async getChannelMessages(channelId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  // Alerts
  async insertAlert(alertData: any) {
    const { data, error } = await supabase
      .from('alerts')
      .insert({
        user_id: alertData.userId,
        type: alertData.type,
        title: alertData.title || alertData.message,
        message: alertData.message,
        severity: alertData.severity || 'medium',
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
  },

  async updateAlertStatus(alertId: string, status: string) {
    const { data, error } = await supabase
      .from('alerts')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', alertId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Zones
  async getActiveZones() {
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Trips
  async getUserTrips(userId: string) {
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        start_location:locations!trips_start_location_id_fkey(*),
        end_location:locations!trips_end_location_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('start_time', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Fleet Statistics
  async getFleetStatistics() {
    const { data: locations, error: locError } = await supabase
      .from('locations')
      .select('user_id, created_at')
      .gte('created_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString());

    const { data: alerts, error: alertError } = await supabase
      .from('alerts')
      .select('*')
      .eq('status', 'active');

    if (locError || alertError) throw locError || alertError;

    const activeBoats = new Set(locations?.map(loc => loc.user_id)).size || 0;
    const activeAlerts = alerts?.length || 0;

    return {
      activeBoats,
      activeAlerts,
      totalLocations: locations?.length || 0
    };
  },

  // File Upload
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

  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  },

  // Weather Data
  async insertWeatherData(weatherData: any) {
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
        forecast_time: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};