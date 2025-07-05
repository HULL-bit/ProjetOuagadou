# 🚀 Guide de Migration Supabase - Pirogue Connect

## 📋 Configuration Immédiate

Vos clés Supabase sont maintenant configurées :
- **URL** : `https://liqzsoqsnzvkxltgguee.supabase.co`
- **Clé** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## 🗄️ Étapes de Migration Requises

### 1. Exécuter les Migrations SQL

Dans votre dashboard Supabase ([https://app.supabase.com/project/liqzsoqsnzvkxltgguee](https://app.supabase.com/project/liqzsoqsnzvkxltgguee)) :

#### Étape 1 : Schéma Principal
1. Aller dans **SQL Editor**
2. Créer une nouvelle query
3. Copier-coller le contenu COMPLET du fichier :
   ```
   supabase/migrations/20250702131712_broad_silence.sql
   ```
4. Cliquer **"Run"** pour exécuter

#### Étape 2 : Données d'Exemple
1. Créer une nouvelle query
2. Copier-coller le contenu COMPLET du fichier :
   ```
   supabase/migrations/20250702131751_ancient_waterfall.sql
   ```
3. Cliquer **"Run"** pour exécuter

### 2. Configurer le Storage (Optionnel)

Pour les uploads d'images :

1. Aller dans **Storage** dans le dashboard
2. Créer les buckets suivants :
   - `avatars` (public)
   - `chat-files` (public)

#### Politiques Storage
```sql
-- Politique pour les avatars
CREATE POLICY "Avatar uploads are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

-- Politique pour les fichiers de chat
CREATE POLICY "Chat files are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-files');

CREATE POLICY "Users can upload chat files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);
```

## 🚀 Lancement de l'Application

```bash
npm run dev
```

## 🧪 Test de la Configuration

### Mode Hybride Intelligent
L'application fonctionne maintenant en **mode hybride** :

- ✅ **Supabase connecté** : Toutes les fonctionnalités temps réel
- ⚠️ **Fallback démo** : Si Supabase n'est pas encore configuré

### Vérification de la Connexion
Dans la console du navigateur, vous verrez :
- ✅ `"Connexion Supabase établie"` si tout fonctionne
- ⚠️ `"Mode démo activé"` si les migrations ne sont pas encore exécutées

### Comptes de Test
Fonctionnent dans les deux modes :
- **Pêcheur** : `amadou@example.com` / `password123`
- **Organisation** : `fatou@gie-cayar.sn` / `password123`
- **Admin** : `admin@pirogue-connect.sn` / `password123`

## 📊 Fonctionnalités Disponibles

### Avec Supabase (après migration) :
- 🔄 **Temps réel complet** avec WebSockets
- 💾 **Persistance** de toutes les données
- 📤 **Upload d'images** dans chat et profils
- 👥 **Gestion utilisateurs** complète
- 🗺️ **Géolocalisation** avec stockage
- 📱 **Synchronisation** multi-appareils

### Mode Démo (avant migration) :
- 🎮 **Simulation complète** des fonctionnalités
- 📱 **Interface identique** à Supabase
- 🔄 **Données temporaires** en mémoire
- ✨ **Aucune configuration** requise

## 🔧 Vérification des Tables

Après migration, vérifier dans **Table Editor** :
- ✅ `profiles` - Profils utilisateurs
- ✅ `locations` - Positions GPS
- ✅ `alerts` - Système d'alertes
- ✅ `messages` - Messagerie
- ✅ `zones` - Zones géographiques
- ✅ `trips` - Historique des sorties
- ✅ `channels` - Canaux de communication
- ✅ `weather_data` - Données météo

## 🚨 Résolution de Problèmes

### Erreur : "Table does not exist"
➡️ **Solution** : Exécuter les migrations SQL dans Supabase

### Erreur : "RLS policy violation"
➡️ **Solution** : Vérifier que les politiques RLS sont créées

### Upload d'images ne fonctionne pas
➡️ **Solution** : Configurer le Storage et les politiques

### Chat temps réel ne fonctionne pas
➡️ **Solution** : Vérifier les subscriptions Realtime

## 📈 Monitoring

### Dashboard Supabase
Surveiller dans votre projet :
- **Auth** - Connexions utilisateurs
- **Database** - Requêtes et performance
- **Storage** - Uploads et utilisation
- **Realtime** - Connexions WebSocket

### Logs Application
Console du navigateur :
- ✅ Messages de succès Supabase
- ⚠️ Messages de fallback démo
- ❌ Erreurs de configuration

## ✅ Checklist de Migration

- [x] Variables d'environnement configurées
- [ ] Migration 1 exécutée (schéma principal)
- [ ] Migration 2 exécutée (données d'exemple)
- [ ] Storage configuré (optionnel)
- [ ] Tables créées avec succès
- [ ] Connexion Supabase confirmée
- [ ] Authentification testée
- [ ] Chat temps réel testé
- [ ] Upload d'images testé

---

**L'application fonctionne immédiatement en mode démo et se connectera automatiquement à Supabase après la migration ! 🚀✨**

Pour toute question, consulter les logs de l'application ou le dashboard Supabase.