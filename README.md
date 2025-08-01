# Application de Carte Interactive France

Cette application Next.js affiche une carte interactive de la France pour planifier des itinéraires entre les principales destinations. Elle utilise React Leaflet pour la carte et l'API OpenRouteService pour le calcul des trajets.

## Fonctionnalités

- **Carte interactive** : Basée sur React Leaflet avec des tuiles CartoDB Light
- **Planification d'itinéraires** : Calcule le trajet, la distance et la durée en temps réel
- **Marqueurs personnalisés** : Indiquent le départ et la destination
- **Itinéraire aléatoire** : Sélectionne un trajet prédéfini de manière aléatoire
- **Design responsive** : S'adapte aux mobiles et aux ordinateurs
- **Interface entièrement en français**

## Itinéraires Exemples

L'application inclut des itinéraires prédéfinis :

### Paris
- Louvre → Tour Eiffel
- Gare du Nord → Arc de Triomphe
- Notre-Dame → Sacré-Cœur

### Lyon
- Bellecour → Vieux Lyon

### Marseille
- Vieux-Port → Notre-Dame de la Garde

## Technologies

- **Next.js 14**
- **React Leaflet et Leaflet**
- **API OpenRouteService**
- **Tailwind CSS**
- **Police Geist**

## Installation

### Prérequis
- Node.js 18+
- Une clé API OpenRouteService

### Étapes d'installation

1. **Cloner le dépôt et installer les dépendances**
   ```bash
   git clone https://github.com/Omario-afk/interactive-map-demo.git
   cd interactive-map-demo
   npm install
   ```

2. **Créer un fichier `.env.local` à la racine et ajouter votre clé API**
   ```bash
   NEXT_PUBLIC_OPENROUTESERVICE_API_KEY=votre_clé_api_ici
   ```

   > **Note** : Pour obtenir une clé, inscrivez-vous gratuitement sur [OpenRouteService](https://openrouteservice.org/)

3. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

4. **Accéder à l'application**
   Naviguez vers [http://localhost:3000](http://localhost:3000)

## Déploiement

Pour un déploiement sur des plateformes comme Vercel ou Netlify, assurez-vous de configurer la variable d'environnement `NEXT_PUBLIC_OPENROUTESERVICE_API_KEY`.

## Licence

Ce projet est sous Licence MIT.