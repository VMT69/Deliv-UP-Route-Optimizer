
// Service for getting road-based routes between locations
export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface RouteSegment {
  coordinates: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
}

// Get route between two points using OpenRouteService (free tier)
export const getRoute = async (
  start: RoutePoint,
  end: RoutePoint
): Promise<RouteSegment | null> => {
  try {
    // Using OpenRouteService free API (no API key required for basic usage)
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`;
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
      }
    });

    if (!response.ok) {
      console.error('Routing API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.features && data.features[0]) {
      const route = data.features[0];
      const coordinates = route.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
      
      return {
        coordinates,
        distance: route.properties.segments[0].distance,
        duration: route.properties.segments[0].duration
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching route:', error);
    return null;
  }
};

// Get road-based distance between two points
export const getRoadDistance = async (
  start: RoutePoint,
  end: RoutePoint
): Promise<number> => {
  const route = await getRoute(start, end);
  if (route) {
    return route.distance / 1000; // Convert to kilometers
  }
  
  // Fallback to Haversine distance if routing fails
  return calculateHaversineDistance(start.lat, start.lng, end.lat, end.lng);
};

// Haversine formula as fallback
const calculateHaversineDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};
