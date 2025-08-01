# Application de Carte Interactive France

Une application Next.js qui affiche une carte interactive de la France avec des capacités de planification d'itinéraires entre les principales destinations françaises. Construite avec React Leaflet et l'API OpenRouteService.

## Fonctionnalités

- 🗺️ Carte interactive utilisant React Leaflet avec des tuiles CartoDB Light
- 🚗 Planification d'itinéraires entre les monuments et destinations françaises
- 📍 Marqueurs personnalisés pour les points de départ et de destination
- 🛣️ Calcul d'itinéraire en temps réel avec distance et durée
- 🎲 Fonctionnalité de sélection d'itinéraire aléatoire
- 📱 Design responsive pour mobile et desktop
- 🇫🇷 Interface en langue française

## Itinéraires Exemples

L'application inclut des itinéraires prédéfinis entre les destinations françaises populaires :
- Musée du Louvre à la Tour Eiffel (Paris)
- Gare du Nord à l'Arc de Triomphe (Paris)
- Notre-Dame au Sacré-Cœur (Paris)
- Bellecour au Vieux Lyon (Lyon)
- Vieux-Port à Notre-Dame de la Garde (Marseille)

## Prérequis

- Node.js 18+
- npm, yarn, ou pnpm
- Clé API OpenRouteService

## Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/Omario-afk/interactive-map-demo.git
   cd interactive-map-demo
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   # ou
   yarn install
   # ou
   pnpm install
   ```

3. **Créer le fichier d'environnement**
   Créez un fichier `.env.local` dans le répertoire racine :
   ```bash
   NEXT_PUBLIC_OPENROUTESERVICE_API_KEY=votre_clé_api_ici
   ```

4. **Obtenir une clé API OpenRouteService**
   - Allez sur [OpenRouteService](https://openrouteservice.org/)
   - Créez un compte gratuit
   - Naviguez vers votre profil/dashboard
   - Générez une nouvelle clé API
   - Copiez la clé et collez-la dans votre fichier `.env.local`

5. **Lancer le serveur de développement**
   ```bash
   npm run dev
   # ou
   yarn dev
   # ou
   pnpm dev
   ```

6. **Ouvrir votre navigateur**
   Naviguez vers [http://localhost:3000](http://localhost:3000)

## Technologies Utilisées

- **Next.js 14** - Framework React
- **React Leaflet** - Bibliothèque de composants cartographiques
- **Leaflet** - Bibliothèque de cartographie open-source
- **API OpenRouteService** - Service de planification d'itinéraires
- **Tailwind CSS** - Framework de style
- **Police Geist** - Typographie

## Structure du Projet

```
src/
├── app/
│   ├── layout.js          # Layout racine
│   ├── page.jsx           # Composant page principale
│   └── globals.css        # Styles globaux
├── components/
│   └── MapComponent.jsx   # Composant carte interactive
└── services/
    └── RouteService.js    # Service API pour le calcul d'itinéraires
```

## Configuration de la Clé API

L'application nécessite une clé API OpenRouteService pour les calculs d'itinéraires. Voici comment l'obtenir :

1. Visitez [OpenRouteService](https://openrouteservice.org/)
2. Cliquez sur "Sign Up" et créez un compte gratuit
3. Vérifiez votre adresse email
4. Connectez-vous à votre dashboard
5. Allez dans la section "API Keys"
6. Générez une nouvelle clé API
7. Copiez la clé et ajoutez-la à votre fichier `.env.local`

**Note** : La version gratuite a des limites de taux. Pour un usage en production, considérez une mise à niveau vers un plan payant.

## Développement

- **Rechargement à chaud** : Les modifications sont reflétées immédiatement en développement
- **SSR désactivé** : Les composants cartographiques sont chargés côté client pour éviter les problèmes SSR
- **Imports dynamiques** : Les composants React Leaflet sont importés dynamiquement pour prévenir les erreurs d'hydratation

## Déploiement

Cette application peut être déployée sur Vercel, Netlify, ou toute autre plateforme compatible Next.js. Assurez-vous de :

1. Définir la variable d'environnement `NEXT_PUBLIC_OPENROUTESERVICE_API_KEY` sur votre plateforme d'hébergement
2. Construire l'application : `npm run build`
3. Déployer en utilisant votre méthode préférée

## Licence

Ce projet est open source et disponible sous la [Licence MIT](LICENSE).
