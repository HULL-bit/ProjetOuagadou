# ⚡ Démarrage Rapide - Pirogue Connect

## 🚀 Lancement Immédiat (Mode Démo)

```bash
# 1. Installation des dépendances
npm install

# 2. Démarrage de l'application
npm run dev

# 3. Ouvrir dans le navigateur
# http://localhost:5173
```

## 🔑 Comptes de Test

### Pêcheur
- **Email :** amadou@example.com
- **Mot de passe :** password123

### Organisation (GIE)
- **Email :** fatou@gie-cayar.sn
- **Mot de passe :** password123

### Administrateur
- **Email :** admin@pirogue-connect.sn
- **Mot de passe :** password123

## 🗄️ Configuration Supabase (Optionnel)

### 1. Créer un Projet Supabase
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un compte et un nouveau projet
3. Récupérer l'URL et la clé API

### 2. Configuration
```bash
# Copier le fichier d'exemple
cp .env.example .env.local

# Éditer .env.local avec vos clés Supabase
# VITE_SUPABASE_URL=https://votre-projet.supabase.co
# VITE_SUPABASE_ANON_KEY=votre-clé-ici
# VITE_DEMO_MODE=false
```

### 3. Exécuter les Migrations
1. Aller dans Supabase Dashboard > SQL Editor
2. Copier-coller le contenu de `supabase/migrations/20250702131712_broad_silence.sql`
3. Exécuter la requête
4. Faire de même avec `supabase/migrations/20250702131751_ancient_waterfall.sql`

## ✅ Test Rapide

1. **Authentification** - Se connecter avec un compte de test
2. **Géolocalisation** - Autoriser la géolocalisation dans le navigateur
3. **Chat** - Ouvrir le widget de chat flottant
4. **Carte** - Vérifier l'affichage de la carte marine
5. **Alertes** - Tester le bouton SOS (génère une alerte)

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev              # Démarrer le serveur
npm run build           # Build de production
npm run preview         # Prévisualiser le build

# Qualité du code
npm run lint            # Vérifier le code
npm run lint:fix        # Corriger automatiquement
npm run type-check      # Vérifier TypeScript

# Nettoyage
npm run clean           # Nettoyer node_modules
npm run clean:cache     # Nettoyer le cache npm
npm run clean:build     # Nettoyer le dossier build
```

## 📱 Fonctionnalités Principales

- **🎣 Pêcheurs** : Profil, historique sorties, communication
- **🏢 Organisations** : Gestion flotte, supervision, alertes
- **⚙️ Admin** : Gestion utilisateurs, monitoring système
- **🗺️ Carte** : Géolocalisation temps réel, zones sécurité
- **💬 Chat** : Communication multi-canaux
- **🚨 Alertes** : Système SOS et notifications

---

**L'application est prête ! Bon développement ! 🚢**