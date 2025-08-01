'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100 rounded-2xl">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Chargement de la carte...</p>
      </div>
    </div>
  )
});

// Sample data for French locations
const sampleRoutes = [
  {
    name: "Louvre au Tour Eiffel",
    pickupCoords: { lat: 48.8606, lng: 2.3376 },
    destinationCoords: { lat: 48.8584, lng: 2.2945 }
  },
  {
    name: "Gare du Nord à l'Arc de Triomphe",
    pickupCoords: { lat: 48.8809, lng: 2.3553 },
    destinationCoords: { lat: 48.8738, lng: 2.2950 }
  },
  {
    name: "Notre-Dame au Sacré-Cœur",
    pickupCoords: { lat: 48.8530, lng: 2.3499 },
    destinationCoords: { lat: 48.8867, lng: 2.3431 }
  },
  {
    name: "Bellecour au Vieux Lyon",
    pickupCoords: { lat: 45.7578, lng: 4.8320 },
    destinationCoords: { lat: 45.7640, lng: 4.8270 }
  },
  {
    name: "Vieux-Port à Notre-Dame de la Garde (Marseille)",
    pickupCoords: { lat: 43.2951, lng: 5.3751 },
    destinationCoords: { lat: 43.2842, lng: 5.3714 }
  }
];

export default function MapPage() {
  const [selectedRoute, setSelectedRoute] = useState(sampleRoutes[0]);
  const [showOnlyPickup, setShowOnlyPickup] = useState(false);

  const handleRouteChange = (routeIndex) => {
    setSelectedRoute(sampleRoutes[routeIndex]);
  };

  const getRandomRoute = () => {
    const randomIndex = Math.floor(Math.random() * sampleRoutes.length);
    setSelectedRoute(sampleRoutes[randomIndex]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Carte Interactive France
          </h1>
          <p className="text-gray-600">
            Explorez les trajets entre les principales destinations françaises
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            {/* Route selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choisir un trajet
              </label>
              <select 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onChange={(e) => handleRouteChange(parseInt(e.target.value))}
                value={sampleRoutes.indexOf(selectedRoute)}
              >
                {sampleRoutes.map((route, index) => (
                  <option key={index} value={index}>
                    {route.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Random route button */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trajet aléatoire
              </label>
              <button
                onClick={getRandomRoute}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
              >
                🎲 Surprise
              </button>
            </div>

            {/* Toggle destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Affichage
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showOnlyPickup}
                  onChange={(e) => setShowOnlyPickup(e.target.checked)}
                  className="rounded text-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Départ uniquement
                </span>
              </label>
            </div>

            {/* Current route info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trajet actuel
              </label>
              <div className="text-sm bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-900">{selectedRoute.name}</p>
                <p className="text-gray-600 text-xs mt-1">
                  {selectedRoute.pickupCoords.lat.toFixed(4)}, {selectedRoute.pickupCoords.lng.toFixed(4)}
                  {!showOnlyPickup && ' → '}
                  {!showOnlyPickup && `${selectedRoute.destinationCoords.lat.toFixed(4)}, ${selectedRoute.destinationCoords.lng.toFixed(4)}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="h-96 md:h-[500px] lg:h-[600px] w-full">
            <MapComponent
              pickupCoords={selectedRoute.pickupCoords}
              destinationCoords={showOnlyPickup ? null : selectedRoute.destinationCoords}
            />
          </div>
        </div>

        {/* Info Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                Départ
              </h3>
            </div>
            <p className="text-gray-600">
              Latitude: {selectedRoute.pickupCoords.lat.toFixed(6)}
            </p>
            <p className="text-gray-600">
              Longitude: {selectedRoute.pickupCoords.lng.toFixed(6)}
            </p>
          </div>

          {!showOnlyPickup && (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="ml-4 text-lg font-semibold text-gray-900">
                  Destination
                </h3>
              </div>
              <p className="text-gray-600">
                Latitude: {selectedRoute.destinationCoords.lat.toFixed(6)}
              </p>
              <p className="text-gray-600">
                Longitude: {selectedRoute.destinationCoords.lng.toFixed(6)}
              </p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">ℹ️</span>
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-900">
                Informations
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              Carte interactive utilisant React Leaflet avec des tuiles CartoDB Light.
              {!showOnlyPickup && ' La ligne en pointillés montre le trajet direct.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}