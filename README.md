# 🚢 PIROGUE CONNECT - Guide de Test Complet

## 📋 Prérequis

### 1. Environnement de Développement
```bash
# Vérifier Node.js (version 18+)
node --version

# Vérifier npm
npm --version

# Installer les dépendances
npm install
```

### 2. Configuration Base de Données

#### Option A : Avec Supabase (Recommandé)
1. Créer un compte sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Copier les clés API depuis Settings > API
4. Créer le fichier `.env.local` :

```env
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anonyme
```

5. Exécuter les migrations dans l'éditeur SQL Supabase :
   - Copier le contenu de `supabase/migrations/001_initial_schema.sql`
   - Coller dans l'éditeur SQL et exécuter
   - Faire de même avec `002_sample_data.sql`

#### Option B : PostgreSQL Local
```bash
# Installer PostgreSQL avec PostGIS
sudo apt-get install postgresql postgresql-contrib postgis

# Créer la base de données
sudo -u postgres createdb pirogue_connect
sudo -u postgres psql -d pirogue_connect -c "CREATE EXTENSION postgis;"

# Exécuter les migrations
psql -d pirogue_connect -f supabase/migrations/001_initial_schema.sql
psql -d pirogue_connect -f supabase/migrations/002_sample_data.sql
```

## 🚀 Démarrage de l'Application

### 1. Mode Développement
```bash
# Démarrer le serveur de développement
npm run dev

# L'application sera disponible sur http://localhost:5173
```

### 2. Comptes de Test Disponibles

#### Pêcheur
- **Email :** amadou@example.com
- **Mot de passe :** password123
- **Rôle :** Pêcheur avec pirogue "Ndakaaru"

#### Organisation (GIE)
- **Email :** fatou@gie-cayar.sn
- **Mot de passe :** password123
- **Rôle :** Coordinatrice GIE

#### Administrateur
- **Email :** admin@pirogue-connect.sn
- **Mot de passe :** password123
- **Rôle :** Administrateur système

## 🧪 Scénarios de Test

### Test 1 : Authentification
1. Ouvrir l'application
2. Tester la connexion avec chaque compte
3. Vérifier que l'interface change selon le rôle
4. Tester la déconnexion

### Test 2 : Géolocalisation
1. Se connecter comme pêcheur
2. Autoriser la géolocalisation dans le navigateur
3. Vérifier l'affichage de la position sur la carte
4. Tester le bouton SOS (attention : génère une vraie alerte)

### Test 3 : Communication
1. Ouvrir le chat flottant
2. Envoyer des messages dans différents canaux
3. Tester le partage de position
4. Vérifier la réception en temps réel

### Test 4 : Alertes
1. Se connecter comme organisation
2. Aller dans le centre d'alertes
3. Vérifier les alertes actives
4. Tester l'acquittement des alertes

### Test 5 : Carte Interactive
1. Aller dans la vue "Carte Marine"
2. Vérifier l'affichage des zones de sécurité
3. Tester le zoom et la navigation
4. Vérifier les popups d'information

## 🔧 Outils de Développement

### VS Code Extensions Recommandées
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Configuration VS Code
Créer `.vscode/settings.json` :
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ]
}
```

## 🐛 Débogage

### Logs de Développement
```bash
# Voir les logs en temps réel
npm run dev

# Ouvrir les DevTools du navigateur (F12)
# Onglet Console pour voir les logs JavaScript
# Onglet Network pour voir les requêtes API
```

### Problèmes Courants

#### 1. Erreur de Géolocalisation
```javascript
// Vérifier dans la console si la géolocalisation est autorisée
navigator.geolocation.getCurrentPosition(
  (position) => console.log('Position:', position),
  (error) => console.error('Erreur géolocalisation:', error)
);
```

#### 2. Problème de Connexion Supabase
```javascript
// Tester la connexion dans la console
import { supabase } from './src/lib/supabase';
const { data, error } = await supabase.from('users').select('*').limit(1);
console.log('Test Supabase:', { data, error });
```

#### 3. Erreurs de Carte
```bash
# Vérifier que Leaflet CSS est chargé
# Dans le navigateur, aller dans Sources > Stylesheets
# Chercher leaflet.css
```

## 📊 Monitoring et Performance

### Métriques à Surveiller
- Temps de chargement initial
- Temps de réponse des API
- Utilisation mémoire (DevTools > Memory)
- Performance réseau (DevTools > Network)

### Tests de Performance
```bash
# Audit Lighthouse
# DevTools > Lighthouse > Generate report

# Test de charge basique
# Ouvrir plusieurs onglets avec l'application
```

## 🔒 Sécurité

### Variables d'Environnement
```bash
# Ne jamais commiter les vraies clés API
# Utiliser .env.local pour le développement
# Vérifier que .env.local est dans .gitignore
```

### Test de Sécurité
1. Tester l'accès sans authentification
2. Vérifier les permissions par rôle
3. Tester la validation des données d'entrée

## 📱 Test Mobile

### Responsive Design
```bash
# DevTools > Toggle device toolbar (Ctrl+Shift+M)
# Tester sur différentes tailles d'écran :
# - iPhone SE (375x667)
# - iPad (768x1024)
# - Desktop (1920x1080)
```

### PWA (Progressive Web App)
1. Ouvrir DevTools > Application
2. Vérifier Service Workers
3. Tester le mode hors ligne
4. Vérifier le manifest.json

## 🚀 Déploiement de Test

### Build de Production
```bash
# Créer le build optimisé
npm run build

# Prévisualiser le build
npm run preview
```

### Variables d'Environnement Production
```env
VITE_SUPABASE_URL=https://production-url.supabase.co
VITE_SUPABASE_ANON_KEY=production-anon-key
```

## 📞 Support et Documentation

### Ressources Utiles
- [Documentation Supabase](https://supabase.com/docs)
- [React Leaflet](https://react-leaflet.js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

### Contacts Projet
- **Email :** contact@pirogue-connect.sn
- **Documentation :** Voir dossier `/docs`
- **Issues :** Utiliser le système de tickets GitHub