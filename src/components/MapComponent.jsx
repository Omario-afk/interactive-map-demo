import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouteCalculation, getOpenRouteServiceKey } from '@/services/RouteService';

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

// Component to handle road routing display
function RoadRoute({ pickupCoords, destinationCoords, onRouteCalculated }) {
  const map = useMap();
  const apiKey = getOpenRouteServiceKey();
  const { calculateRoute, currentRoute, loading, error } = useRouteCalculation(apiKey);
  const [routeLayer, setRouteLayer] = useState(null);
  const [lastRouteKey, setLastRouteKey] = useState('');

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
    // Clean up previous route layer
    if (routeLayer) {
      map.removeLayer(routeLayer);
      setRouteLayer(null);
    }

    if (currentRoute && currentRoute.coordinates) {
      // Create new route polyline - simple blue line like original
      const newRouteLayer = L.polyline(currentRoute.coordinates, {
        color: '#3B82F6',
        weight: 6,
        opacity: 0.9,
        smoothFactor: 1.0
      }).addTo(map);

      setRouteLayer(newRouteLayer);

      // Fit map to route bounds with padding
      const bounds = L.latLngBounds(currentRoute.coordinates);
      map.fitBounds(bounds, { padding: [60, 60] });
    }

    // Cleanup function
    return () => {
      if (routeLayer) {
        map.removeLayer(routeLayer);
      }
    };
  }, [currentRoute, map]);

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

  return null;
}

// Component to handle map centering when only pickup is provided
function MapCenterController({ pickupCoords, destinationCoords }) {
  const map = useMap();

  useEffect(() => {
    if (pickupCoords && !destinationCoords) {
      // Only pickup - center on pickup location
      map.setView([pickupCoords.lat, pickupCoords.lng], 13);
    } else if (pickupCoords && destinationCoords) {
      // Both coordinates - let RoadRoute component handle the bounds
      return;
    }
  }, [map, pickupCoords, destinationCoords]);

  return null;
}

export default function MapComponent({ 
  pickupCoords, 
  destinationCoords, 
  onRouteCalculated 
}) {
  const center = pickupCoords 
    ? [pickupCoords.lat, pickupCoords.lng]
    : [46.6034, 1.8883]; // Geographic center of France as default

  return (
    <div className="relative w-full h-full">
      <MapContainer
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
          <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={PickupIcon} />
        )}

        {/* Destination marker - no popup for clean look */}
        {destinationCoords && (
          <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={DestinationIcon} />
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