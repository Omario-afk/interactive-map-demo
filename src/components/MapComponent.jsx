"use client"
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icône personnalisée plus moderne (exemple : cercle bleu)
const ModernIcon = L.divIcon({
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

function RouteLine({ pickupCoords, destinationCoords }) {
  const map = useMap();

  useEffect(() => {
    if (pickupCoords && destinationCoords) {
      const polyline = L.polyline(
        [
          [pickupCoords.lat, pickupCoords.lng],
          [destinationCoords.lat, destinationCoords.lng]
        ],
        { color: '#3B82F6', weight: 6, opacity: 0.9, dashArray: '10,10' }
      ).addTo(map);

      const bounds = L.latLngBounds(
        [pickupCoords.lat, pickupCoords.lng],
        [destinationCoords.lat, destinationCoords.lng]
      );
      map.fitBounds(bounds, { padding: [60, 60] });

      return () => {
        map.removeLayer(polyline);
      };
    }
  }, [map, pickupCoords, destinationCoords]);

  return null;
}

export default function MapComponent({ pickupCoords, destinationCoords }) {
  const center = pickupCoords 
    ? [pickupCoords.lat, pickupCoords.lng]
    : [48.8566, 2.3522]; // Paris par défaut

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%', borderRadius: '1rem', filter: 'none', opacity: 1, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {pickupCoords && (
        <Marker position={[pickupCoords.lat, pickupCoords.lng]} icon={ModernIcon}>
          <Popup>Départ</Popup>
        </Marker>
      )}

      {destinationCoords && (
        <Marker position={[destinationCoords.lat, destinationCoords.lng]} icon={ModernIcon}>
          <Popup>Destination</Popup>
        </Marker>
      )}

      {pickupCoords && destinationCoords && (
        <RouteLine pickupCoords={pickupCoords} destinationCoords={destinationCoords} />
      )}
    </MapContainer>
  );
}
