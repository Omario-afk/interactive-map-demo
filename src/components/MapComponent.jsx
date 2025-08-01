"use client"
import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouteCalculation, getOpenRouteServiceKey } from '@/services/RouteService';

// Dynamically import react-leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// Function to create icons after Leaflet is loaded
const createIcons = (L) => {
  // Fix for default markers not showing
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });

  // Modern pickup icon (blue like original)
  const PickupIcon = L.divIcon({
    html: `<div style="
      background-color:#3B82F6;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 5px rgba(59,130,246,0.7);
    "></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

  // Modern destination icon (blue like original)
  const DestinationIcon = L.divIcon({
    html: `<div style="
      background-color:#3B82F6;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 0 5px rgba(59,130,246,0.7);
    "></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });

  return { PickupIcon, DestinationIcon };
};

// Component to handle road routing display
function RoadRoute({ pickupCoords, destinationCoords, onRouteCalculated }) {
  const apiKey = getOpenRouteServiceKey();
  const { calculateRoute, currentRoute, loading, error } = useRouteCalculation(apiKey);
  const [routeLayer, setRouteLayer] = useState(null);
  const [lastRouteKey, setLastRouteKey] = useState('');
  const [localL, setLocalL] = useState(null);
  const mapRef = useRef(null);

  // Load Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      if (!localL) {
        const leaflet = await import('leaflet');
        setLocalL(leaflet.default);
      }
    };
    loadLeaflet();
  }, [localL]);

  // Create a stable route key to prevent unnecessary recalculations
  const routeKey = pickupCoords && destinationCoords 
    ? `${pickupCoords.lat}-${pickupCoords.lng}-${destinationCoords.lat}-${destinationCoords.lng}`
    : '';

  // Effect for route calculation - only when coordinates actually change
  useEffect(() => {
    if (pickupCoords && destinationCoords && routeKey !== lastRouteKey) {
      console.log('Calculating new route for:', routeKey);
      setLastRouteKey(routeKey);
      calculateRoute(pickupCoords, destinationCoords);
    }
  }, [routeKey, lastRouteKey, pickupCoords, destinationCoords, calculateRoute]);

  // Effect for displaying route on map - separate from callback
  useEffect(() => {
    if (!localL || !mapRef.current) return;

    // Clean up previous route layer
    if (routeLayer) {
      mapRef.current.removeLayer(routeLayer);
      setRouteLayer(null);
    }

    if (currentRoute && currentRoute.coordinates) {
      // Create new route polyline - simple blue line like original
      const newRouteLayer = localL.polyline(currentRoute.coordinates, {
        color: '#3B82F6',
        weight: 6,
        opacity: 0.9,
        smoothFactor: 1.0
      }).addTo(mapRef.current);

      setRouteLayer(newRouteLayer);

      // Fit map to route bounds with padding
      const bounds = localL.latLngBounds(currentRoute.coordinates);
      mapRef.current.fitBounds(bounds, { padding: [60, 60] });
    }

    // Cleanup function
    return () => {
      if (routeLayer && mapRef.current) {
        mapRef.current.removeLayer(routeLayer);
      }
    };
  }, [currentRoute, localL]);

  // Separate effect for callback - using useRef to prevent infinite loops
  useEffect(() => {
    if (onRouteCalculated) {
      if (currentRoute) {
        onRouteCalculated({
          distance: currentRoute.distance,
          duration: currentRoute.duration,
          service: currentRoute.service,
          loading: false,
          error: null
        });
      } else if (error) {
        onRouteCalculated({
          distance: null,
          duration: null,
          service: null,
          loading: false,
          error: error
        });
      } else if (loading) {
        onRouteCalculated({
          distance: null,
          duration: null,
          service: null,
          loading: true,
          error: null
        });
      }
    }
  }, [currentRoute, error, loading]); // Removed onRouteCalculated from deps to prevent infinite loop

  // Function to get map reference
  const getMapRef = (map) => {
    if (map && !mapRef.current) {
      mapRef.current = map;
    }
  };

  return (
    <MapRefHandler onMapReady={getMapRef} />
  );
}

// Component to handle map centering when only pickup is provided
function MapCenterController({ pickupCoords, destinationCoords }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && pickupCoords && !destinationCoords) {
      // Only pickup - center on pickup location
      mapRef.current.setView([pickupCoords.lat, pickupCoords.lng], 13);
    } else if (mapRef.current && pickupCoords && destinationCoords) {
      // Both coordinates - let RoadRoute component handle the bounds
      return;
    }
  }, [pickupCoords, destinationCoords]);

  // Function to get map reference
  const getMapRef = (map) => {
    if (map && !mapRef.current) {
      mapRef.current = map;
    }
  };

  return (
    <MapRefHandler onMapReady={getMapRef} />
  );
}

// Simple component to get map reference
function MapRefHandler({ onMapReady }) {
  const { useMap } = require('react-leaflet');
  const map = useMap();

  useEffect(() => {
    if (map) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
}

export default function MapComponent({ 
  pickupCoords, 
  destinationCoords, 
  onRouteCalculated 
}) {
  const [isClient, setIsClient] = useState(false);
  const [localL, setLocalL] = useState(null);
  const [icons, setIcons] = useState(null);

  // Load Leaflet and CSS on client side
  useEffect(() => {
    setIsClient(true);
    
    const loadLeaflet = async () => {
      // Import Leaflet CSS
      await import('leaflet/dist/leaflet.css');
      // Import Leaflet
      const leaflet = await import('leaflet');
      setLocalL(leaflet.default);
      // Create icons
      setIcons(createIcons(leaflet.default));
    };

    loadLeaflet();
  }, []);

  if (!isClient || !localL || !icons) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100 rounded-2xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de la carte...</p>
        </div>
      </div>
    );
  }

  const center = pickupCoords 
    ? [pickupCoords.lat, pickupCoords.lng]
    : [46.6034, 1.8883]; // Geographic center of France as default

  return (
    <div className="relative w-full h-full">
      <MapContainer
        key={`map-${pickupCoords?.lat}-${pickupCoords?.lng}-${destinationCoords?.lat}-${destinationCoords?.lng}`}
        center={center}
        zoom={6}
        style={{ 
          height: '100%', 
          width: '100%', 
          borderRadius: '1rem',
          filter: 'none',
          opacity: 1,
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        {/* Original CARTO Light tiles - clean grey look */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          maxZoom={18}
        />

        {/* Pickup marker - no popup for clean look */}
        {pickupCoords && (
          <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={icons.PickupIcon} />
        )}

        {/* Destination marker - no popup for clean look */}
        {destinationCoords && (
          <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={icons.DestinationIcon} />
        )}

        {/* Road route calculation and display */}
        {pickupCoords && destinationCoords && (
          <RoadRoute 
            pickupCoords={pickupCoords}
            destinationCoords={destinationCoords}
            onRouteCalculated={onRouteCalculated}
          />
        )}

        {/* Map center controller for pickup-only mode */}
        <MapCenterController 
          pickupCoords={pickupCoords}
          destinationCoords={destinationCoords}
        />
      </MapContainer>
    </div>
  );
}