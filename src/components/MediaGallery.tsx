import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Video, 
  FileImage, 
  Download, 
  Trash2, 
  Plus, 
  Eye,
  Share2,
  Filter,
  Search,
  Grid,
  List,
  Heart,
  MessageCircle,
  Calendar,
  User,
  Image as ImageIcon,
  Play,
  FileText,
  Star,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';

interface MediaItem {
  id: string;
  type: 'image' | 'video' | 'document';
  name: string;
  url: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
  tags?: string[];
  likes?: number;
  comments?: number;
  isPublic?: boolean;
  category?: 'fishing' | 'boats' | 'ports' | 'weather' | 'events' | 'other';
  location?: {
    latitude: number;
    longitude: number;
    name: string;
  };
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    format?: string;
  };
}

interface MediaStats {
  total: number;
  images: number;
  videos: number;
  documents: number;
  totalSize: string;
  publicItems: number;
}

const MediaGallery: React.FC = () => {
  const { uploadFile } = useData();
  const { user } = useAuth();
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<MediaItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [stats, setStats] = useState<MediaStats>({
    total: 0,
    images: 0,
    videos: 0,
    documents: 0,
    totalSize: '0 MB',
    publicItems: 0
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMediaItems();
  }, []);

  useEffect(() => {
    filterMediaItems();
    updateStats();
  }, [mediaItems, searchTerm, filterType, filterCategory]);

  const loadMediaItems = async () => {
    // Charger les médias depuis le localStorage pour la persistance
    const savedMedia = localStorage.getItem('mediaGallery');
    if (savedMedia) {
      setMediaItems(JSON.parse(savedMedia));
    } else {
      // Données initiales
      const initialMedia: MediaItem[] = [
        {
          id: '1',
          type: 'image',
          name: 'pirogue_001.jpg',
          url: '/api/media/pirogue_001.jpg',
          size: '2.3 MB',
          uploadedAt: '2024-01-15',
          uploadedBy: 'Capitaine Diallo',
          description: 'Pirogue traditionnelle au port de Dakar',
          tags: ['pirogue', 'port', 'dakar', 'pêche'],
          likes: 12,
          comments: 3,
          isPublic: true,
          category: 'boats',
          location: {
            latitude: 14.7167,
            longitude: -17.4677,
            name: 'Port de Dakar'
          },
          metadata: {
            width: 1920,
            height: 1080,
            format: 'JPEG'
          }
        },
        {
          id: '2',
          type: 'video',
          name: 'sortie_peche.mp4',
          url: '/api/media/sortie_peche.mp4',
          size: '15.7 MB',
          uploadedAt: '2024-01-14',
          uploadedBy: 'Capitaine Ba',
          description: 'Sortie de pêche en mer',
          tags: ['pêche', 'mer', 'sortie'],
          likes: 8,
          comments: 2,
          isPublic: true,
          category: 'fishing',
          metadata: {
            duration: 120,
            format: 'MP4'
          }
        },
        {
          id: '3',
          type: 'image',
          name: 'port_saint_louis.jpg',
          url: '/api/media/port_saint_louis.jpg',
          size: '1.8 MB',
          uploadedAt: '2024-01-13',
          uploadedBy: 'Marin Sall',
          description: 'Port de Saint-Louis au coucher du soleil',
          tags: ['port', 'saint-louis', 'coucher-soleil'],
          likes: 15,
          comments: 5,
          isPublic: true,
          category: 'ports',
          location: {
            latitude: 16.0333,
            longitude: -16.5000,
            name: 'Port de Saint-Louis'
          },
          metadata: {
            width: 1920,
            height: 1080,
            format: 'JPEG'
          }
        }
      ];
      setMediaItems(initialMedia);
      localStorage.setItem('mediaGallery', JSON.stringify(initialMedia));
    }
  };

  const filterMediaItems = () => {
    let filtered = mediaItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = filterType === 'all' || item.type === filterType;
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      return matchesSearch && matchesType && matchesCategory;
    });
    setFilteredItems(filtered);
  };

  const updateStats = () => {
    const total = mediaItems.length;
    const images = mediaItems.filter(item => item.type === 'image').length;
    const videos = mediaItems.filter(item => item.type === 'video').length;
    const documents = mediaItems.filter(item => item.type === 'document').length;
    const publicItems = mediaItems.filter(item => item.isPublic).length;
    
    const totalSizeMB = mediaItems.reduce((sum, item) => {
      const size = parseFloat(item.size.replace(' MB', ''));
      return sum + size;
    }, 0);
    
    setStats({
      total,
      images,
      videos,
      documents,
      totalSize: `${totalSizeMB.toFixed(1)} MB`,
      publicItems
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        // Créer une URL persistante pour le fichier
        const fileId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const url = URL.createObjectURL(file);
        
        // Sauvegarder le fichier dans localStorage pour persistance
        const fileData = {
          id: fileId,
          file: file,
          url: url,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date().toISOString(),
          uploadedBy: user?.username || 'Utilisateur'
        };
        
        // Stocker les métadonnées du fichier
        const existingFiles = JSON.parse(localStorage.getItem('mediaFiles') || '[]');
        existingFiles.push({
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          url: url,
          uploadedAt: fileData.uploadedAt,
          uploadedBy: fileData.uploadedBy
        });
        localStorage.setItem('mediaFiles', JSON.stringify(existingFiles));
        
        const newMedia: MediaItem = {
          id: fileId,
          type: file.type.startsWith('image/') ? 'image' : 
                file.type.startsWith('video/') ? 'video' : 'document',
          name: file.name,
          url,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          uploadedAt: new Date().toISOString().split('T')[0],
          uploadedBy: user?.username || 'Utilisateur',
          description: `Fichier uploadé par ${user?.username}`,
          tags: [],
          likes: 0,
          comments: 0,
          isPublic: true,
          category: 'other',
          metadata: {
            format: file.type.split('/')[1].toUpperCase()
          }
        };
        
        const updatedItems = [newMedia, ...mediaItems];
        setMediaItems(updatedItems);
        localStorage.setItem('mediaGallery', JSON.stringify(updatedItems));
      }
    } catch (error) {
      console.error('Erreur upload:', error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (itemId: string) => {
    const updatedItems = mediaItems.filter(item => item.id !== itemId);
    setMediaItems(updatedItems);
    setSelectedItems(prev => prev.filter(id => id !== itemId));
    localStorage.setItem('mediaGallery', JSON.stringify(updatedItems));
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    const updatedItems = mediaItems.filter(item => !selectedItems.includes(item.id));
    setMediaItems(updatedItems);
    setSelectedItems([]);
    localStorage.setItem('mediaGallery', JSON.stringify(updatedItems));
  };

  const handleDownload = (item: MediaItem) => {
    try {
      // Récupérer le fichier depuis localStorage si disponible
      const mediaFiles = JSON.parse(localStorage.getItem('mediaFiles') || '[]');
      const fileData = mediaFiles.find((f: any) => f.id === item.id);
      
      if (fileData && fileData.url) {
        const link = document.createElement('a');
        link.href = fileData.url;
        link.download = item.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Fallback pour les fichiers existants
        const link = document.createElement('a');
        link.href = item.url;
        link.download = item.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      alert('Erreur lors du téléchargement du fichier');
    }
  };

  const handleLike = (itemId: string) => {
    const updatedItems = mediaItems.map(item => 
      item.id === itemId ? { ...item, likes: (item.likes || 0) + 1 } : item
    );
    setMediaItems(updatedItems);
    localStorage.setItem('mediaGallery', JSON.stringify(updatedItems));
  };

  const handleTogglePublic = (itemId: string) => {
    const updatedItems = mediaItems.map(item => 
      item.id === itemId ? { ...item, isPublic: !item.isPublic } : item
    );
    setMediaItems(updatedItems);
    localStorage.setItem('mediaGallery', JSON.stringify(updatedItems));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-4 h-4" />;
      case 'video': return <Play className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      default: return <FileImage className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'fishing': return 'bg-blue-100 text-blue-800';
      case 'boats': return 'bg-green-100 text-green-800';
      case 'ports': return 'bg-purple-100 text-purple-800';
      case 'weather': return 'bg-orange-100 text-orange-800';
      case 'events': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Galerie Média</h1>
        <p className="text-gray-600">Partagez et visualisez les photos, vidéos et documents de la communauté</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Médias</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileImage className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Images</p>
              <p className="text-2xl font-bold text-green-600">{stats.images}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Vidéos</p>
              <p className="text-2xl font-bold text-purple-600">{stats.videos}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Video className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Espace Utilisé</p>
              <p className="text-2xl font-bold text-orange-600">{stats.totalSize}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher dans la galerie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="image">Images</option>
            <option value="video">Vidéos</option>
            <option value="document">Documents</option>
          </select>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Toutes catégories</option>
            <option value="fishing">Pêche</option>
            <option value="boats">Bateaux</option>
            <option value="ports">Ports</option>
            <option value="weather">Météo</option>
            <option value="events">Événements</option>
            <option value="other">Autres</option>
          </select>
          
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </motion.button>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{uploading ? 'Upload...' : 'Ajouter'}</span>
          </motion.button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Actions en lot */}
      {selectedItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedItems.length} élément(s) sélectionné(s)
            </span>
            <div className="flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Grille des médias */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
        {filteredItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-xl shadow-md overflow-hidden ${viewMode === 'list' ? 'flex' : ''}`}
          >
            {viewMode === 'grid' ? (
              <div className="relative group">
                {item.type === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAxMDBDNTMuMzcyNiAxMDAgNDggOTQuNjI3NCA0OCA4OEM0OCA4MS4zNzI2IDUzLjM3MjYgNzYgNjAgNzZDNjYuNjI3NCA3NiA3MiA4MS4zNzI2IDcyIDg4QzcyIDk0LjYyNzQgNjYuNjI3NCAxMDAgNjAgMTAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTUyIDg4QzE1MiA5NC42Mjc0IDE0Ni42MjcgMTAwIDE0MCAxMDBDMTMzLjM3MyAxMDAgMTI4IDk0LjYyNzQgMTI4IDg4QzEyOCA4MS4zNzI2IDEzMy4zNzMgNzYgMTQwIDc2QzE0Ni42MjcgNzYgMTUyIDgxLjM3MjYgMTUyIDg4WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTUyIDEyOEMxNTIgMTM0LjYyNyAxNDYuNjI3IDE0MCAxNDAgMTQwQzEzMy4zNzMgMTQwIDEyOCAxMzQuNjI3IDEyOCAxMjhDMTI4IDEyMS4zNzMgMTMzLjM3MyAxMTYgMTQwIDExNkMxNDYuNjI3IDExNiAxNTIgMTIxLjM3MyAxNTIgMTI4WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNjAgMTQwQzUzLjM3MjYgMTQwIDQ4IDEzNC42MjcgNDggMTI4QzQ4IDEyMS4zNzMgNTMuMzcyNiAxMTYgNjAgMTE2QzY2LjYyNzQgMTE2IDcyIDEyMS4zNzMgNzIgMTI4QzcyIDEzNC42MjcgNjYuNjI3NCAxNDAgNjAgMTQwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                    }}
                  />
                ) : item.type === 'video' ? (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <Play className="w-12 h-12 text-gray-400" />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                    <FileText className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        setSelectedMedia(item);
                        setShowDetails(true);
                      }}
                      className="p-2 bg-white rounded-lg text-gray-900 hover:bg-gray-100"
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDownload(item)}
                      className="p-2 bg-white rounded-lg text-gray-900 hover:bg-gray-100"
                    >
                      <Download className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleLike(item.id)}
                      className="p-2 bg-white rounded-lg text-gray-900 hover:bg-gray-100"
                    >
                      <Heart className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems([...selectedItems, item.id]);
                      } else {
                        setSelectedItems(selectedItems.filter(id => id !== item.id));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4 p-4 w-full">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500">{item.size}</span>
                    <span className="text-xs text-gray-500">{item.uploadedBy}</span>
                    <span className="text-xs text-gray-500">{item.uploadedAt}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDownload(item)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                  >
                    <Download className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            )}
            
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900 truncate">{item.name}</h3>
                {item.category && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                )}
              </div>
              
              {item.description && (
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              )}
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <span>{item.uploadedBy}</span>
                  <span>{item.uploadedAt}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{item.likes || 0}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>{item.comments || 0}</span>
                  </span>
                </div>
              </div>
              
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                  {item.tags.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      +{item.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <FileImage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun média trouvé</h3>
          <p className="text-gray-600">Aucun média ne correspond à vos critères de recherche</p>
        </div>
      )}

      {/* Modal de détails */}
      <AnimatePresence>
        {showDetails && selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Détails du Média</h2>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    {selectedMedia.type === 'image' ? (
                      <img
                        src={selectedMedia.url}
                        alt={selectedMedia.name}
                        className="w-full rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCAxMDBDNTMuMzcyNiAxMDAgNDggOTQuNjI3NCA0OCA4OEM0OCA4MS4zNzI2IDUzLjM3MjYgNzYgNjAgNzZDNjYuNjI3NCA3NiA3MiA4MS4zNzI2IDcyIDg4QzcyIDk0LjYyNzQgNjYuNjI3NCAxMDAgNjAgMTAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTUyIDg4QzE1MiA5NC42Mjc0IDE0Ni42MjcgMTAwIDE0MCAxMDBDMTMzLjM3MyAxMDAgMTI4IDk0LjYyNzQgMTI4IDg4QzEyOCA4MS4zNzI2IDEzMy4zNzMgNzYgMTQwIDc2QzE0Ni42MjcgNzYgMTUyIDgxLjM3MjYgMTUyIDg4WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTUyIDEyOEMxNTIgMTM0LjYyNyAxNDYuNjI3IDE0MCAxNDAgMTQwQzEzMy4zNzMgMTQwIDEyOCAxMzQuNjI3IDEyOCAxMjhDMTI4IDEyMS4zNzMgMTMzLjM3MyAxMTYgMTQwIDExNkMxNDYuNjI3IDExNiAxNTIgMTIxLjM3MyAxNTIgMTI4WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNjAgMTQwQzUzLjM3MjYgMTQwIDQ4IDEzNC42MjcgNDggMTI4QzQ4IDEyMS4zNzMgNTMuMzcyNiAxMTYgNjAgMTE2QzY2LjYyNzQgMTE2IDcyIDEyMS4zNzMgNzIgMTI4QzcyIDEzNC42MjcgNjYuNjI3NCAxNDAgNjAgMTQwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                        }}
                      />
                    ) : selectedMedia.type === 'video' ? (
                      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Play className="w-16 h-16 text-gray-400" />
                      </div>
                    ) : (
                      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Informations</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Nom</label>
                        <p className="text-gray-900">{selectedMedia.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <p className="text-gray-900">{selectedMedia.description || 'Aucune description'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Uploadé par</label>
                        <p className="text-gray-900">{selectedMedia.uploadedBy}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Date</label>
                        <p className="text-gray-900">{selectedMedia.uploadedAt}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Taille</label>
                        <p className="text-gray-900">{selectedMedia.size}</p>
                      </div>
                      {selectedMedia.location && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">Localisation</label>
                          <p className="text-gray-900">{selectedMedia.location.name}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMedia.tags?.map((tag, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                            #{tag}
                          </span>
                        )) || <span className="text-gray-500">Aucun tag</span>}
                      </div>
                    </div>
                    
                    <div className="mt-6 flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDownload(selectedMedia)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Télécharger</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleLike(selectedMedia.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <Heart className="w-4 h-4" />
                        <span>{selectedMedia.likes || 0}</span>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaGallery;