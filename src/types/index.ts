export interface User {
  id: string;
  email: string;
  username: string;
  role: 'fisherman' | 'organization' | 'admin';
  profile: UserProfile;
}

export interface UserProfile {
  fullName: string;
  phone: string;
  boatName?: string;
  licenseNumber?: string;
  avatar?: string;
}

export interface Location {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  heading?: number;
}

export interface Zone {
  id: string;
  name: string;
  coordinates: [number, number][];
  type: 'safety' | 'fishing' | 'restricted';
  isActive: boolean;
}

export interface Alert {
  id: string;
  userId: string;
  type: 'emergency' | 'zone_violation' | 'weather' | 'system';
  message: string;
  location?: Location;
  status: 'active' | 'acknowledged' | 'resolved';
  createdAt: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId?: string;
  channelId?: string;
  content: string;
  type: 'text' | 'voice' | 'location' | 'image';
  timestamp: string;
  isRead: boolean;
}

export interface WeatherCondition {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  waveHeight: number;
  visibility: number;
  condition: string;
  icon: string;
  timestamp: string;
}

export interface Trip {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  startLocation: Location;
  endLocation?: Location;
  distance: number;
  maxSpeed: number;
  avgSpeed: number;
}