import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouteCalculation, getOpenRouteServiceKey } from './RouteService';

// Fix for default markers not showing
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Modern pickup icon (green)
const PickupIcon = L.divIcon({
  html: `<div style="
    background-color:#10B981;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 8px rgba(16,185,129,0.6);
  "></div>`,
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13],
});

// Modern destination icon (red)
const DestinationIcon = L.divIcon({
  html: `<div style="
    background-color:#EF4444;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 8px rgba(239,68,68,0.6);
  "></div>`,
  className: '',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -13],
});

// Component to handle road routing display
function RoadRoute({ pickupCoords, destinationCoords, onRouteCalculated }) {
  const map = useMap();
  const apiKey = getOpenRouteServiceKey();
  const { calculateRoute, currentRoute, loading, error, formatDuration, formatDistance } = useRouteCalculation(apiKey);
  const [routeLayer, setRouteLayer] = useState(null);

  useEffect(() => {
    // Clean up previous route
    if (routeLayer) {
      map.removeLayer(routeLayer);
      setRouteLayer(null);
    }

    // Calculate new route if both coordinates exist
    if (pickupCoords && destinationCoords) {
      calculateRoute(pickupCoords, destinationCoords);
    }
  }, [pickupCoords, destinationCoords, calculateRoute, map, routeLayer]);

  useEffect(() => {
    // Clean up previous route layer
    if (routeLayer) {
      map.removeLayer(routeLayer);
    }

    if (currentRoute && currentRoute.coordinates) {
      // Create new route polyline
      const newRouteLayer = L.polyline(currentRoute.coordinates, {
        color: '#3B82F6',
        weight: 5,
        opacity: 0.8,
        smoothFactor: 1.0,
        className: 'road-route'
      }).addTo(map);

      // Add route popup with info
      const routeInfo = `
        <div style="font-family: system-ui; font-size: 14px;">
          <strong>📍 Itinéraire</strong><br/>
          <div style="margin: 8px 0;">
            <span style="color: #059669;">📏 Distance:</span> ${formatDistance(currentRoute.distance)}<br/>
            <span style="color: #0369A1;">⏱️ Durée:</span> ${formatDuration(currentRoute.duration)}<br/>
            <span style="color: #7C3AED;">🛣️ Service:</span> ${currentRoute.service}
          </div>
        </div>
      `;
      
      newRouteLayer.bindPopup(routeInfo);
      setRouteLayer(newRouteLayer);

      // Fit map to route bounds with padding
      const bounds = L.latLngBounds(currentRoute.coordinates);
      map.fitBounds(bounds, { padding: [40, 40] });

      // Call callback with route info
      if (onRouteCalculated) {
        onRouteCalculated({
          distance: currentRoute.distance,
          duration: currentRoute.duration,
          service: currentRoute.service,
          loading: false,
          error: null
        });
      }
    } else if (error && onRouteCalculated) {
      // Handle error
      onRouteCalculated({
        distance: null,
        duration: null,
        service: null,
        loading: false,
        error: error
      });
    } else if (loading && onRouteCalculated) {
      // Handle loading state
      onRouteCalculated({
        distance: null,
        duration: null,
        service: null,
        loading: true,
        error: null
      });
    }

    // Cleanup function
    return () => {
      if (routeLayer) {
        map.removeLayer(routeLayer);
      }
    };
  }, [currentRoute, error, loading, map, formatDistance, formatDuration, onRouteCalculated]);

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
        {/* French-optimized tile layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png"
          maxZoom={18}
        />

        {/* Pickup marker */}
        {pickupCoords && (
          <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={PickupIcon}>
            <Popup>
              <div style={{ fontFamily: 'system-ui', fontSize: '14px' }}>
                <strong>🚀 Point de départ</strong><br/>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>
                  {pickupCoords.lat.toFixed(6)}, {pickupCoords.lng.toFixed(6)}
                </span>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination marker */}
        {destinationCoords && (
          <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={DestinationIcon}>
            <Popup>
              <div style={{ fontFamily: 'system-ui', fontSize: '14px' }}>
                <strong>🎯 Destination</strong><br/>
                <span style={{ color: '#6B7280', fontSize: '12px' }}>
                  {destinationCoords.lat.toFixed(6)}, {destinationCoords.lng.toFixed(6)}
                </span>
              </div>
            </Popup>
          </Marker>
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