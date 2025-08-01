// RouteService.js - Service for calculating road routes in France

export class RouteService {
    constructor(apiKey = null) {
      // OpenRouteService - 2000 requests/day free
      this.openRouteServiceKey = process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY;
      this.openRouteServiceUrl = 'https://api.openrouteservice.org/v2/directions/driving-car';
      
      // Backup: OSRM (completely free, no API key needed)
      this.osrmUrl = 'https://router.project-osrm.org/route/v1/driving';
    }
  
    /**
     * Calculate route using OpenRouteService (preferred for France)
     * Includes traffic conditions and construction info
     */
    async calculateRouteORS(startCoords, endCoords) {
      try {
        const params = new URLSearchParams({
          start: `${startCoords.lng},${startCoords.lat}`,
          end: `${endCoords.lng},${endCoords.lat}`,
          format: 'geojson',
          geometry_format: 'geojson',
          instructions: 'true',
          elevation: 'false',
          extra_info: 'waytype|surface|steepness|tollways',
          radiuses: '1000', // Allow 1km radius for road snapping
          continue_straight: 'false'
        });
  
        const url = `${this.openRouteServiceUrl}?${params}`;
        
        const headers = {};
        if (this.openRouteServiceKey) {
          headers['Authorization'] = this.openRouteServiceKey;
        }
  
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          throw new Error(`OpenRouteService error: ${response.status}`);
        }
  
        const data = await response.json();
        
        if (!data.features || data.features.length === 0) {
          throw new Error('No route found');
        }
  
        const route = data.features[0];
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Convert to [lat, lng]
        
        return {
          coordinates,
          distance: route.properties.segments[0].distance, // meters
          duration: route.properties.segments[0].duration, // seconds
          instructions: route.properties.segments[0].steps || [],
          service: 'OpenRouteService'
        };
      } catch (error) {
        console.warn('OpenRouteService failed:', error.message);
        throw error;
      }
    }
  
    /**
     * Calculate route using OSRM (fallback, completely free)
     */
    async calculateRouteOSRM(startCoords, endCoords) {
      try {
        const url = `${this.osrmUrl}/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson&steps=true`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`OSRM error: ${response.status}`);
        }
  
        const data = await response.json();
        
        if (!data.routes || data.routes.length === 0) {
          throw new Error('No route found');
        }
  
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Convert to [lat, lng]
        
        return {
          coordinates,
          distance: route.distance, // meters
          duration: route.duration, // seconds
          instructions: route.legs[0]?.steps || [],
          service: 'OSRM'
        };
      } catch (error) {
        console.warn('OSRM failed:', error.message);
        throw error;
      }
    }
  
    /**
     * Calculate route with automatic fallback
     * Tries OpenRouteService first (better for France), then OSRM
     */
    async calculateRoute(startCoords, endCoords) {
      // Input validation
      if (!startCoords || !endCoords || 
          !startCoords.lat || !startCoords.lng || 
          !endCoords.lat || !endCoords.lng) {
        throw new Error('Invalid coordinates provided');
      }
  
      // Check if coordinates are roughly in France bounds
      const franceBounds = {
        north: 51.1,
        south: 41.3,
        east: 9.6,
        west: -5.2
      };
  
      const isInFrance = (coord) => 
        coord.lat >= franceBounds.south && coord.lat <= franceBounds.north &&
        coord.lng >= franceBounds.west && coord.lng <= franceBounds.east;
  
      if (!isInFrance(startCoords) || !isInFrance(endCoords)) {
        console.warn('Coordinates appear to be outside France bounds');
      }
  
      // Try OpenRouteService first (better traffic info for France)
      try {
        const result = await this.calculateRouteORS(startCoords, endCoords);
        console.log(`Route calculated successfully using ${result.service}`);
        return result;
      } catch (orsError) {
        console.log('Falling back to OSRM...');
        
        // Fallback to OSRM
        try {
          const result = await this.calculateRouteOSRM(startCoords, endCoords);
          console.log(`Route calculated successfully using ${result.service}`);
          return result;
        } catch (osrmError) {
          console.error('Both routing services failed:', { orsError, osrmError });
          throw new Error('Unable to calculate route with any service');
        }
      }
    }
  
    /**
     * Format duration to human readable string
     */
    formatDuration(seconds) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      
      if (hours > 0) {
        return `${hours}h ${minutes}min`;
      }
      return `${minutes}min`;
    }
  
    /**
     * Format distance to human readable string
     */
    formatDistance(meters) {
      if (meters >= 1000) {
        return `${(meters / 1000).toFixed(1)} km`;
      }
      return `${Math.round(meters)} m`;
    }
  }
  
  // React Hook for using the route service
  import { useState, useEffect, useCallback } from 'react';
  
  export function useRouteCalculation(apiKey = null) {
    const [routeService] = useState(() => new RouteService(apiKey));
    const [currentRoute, setCurrentRoute] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
  
    const calculateRoute = useCallback(async (startCoords, endCoords) => {
      if (!startCoords || !endCoords) {
        setCurrentRoute(null);
        return;
      }
  
      setLoading(true);
      setError(null);
      
      try {
        const route = await routeService.calculateRoute(startCoords, endCoords);
        setCurrentRoute(route);
        return route;
      } catch (err) {
        setError(err.message);
        setCurrentRoute(null);
        console.error('Route calculation failed:', err);
      } finally {
        setLoading(false);
      }
    }, [routeService]);
  
    const clearRoute = useCallback(() => {
      setCurrentRoute(null);
      setError(null);
    }, []);
  
    return {
      calculateRoute,
      clearRoute,
      currentRoute,
      loading,
      error,
      formatDuration: routeService.formatDuration,
      formatDistance: routeService.formatDistance
    };
  }
  
  // Helper function to get OpenRouteService API key from environment
  export function getOpenRouteServiceKey() {
    // In Next.js, use NEXT_PUBLIC_ prefix for client-side access
    return process.env.NEXT_PUBLIC_OPENROUTESERVICE_API_KEY || null;
  }