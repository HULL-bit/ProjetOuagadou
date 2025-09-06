import React from 'react';
import { Ship, Users, AlertTriangle, TrendingUp, MapPin, Clock, Anchor, Waves, Wind, Thermometer } from 'lucide-react';
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
            value: trips.find(t => t.userId === user.id && !t.endTime) ? 'En Mer' : 'Au Port',
            icon: Ship,
            color: 'from-blue-500 to-cyan-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            description: trips.find(t => t.userId === user.id && !t.endTime) ? 'Sortie en cours' : 'Prêt à partir',
            trend: trips.filter(t => t.userId === user.id).length + ' sorties total'
          },
          {
            title: 'Distance Parcourue',
            value: `${trips.filter(t => t.userId === user.id).reduce((sum, t) => sum + (t.distance || 0), 0).toFixed(1)} km`,
            icon: MapPin,
            color: 'from-green-500 to-emerald-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-50',
            description: 'Distance totale',
            trend: 'Toutes sorties'
          },
          {
            title: 'Temps en Mer',
            value: `${Math.floor(trips.filter(t => t.userId === user.id && t.endTime).reduce((sum, t) => {
              const start = new Date(t.startTime);
              const end = new Date(t.endTime!);
              return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            }, 0))}h`,
            icon: Clock,
            color: 'from-purple-500 to-violet-500',
            textColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
            description: 'Temps total',
            trend: 'Toutes sorties'
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
            value: users.filter(u => u.role === 'fisherman').length.toString(),
            icon: Ship,
            color: 'from-blue-500 to-cyan-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            description: 'Pirogues enregistrées',
            trend: 'Flotte totale'
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
            value: users.filter(u => u.role === 'fisherman').length.toString(),
            icon: Users,
            color: 'from-green-500 to-emerald-500',
            textColor: 'text-green-600',
            bgColor: 'bg-green-50',
            description: 'Total actifs',
            trend: 'Communauté'
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
            value: users.length.toString(),
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            textColor: 'text-blue-600',
            bgColor: 'bg-blue-50',
            description: 'Total inscrits',
            trend: 'Plateforme'
          },
          {
            title: 'Alertes Système',
            value: alerts.filter(a => a.type === 'system' && a.status === 'active').length.toString(),
            icon: AlertTriangle,
            color: 'from-yellow-500 to-orange-500',
            textColor: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            description: 'Maintenance requise',
            trend: 'Non critique'
          },
          {
            title: 'Base de Données',
            value: `${(locations.length + messages.length + alerts.length)} entrées`,
            icon: TrendingUp,
            color: 'from-purple-500 to-violet-500',
            textColor: 'text-purple-600',
            bgColor: 'bg-purple-50',
            description: 'Données stockées',
            trend: 'Croissance normale'
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
                  title: `Bienvenue à bord, ${user.profile.full_name}`,
        subtitle: 'Votre tableau de bord intelligent pour une navigation moderne et sécurisée',
        accent: user.profile.boat_name ? `Pirogue ${user.profile.boat_name}` : '',
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
    <div className="p-8 space-y-8 min-h-full">
      {/* Ultra-modern welcome header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-white/80 backdrop-blur-2xl rounded-3xl overflow-hidden shadow-2xl border border-white/20"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-cyan-50/80" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-200/20 via-blue-200/10 to-transparent rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-blue-200/20 via-cyan-200/10 to-transparent rounded-full translate-y-36 -translate-x-36" />
        
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="flex items-center space-x-4 mb-6"
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                    <Ship className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  </div>
                </div>
                <div>
                  <motion.h1 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent"
                  >
                    {welcome.title}
                  </motion.h1>
                  <motion.p 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="text-slate-600 text-lg mt-1"
                  >
                    {welcome.subtitle}
                  </motion.p>
                </div>
              </motion.div>
              
              {welcome.accent && (
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                  className="flex items-center"
                >
                  <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-sm border border-cyan-200/30 px-4 py-2 rounded-full flex items-center space-x-2">
                    <Anchor className="w-4 h-4 text-cyan-600" />
                    <span className="text-sm font-semibold text-slate-700">
                      {welcome.accent}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
            
            <motion.div 
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-right bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 shadow-lg"
            >
              <p className="text-slate-500 text-sm mb-2 font-medium">
                {new Date().toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              <p className="text-slate-800 font-bold text-3xl mb-3">
                {new Date().toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              {weather && (
                <div className="flex items-center justify-end space-x-4 text-sm">
                  <div className="flex items-center bg-cyan-50/80 px-3 py-1.5 rounded-lg border border-cyan-200/30">
                    <Thermometer className="w-4 h-4 mr-1.5 text-cyan-600" />
                    <span className="font-semibold text-slate-700">{weather.temperature}°C</span>
                  </div>
                  <div className="flex items-center bg-blue-50/80 px-3 py-1.5 rounded-lg border border-blue-200/30">
                    <Wind className="w-4 h-4 mr-1.5 text-blue-600" />
                    <span className="font-semibold text-slate-700">{weather.windSpeed} kt</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Ultra-premium statistics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 * index, duration: 0.8, type: "spring", stiffness: 100 }}
              whileHover={{ y: -8, scale: 1.03 }}
              className="group bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 relative overflow-hidden"
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-slate-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Floating decoration */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-cyan-200/10 to-blue-200/10 rounded-full blur-2xl" />
              
              <div className="relative p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className={`relative p-3 rounded-2xl bg-gradient-to-r ${stat.color} shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
                    <Icon className="w-6 h-6 text-white relative z-10" />
                    <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${stat.bgColor} ${stat.textColor} bg-opacity-80 backdrop-blur-sm`}>
                    {stat.trend}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-slate-600 text-sm font-semibold uppercase tracking-wide">{stat.title}</p>
                  <p className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-slate-500 text-sm">{stat.description}</p>
                </div>
                
                {/* Progress indicator */}
                <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                    initial={{ width: 0 }}
                    animate={{ width: `${60 + (index * 10)}%` }}
                    transition={{ delay: 0.5 + (index * 0.1), duration: 1 }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Premium main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ultra-modern map view */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="lg:col-span-2"
        >
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 group hover:shadow-3xl transition-all duration-500">
            <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50/80 to-blue-50/40 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                    Carte Marine - Temps Réel
                  </h2>
                  <p className="text-slate-600">Positions des pirogues et zones de sécurité</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 bg-green-50/80 px-3 py-1 rounded-full border border-green-200/30">
                    En direct
                  </span>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="h-[480px] relative">
              <MapView className="h-full" />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/5 via-transparent to-transparent"></div>
            </div>
          </div>
        </motion.div>

        {/* Premium right sidebar */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="space-y-6"
        >
          {/* Enhanced weather widget */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="transition-all duration-300"
          >
            <WeatherWidget />
          </motion.div>
          
          {/* Enhanced alerts panel */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className="transition-all duration-300"
          >
            <AlertsPanel />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;