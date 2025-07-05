import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Image, MapPin, Paperclip, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState('general');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { messages, sendMessage, uploadFile, users } = useData();
  const { user } = useAuth();

  // Filtrer les messages par canal
  const filteredMessages = messages.filter(msg => {
    if (activeChannel === 'general') {
      return msg.channelId === 'general' || !msg.channelId;
    }
    return msg.channelId === activeChannel;
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredMessages]);

  // Fonction pour obtenir le nom complet d'un utilisateur
  const getUserFullName = (userId: string): string => {
    if (userId === user?.id) {
      return user.profile.fullName;
    }
    
    const foundUser = users.find(u => u.id === userId);
    if (foundUser) {
      return foundUser.profile.fullName;
    }
    
    return `Utilisateur ${userId.slice(-4)}`;
  };

  // Fonction pour obtenir l'avatar d'un utilisateur
  const getUserAvatar = (userId: string): string | null => {
    if (userId === user?.id) {
      return user.profile.avatar || null;
    }
    
    const foundUser = users.find(u => u.id === userId);
    return foundUser?.profile.avatar || null;
  };

  // Fonction pour obtenir les initiales d'un utilisateur
  const getUserInitials = (userId: string): string => {
    const fullName = getUserFullName(userId);
    const names = fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return fullName.charAt(0).toUpperCase();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!message.trim() && !selectedImage) || !user) return;

    try {
      let messageContent = message.trim();
      let messageType: 'text' | 'image' | 'location' = 'text';
      let metadata = null;

      // Upload image if selected
      if (selectedImage) {
        try {
          const imagePath = `chat-images/${Date.now()}-${selectedImage.name}`;
          const imageUrl = await uploadFile(selectedImage, 'chat-files', imagePath);
          
          if (message.trim()) {
            messageContent = `${message.trim()}\n📷 Image partagée`;
            metadata = { imageUrl, originalName: selectedImage.name };
          } else {
            messageContent = '📷 Image partagée';
            messageType = 'image';
            metadata = { imageUrl, originalName: selectedImage.name };
          }
        } catch (error) {
          console.error('Erreur upload image:', error);
          messageContent = message.trim() || '❌ Erreur lors du partage d\'image';
        }
      }

      await sendMessage({
        senderId: user.id,
        channelId: activeChannel,
        content: messageContent,
        type: messageType,
        metadata
      });

      setMessage('');
      setSelectedImage(null);
      setImagePreview(null);
    } catch (error) {
      console.error('Erreur envoi message:', error);
    }
  };

  const handleSendLocation = () => {
    if (!user) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        sendMessage({
          senderId: user.id,
          channelId: activeChannel,
          content: `📍 Position partagée: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
          type: 'location',
          metadata: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          }
        });
      }, (error) => {
        console.error('Erreur géolocalisation:', error);
        sendMessage({
          senderId: user.id,
          channelId: activeChannel,
          content: '❌ Impossible de partager la position',
          type: 'text'
        });
      });
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('L\'image ne doit pas dépasser 5MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const channels = [
    { id: 'general', name: 'Canal Général', icon: '💬', color: 'bg-blue-500' },
    { id: 'emergency', name: 'Urgences', icon: '🚨', color: 'bg-red-500' },
    { id: 'weather', name: 'Météo', icon: '🌊', color: 'bg-cyan-500' },
    { id: 'coordination', name: 'Coordination', icon: '⚓', color: 'bg-green-500' }
  ];

  const currentChannel = channels.find(ch => ch.id === activeChannel);
  const unreadCount = filteredMessages.filter(msg => !msg.isRead && msg.senderId !== user?.id).length;

  if (!isOpen) {
    return (
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 left-6 z-30"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-2xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 relative"
          title="Ouvrir le chat"
        >
          <MessageCircle className="w-7 h-7" />
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-xs font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </div>
          )}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 20 }}
      className="fixed bottom-6 left-6 z-30 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className={`${currentChannel?.color || 'bg-cyan-600'} text-white p-4 flex items-center justify-between`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-lg">{currentChannel?.icon || '💬'}</span>
          </div>
          <div>
            <span className="font-semibold">Communication</span>
            <p className="text-xs opacity-90">{currentChannel?.name}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-xs opacity-75">
            <Users className="w-3 h-3 mr-1" />
            <span>{users.length}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(false)}
            className="hover:bg-white/20 rounded-full p-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Channel selector */}
      <div className="border-b border-gray-200 p-3">
        <select
          value={activeChannel}
          onChange={(e) => setActiveChannel(e.target.value)}
          className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-white"
        >
          {channels.map(channel => (
            <option key={channel.id} value={channel.id}>
              {channel.icon} {channel.name}
            </option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        <AnimatePresence>
          {filteredMessages.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-gray-500 text-sm py-12"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <p className="font-medium">Aucun message dans ce canal</p>
              <p className="text-xs mt-1">Soyez le premier à envoyer un message</p>
            </motion.div>
          ) : (
            filteredMessages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start space-x-2 max-w-xs ${msg.senderId === user?.id ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {/* Avatar de l'utilisateur */}
                  {msg.senderId !== user?.id && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 flex items-center justify-center">
                        {getUserAvatar(msg.senderId) ? (
                          <img 
                            src={getUserAvatar(msg.senderId)!} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-xs font-bold">
                            {getUserInitials(msg.senderId)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div
                    className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
                      msg.senderId === user?.id
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    {/* Nom de l'expéditeur pour les messages reçus */}
                    {msg.senderId !== user?.id && (
                      <p className="text-xs font-semibold mb-1 opacity-75">
                        {getUserFullName(msg.senderId)}
                      </p>
                    )}
                    
                    {/* Contenu du message */}
                    {msg.type === 'location' ? (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs">{msg.content}</span>
                      </div>
                    ) : msg.type === 'image' && msg.metadata?.imageUrl ? (
                      <div className="space-y-2">
                        <img 
                          src={msg.metadata.imageUrl} 
                          alt="Image partagée"
                          className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90"
                          onClick={() => window.open(msg.metadata.imageUrl, '_blank')}
                        />
                        {msg.content !== '📷 Image partagée' && (
                          <p>{msg.content.replace('\n📷 Image partagée', '')}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p>{msg.content}</p>
                        {msg.metadata?.imageUrl && (
                          <img 
                            src={msg.metadata.imageUrl} 
                            alt="Image partagée"
                            className="mt-2 max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90"
                            onClick={() => window.open(msg.metadata.imageUrl, '_blank')}
                          />
                        )}
                      </div>
                    )}
                    
                    {/* Timestamp */}
                    <p className={`text-xs mt-2 ${msg.senderId === user?.id ? 'text-cyan-100' : 'text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="relative inline-block">
            <img 
              src={imagePreview} 
              alt="Aperçu" 
              className="h-20 w-20 object-cover rounded-lg"
            />
            <button
              onClick={removeSelectedImage}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <form onSubmit={handleSendMessage} className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tapez votre message..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-50"
            />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={!message.trim() && !selectedImage}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white p-3 rounded-xl hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-colors"
              title="Ajouter une image"
            >
              <Image className="w-5 h-5" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              type="button"
              onClick={handleSendLocation}
              className="p-2 text-gray-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-colors"
              title="Partager ma position"
            >
              <MapPin className="w-5 h-5" />
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ChatWidget;