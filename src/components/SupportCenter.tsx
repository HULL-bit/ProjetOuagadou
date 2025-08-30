import React, { useState } from 'react';
import { HelpCircle, MessageSquare, Phone, Mail, FileText, Send, Search, Book, Video, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'account' | 'billing' | 'feature' | 'bug';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  userId: string;
  assignedTo?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
}

const SupportCenter: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('faq');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: '1',
      title: 'Problème de géolocalisation',
      description: 'Ma position ne s\'affiche pas correctement sur la carte',
      category: 'technical',
      priority: 'medium',
      status: 'in_progress',
      createdAt: '2025-01-01T10:00:00Z',
      updatedAt: '2025-01-02T14:30:00Z',
      userId: user?.id || '',
      assignedTo: 'Support Technique'
    }
  ]);

  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    category: 'technical' as const,
    priority: 'medium' as const
  });

  const faqItems: FAQItem[] = [
    {
      id: '1',
      question: 'Comment activer la géolocalisation ?',
      answer: 'Pour activer la géolocalisation, cliquez sur "Autoriser" lorsque votre navigateur vous demande l\'accès à votre position. Vous pouvez aussi vérifier les paramètres de votre navigateur dans Paramètres > Confidentialité > Localisation.',
      category: 'Géolocalisation',
      helpful: 15
    },
    {
      id: '2',
      question: 'Comment envoyer une alerte d\'urgence ?',
      answer: 'Utilisez le bouton SOS rouge en bas à droite de l\'écran. Un compte à rebours de 5 secondes vous permettra d\'annuler si nécessaire. L\'alerte sera automatiquement envoyée avec votre position GPS.',
      category: 'Urgences',
      helpful: 23
    },
    {
      id: '3',
      question: 'Comment ajouter une nouvelle pirogue ?',
      answer: 'Seuls les administrateurs et organisations peuvent ajouter des pirogues. Allez dans la section "Pirogues" et cliquez sur "Ajouter une pirogue". Remplissez les informations requises.',
      category: 'Gestion',
      helpful: 8
    },
    {
      id: '4',
      question: 'Que faire si ma pirogue n\'apparaît pas sur la carte ?',
      answer: 'Vérifiez que votre géolocalisation est activée et que vous avez une connexion internet. Si le problème persiste, contactez le support technique.',
      category: 'Technique',
      helpful: 12
    }
  ];

  const filteredFAQ = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const ticket: SupportTicket = {
      id: Date.now().toString(),
      ...newTicket,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: user?.id || ''
    };

    setTickets(prev => [ticket, ...prev]);
    setNewTicket({
      title: '',
      description: '',
      category: 'technical',
      priority: 'medium'
    });
    setShowTicketForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'faq', label: 'FAQ', icon: Book },
    { id: 'tickets', label: 'Mes Tickets', icon: MessageSquare },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'resources', label: 'Ressources', icon: FileText }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Centre de Support</h1>
        <p className="text-gray-600">Aide, documentation et assistance technique</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-cyan-500 text-cyan-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'faq' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher dans la FAQ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-4">
                {filteredFAQ.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">{item.question}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">{item.answer}</p>
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {item.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.helpful} personnes ont trouvé cela utile
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'tickets' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Mes Tickets de Support</h3>
                <button
                  onClick={() => setShowTicketForm(true)}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau ticket</span>
                </button>
              </div>

              <div className="space-y-4">
                {tickets.map((ticket, index) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{ticket.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Créé le {new Date(ticket.createdAt).toLocaleDateString('fr-FR')}</span>
                      {ticket.assignedTo && <span>Assigné à {ticket.assignedTo}</span>}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Contactez-nous</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <Phone className="w-5 h-5 text-cyan-600" />
                      <div>
                        <p className="font-medium text-gray-900">Téléphone</p>
                        <p className="text-sm text-gray-600">+221 77 123 4567</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <Mail className="w-5 h-5 text-cyan-600" />
                      <div>
                        <p className="font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-600">support@pirogue-connect.sn</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <MessageSquare className="w-5 h-5 text-cyan-600" />
                      <div>
                        <p className="font-medium text-gray-900">Chat en direct</p>
                        <p className="text-sm text-gray-600">Disponible 24h/24</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Horaires de support</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Lundi - Vendredi:</span>
                      <span className="font-medium">8h00 - 18h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Samedi:</span>
                      <span className="font-medium">9h00 - 15h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimanche:</span>
                      <span className="font-medium">Urgences uniquement</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span>Urgences 24h/24:</span>
                      <span className="font-medium text-red-600">+221 77 999 9999</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'resources' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold text-gray-900">Ressources et Documentation</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Book className="w-5 h-5 text-blue-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Guide d'utilisation</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Manuel complet d'utilisation de la plateforme Pirogue Connect
                  </p>
                  <button className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 text-sm">
                    <Download className="w-4 h-4" />
                    <span>Télécharger PDF</span>
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-green-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Tutoriels vidéo</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Vidéos explicatives pour maîtriser toutes les fonctionnalités
                  </p>
                  <button className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 text-sm">
                    <Play className="w-4 h-4" />
                    <span>Voir les vidéos</span>
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-purple-600" />
                    </div>
                    <h4 className="font-medium text-gray-900">Documentation API</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Documentation technique pour les développeurs et intégrateurs
                  </p>
                  <button className="flex items-center space-x-2 text-cyan-600 hover:text-cyan-700 text-sm">
                    <Eye className="w-4 h-4" />
                    <span>Consulter</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal de création de ticket */}
      <AnimatePresence>
        {showTicketForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Créer un ticket de support</h3>
                
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre *
                    </label>
                    <input
                      type="text"
                      required
                      value={newTicket.title}
                      onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Résumé du problème"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      required
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder="Décrivez votre problème en détail..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catégorie
                      </label>
                      <select
                        value={newTicket.category}
                        onChange={(e) => setNewTicket({...newTicket, category: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        <option value="technical">Technique</option>
                        <option value="account">Compte</option>
                        <option value="feature">Fonctionnalité</option>
                        <option value="bug">Bug</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priorité
                      </label>
                      <select
                        value={newTicket.priority}
                        onChange={(e) => setNewTicket({...newTicket, priority: e.target.value as any})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      >
                        <option value="low">Faible</option>
                        <option value="medium">Moyenne</option>
                        <option value="high">Élevée</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowTicketForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 flex items-center justify-center space-x-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>Envoyer</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SupportCenter;