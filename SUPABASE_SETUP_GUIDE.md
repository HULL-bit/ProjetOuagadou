# 🚀 Guide de Configuration Supabase - Pirogue Connect

## 📋 Prérequis

### 1. Créer un Compte Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un compte gratuit
3. Cliquer sur "New Project"

### 2. Configuration du Projet
```
Nom du projet: pirogue-connect
Mot de passe base: [choisir un mot de passe fort]
Région: Europe (West) - plus proche du Sénégal
```

## 🔧 Configuration de la Base de Données

### 1. Récupérer les Clés API
Dans le dashboard Supabase :
1. Aller dans **Settings > API**
2. Copier :
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon public key** (commence par `eyJ...`)

### 2. Configurer les Variables d'Environnement
Créer le fichier `.env.local` :
```env
VITE_SUPABASE_URL=https://votre-projet-id.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-ici
VITE_DEMO_MODE=false
```

### 3. Exécuter les Migrations SQL

#### Étape 1 : Schéma Principal
1. Dans Supabase Dashboard, aller dans **SQL Editor**
2. Créer une nouvelle query
3. Copier-coller le contenu COMPLET du fichier :
   `supabase/migrations/20250702131712_broad_silence.sql`
4. Cliquer **"Run"** pour exécuter

#### Étape 2 : Données d'Exemple
1. Créer une nouvelle query
2. Copier-coller le contenu COMPLET du fichier :
   `supabase/migrations/20250702131751_ancient_waterfall.sql`
3. Cliquer **"Run"** pour exécuter

### 4. Configurer le Storage (Optionnel)
Pour les uploads d'images et fichiers :

1. Aller dans **Storage** dans le dashboard
2. Créer les buckets suivants :
   - `avatars` (public)
   - `chat-files` (public)

#### Configuration des Politiques Storage
```sql
-- Politique pour les avatars
CREATE POLICY "Avatar uploads are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politique pour les fichiers de chat
CREATE POLICY "Chat files are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-files');

CREATE POLICY "Users can upload chat files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);
```

## 🚀 Lancement de l'Application

### 1. Installation des Dépendances
```bash
npm install
```

### 2. Démarrage du Serveur
```bash
npm run dev
```

### 3. Accès à l'Application
Ouvrir [http://localhost:5173](http://localhost:5173)

## 🧪 Test de la Configuration

### 1. Vérification de la Connexion
L'application affichera automatiquement :
- ✅ "Connexion Supabase établie" si tout fonctionne
- ⚠️ "Mode démo" si la configuration est incomplète

### 2. Comptes de Test
Créer des comptes via l'interface d'inscription ou utiliser :
- **Email** : `test@example.com`
- **Mot de passe** : `password123`

### 3. Fonctionnalités à Tester
- ✅ Authentification et inscription
- ✅ Gestion des profils
- ✅ Chat temps réel
- ✅ Géolocalisation
- ✅ Alertes et notifications
- ✅ Upload d'images
- ✅ Gestion des utilisateurs (Admin/Organisation)

## 📊 Vérification des Tables

Dans **Table Editor**, vérifier que ces tables existent :
- `profiles` - Profils utilisateurs
- `locations` - Positions GPS
- `alerts` - Système d'alertes
- `messages` - Messagerie
- `zones` - Zones géographiques
- `trips` - Historique des sorties
- `channels` - Canaux de communication
- `weather_data` - Données météo

## 🔄 Temps Réel

### Configuration Realtime
Les subscriptions temps réel sont automatiquement configurées pour :
- **Messages** - Chat instantané
- **Alertes** - Notifications en direct
- **Positions** - Tracking GPS

### Test du Temps Réel
1. Ouvrir l'application dans 2 onglets
2. Se connecter avec des comptes différents
3. Envoyer un message dans le chat
4. Vérifier la réception instantanée

## 🚨 Résolution de Problèmes

### Erreur : "Variables Supabase manquantes"
- Vérifier que `.env.local` existe
- Vérifier les clés API dans Supabase Dashboard
- Redémarrer le serveur de développement

### Erreur : "Table does not exist"
- Vérifier que les migrations SQL ont été exécutées
- Vérifier les permissions dans Supabase
- Re-exécuter les scripts SQL

### Erreur : "RLS policy violation"
- Vérifier que l'utilisateur est authentifié
- Vérifier les politiques RLS dans Supabase
- Consulter les logs dans Supabase Dashboard

### Chat/Upload ne fonctionne pas
- Vérifier la configuration du Storage
- Vérifier les politiques de sécurité
- Vérifier la connexion réseau

## 📈 Monitoring

### Dashboard Supabase
Surveiller :
- **Auth** - Connexions utilisateurs
- **Database** - Requêtes et performance
- **Storage** - Uploads et utilisation
- **Realtime** - Connexions WebSocket

### Logs Application
Vérifier la console du navigateur pour :
- Erreurs de connexion
- Erreurs d'authentification
- Erreurs de requêtes

## 🔒 Sécurité

### Row Level Security (RLS)
Toutes les tables utilisent RLS pour :
- Isoler les données par utilisateur
- Contrôler l'accès par rôle
- Protéger les données sensibles

### Authentification
- JWT tokens sécurisés
- Sessions persistantes
- Logout automatique
- Rate limiting intégré

## ✅ Checklist de Validation

- [ ] Projet Supabase créé
- [ ] Variables d'environnement configurées
- [ ] Migrations SQL exécutées
- [ ] Tables créées avec succès
- [ ] Storage configuré (optionnel)
- [ ] Application démarrée (`npm run dev`)
- [ ] Connexion Supabase confirmée
- [ ] Authentification testée
- [ ] Chat temps réel testé
- [ ] Upload d'images testé
- [ ] Géolocalisation testée

---

**Supabase est maintenant configuré et opérationnel ! 🚀✨**

Pour toute question, consulter la [documentation Supabase](https://supabase.com/docs) ou les logs de l'application.