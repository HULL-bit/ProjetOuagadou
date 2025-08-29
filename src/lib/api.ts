import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configuration axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('pirogue_user');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login/', { email, password });
    return response.data;
  },
  
  register: async (userData: any) => {
    const response = await api.post('/auth/register/', userData);
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout/');
    return response.data;
  },
  
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },
  
  updateProfile: async (profileData: any) => {
    const response = await api.put('/auth/profile/', profileData);
    return response.data;
  }
};

export const trackingAPI = {
  updateLocation: async (locationData: any) => {
    const response = await api.post('/tracking/locations/', locationData);
    return response.data;
  },
  
  getLocations: async (params?: any) => {
    const response = await api.get('/tracking/locations/', { params });
    return response.data;
  },
  
  getTrips: async (userId?: string) => {
    const response = await api.get('/tracking/trips/', { 
      params: userId ? { user: userId } : {} 
    });
    return response.data;
  }
};

export const alertsAPI = {
  createAlert: async (alertData: any) => {
    const response = await api.post('/alerts/', alertData);
    return response.data;
  },
  
  getAlerts: async () => {
    const response = await api.get('/alerts/');
    return response.data;
  },
  
  acknowledgeAlert: async (alertId: string) => {
    const response = await api.patch(`/alerts/${alertId}/`, { status: 'acknowledged' });
    return response.data;
  }
};

export const communicationAPI = {
  sendMessage: async (messageData: any) => {
    const response = await api.post('/communication/messages/', messageData);
    return response.data;
  },
  
  getMessages: async (channelId?: string) => {
    const response = await api.get('/communication/messages/', {
      params: channelId ? { channel: channelId } : {}
    });
    return response.data;
  },
  
  uploadFile: async (file: File, folder: string = 'chat') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    
    const response = await api.post('/communication/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

export const zonesAPI = {
  getZones: async () => {
    const response = await api.get('/zones/');
    return response.data;
  },
  
  createZone: async (zoneData: any) => {
    const response = await api.post('/zones/', zoneData);
    return response.data;
  },
  
  updateZone: async (zoneId: string, zoneData: any) => {
    const response = await api.put(`/zones/${zoneId}/`, zoneData);
    return response.data;
  },
  
  deleteZone: async (zoneId: string) => {
    const response = await api.delete(`/zones/${zoneId}/`);
    return response.data;
  }
};

export const weatherAPI = {
  getCurrentWeather: async (lat?: number, lon?: number) => {
    const response = await api.get('/weather/current/', {
      params: lat && lon ? { lat, lon } : {}
    });
    return response.data;
  },
  
  getForecast: async (days: number = 3) => {
    const response = await api.get('/weather/forecast/', { params: { days } });
    return response.data;
  }
};

export default api;