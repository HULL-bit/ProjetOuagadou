import React from 'react';
import { Ship, Users, AlertTriangle, TrendingUp, MapPin, Clock, Anchor, Waves, Wind, Eye, Thermometer } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import MapView from './MapView';
import WeatherWidget from './WeatherWidget';
import AlertsPanel from './AlertsPanel';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { locations, alerts, weather } = useData();

  // Calculate statistics
  const activeBoats = new Set(locations.map(loc => loc.userId)).size;
  const activeAlerts = alerts.filter(alert => alert.status === 'active').length;
  const emergencyAlerts = alerts.filter(alert => alert.type === 'emergency' && alert.status === 'active').length;

  const getDashboardStats = () => {
    switch (user?.role) {
      case 'fisherman':
        return [
          {
            title: 'Statut Sortie',
            value: 'En Mer',
            icon: Ship,
            color: 'from-blue-500 to-cyan-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            description: 'Départ 06:30',
            trend: '+2h depuis hier'
          },
          {
            title: 'Distance Parcourue',
            value: '12.5 km',
            icon: MapPin,
            color: 'from-green-500 to-emerald-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-50',
            description: 'Depuis le départ',
            trend: '+3.2km vs moyenne'
          },
          {
            title: 'Temps en Mer',
            value: '4h 23m',
            icon: Clock,
            color: 'from-purple-500 to-violet-500',
            textColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
            description: 'Session actuelle',
            trend: 'Optimal'
          },
          {
            title: 'Conditions Mer',
            value: weather ? `${weather.waveHeight}m` : '...',
            icon: Waves,
            color: 'from-cyan-500 to-blue-500',
            textColor: 'text-cyan-600',
            bgColor: 'bg-cyan-50',
            description: 'Houle moyenne',
            trend: 'Favorable'
          }
        ];

      case 'organization':
        return [
          {
            title: 'Pirogues Actives',
            value: activeBoats.toString(),
            icon: Ship,
            color: 'from-blue-500 to-cyan-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            description: 'En mer actuellement',
            trend: '+3 vs hier'
          },
          {
            title: 'Alertes Actives',
            value: activeAlerts.toString(),
            icon: AlertTriangle,
            color: 'from-orange-500 to-red-500',
            textColor: 'text-orange-600',
            bgColor: 'bg-orange-50',
            description: 'Nécessitent attention',
            trend: activeAlerts > 0 ? 'Action requise' : 'Tout va bien'
          },
          {
            title: 'Urgences',
            value: emergencyAlerts.toString(),
            icon: AlertTriangle,
            color: 'from-red-500 to-pink-500',
            textColor: 'text-red-600',
            bgColor: 'bg-red-50',
            description: 'Interventions requises',
            trend: emergencyAlerts === 0 ? 'Aucune urgence' : 'Intervention requise'
          },
          {
            title: 'Pêcheurs Inscrits',
            value: '47',
            icon: Users,
            color: 'from-green-500 to-emerald-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-50',
            description: 'Total actifs',
            trend: '+2 ce mois'
          }
        ];

      case 'admin':
        return [
          {
            title: 'Système',
            value: '99.8%',
            icon: TrendingUp,
            color: 'from-green-500 to-emerald-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-50',
            description: 'Disponibilité',
            trend: '+0.2% ce mois'
          },
          {
            title: 'Utilisateurs',
            value: '52',
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            description: 'Connectés aujourd\'hui',
            trend: '+8 vs hier'
          },
          {
            title: 'Alertes Système',
            value: '2',
            icon: AlertTriangle,
            color: 'from-yellow-500 to-orange-500',
            textColor: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            description: 'Maintenance requise',
            trend: 'Non critique'
          },
          {
            title: 'Base de Données',
            value: '2.1 GB',
            icon: TrendingUp,
            color: 'from-purple-500 to-violet-500',
            textColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
            description: 'Taille actuelle',
            trend: '+150MB ce mois'
          }
        ];

      default:
        return [];
    }
  };

  const stats = getDashboardStats();

  const getRoleSpecificWelcome = () => {
    switch (user?.role) {
      case 'fisherman':
        return {
          title: `Bienvenue à bord, ${user.profile.fullName}`,
          subtitle: 'Votre tableau de bord intelligent pour une navigation moderne et sécurisée',
          accent: user.profile.boatName ? `Pirogue ${user.profile.boatName}` : '',
          bgImage: 'https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?auto=compress&cs=tinysrgb&w=1920&h=400&fit=crop'
        };
      case 'organization':
        return {
          title: 'Centre de Coordination Intelligent',
          subtitle: 'Surveillance avancée et gestion optimisée de la flotte',
          accent: 'Cayar - Sénégal',
          bgImage: 'https://images.pexels.com/photos/1001682/pexels-photo-1001682.jpeg?auto=compress&cs=tinysrgb&w=1920&h=400&fit=crop'
        };
      case 'admin':
        return {
          title: 'Administration PIROGUE-SMART',
          subtitle: 'Monitoring intelligent et configuration avancée',
          accent: 'Système Intelligent',
          bgImage: 'https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=1920&h=400&fit=crop'
        };
      default:
        return {
          title: 'PIROGUE-SMART',
          subtitle: 'Plateforme intelligente de gestion maritime',
          accent: '',
          bgImage: 'https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?auto=compress&cs=tinysrgb&w=1920&h=400&fit=crop'
        };
    }
  };

  const welcome = getRoleSpecificWelcome();

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-full">
      {/* Enhanced welcome header with background image */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-2xl overflow-hidden shadow-2xl"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url('${welcome.bgImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/90 to-blue-600/90" />
        
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-3xl font-bold mb-3"
              >
                {welcome.title}
              </motion.h1>
              <motion.p 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-cyan-100 mb-2 text-lg"
              >
                {welcome.subtitle}
              </motion.p>
              {welcome.accent && (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="flex items-center"
                >
                  <Anchor className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                    {welcome.accent}
                  </span>
                </motion.div>
              )}
            </div>
            
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-right"
            >
              <p className="text-cyan-100 text-sm mb-1">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-white font-bold text-2xl">
                {new Date().toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              {weather && (
                <div className="mt-2 text-sm text-cyan-100">
                  <div className="flex items-center justify-end space-x-4">
                    <div className="flex items-center">
                      <Thermometer className="w-4 h-4 mr-1" />
                      {weather.temperature}°C
                    </div>
                    <div className="flex items-center">
                      <Wind className="w-4 h-4 mr-1" />
                      {weather.windSpeed} kt
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Enhanced statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.6 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${stat.bgColor} ${stat.textColor}`}>
                  {stat.trend}
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-gray-500 text-xs">{stat.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Enhanced map view */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="lg:col-span-2"
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Carte Marine - Temps Réel</h2>
                  <p className="text-sm text-gray-600">Positions des pirogues et zones de sécurité</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">En direct</span>
                </div>
              </div>
            </div>
            <div className="h-96">
              <MapView className="h-full" />
            </div>
          </div>
        </motion.div>

        {/* Enhanced right sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="space-y-6"
        >
          {/* Weather widget */}
          <WeatherWidget />
          
          {/* Alerts panel */}
          <AlertsPanel />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;