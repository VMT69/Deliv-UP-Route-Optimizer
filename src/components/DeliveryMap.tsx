
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Customer } from '@/types/customer';
import { getRoute } from '@/services/routingService';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default icon issues with Leaflet in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// This component updates the map center when coordinates change
function ChangeMapView({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  
  return null;
}

interface DeliveryMapProps {
  customers: Customer[];
  currentLocation?: [number, number];
}

const DeliveryMap = ({ customers, currentLocation }: DeliveryMapProps) => {
  const [routePaths, setRoutePaths] = useState<[number, number][][]>([]);
  
  // Bangalore coordinates
  const bangaloreCoords: [number, number] = [12.9716, 77.5946];
  
  // Create custom icons
  const completedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const pendingIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const currentIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  const currentLocationIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  // Calculate center position based on average of all customer coordinates
  function calculateCenterPosition(): [number, number] {
    if (customers.length === 0) return bangaloreCoords;

    const sumLat = customers.reduce((sum, customer) => sum + customer.location.lat, 0);
    const sumLng = customers.reduce((sum, customer) => sum + customer.location.lng, 0);
    
    return [sumLat / customers.length, sumLng / customers.length];
  }

  // Calculate center position
  const mapCenter = currentLocation || 
                   (customers.length > 0 ? calculateCenterPosition() : bangaloreCoords);

  // Fetch routes between consecutive customers
  useEffect(() => {
    const fetchRoutes = async () => {
      if (customers.length < 2) {
        setRoutePaths([]);
        return;
      }

      console.log('Fetching routes for visualization...');
      const paths: [number, number][][] = [];

      // Get route from current location to first customer
      if (currentLocation && customers.length > 0) {
        const route = await getRoute(
          { lat: currentLocation[0], lng: currentLocation[1] },
          { lat: customers[0].location.lat, lng: customers[0].location.lng }
        );
        if (route) {
          paths.push(route.coordinates);
        }
      }

      // Get routes between consecutive customers
      for (let i = 0; i < customers.length - 1; i++) {
        const start = customers[i];
        const end = customers[i + 1];
        
        const route = await getRoute(
          { lat: start.location.lat, lng: start.location.lng },
          { lat: end.location.lat, lng: end.location.lng }
        );
        
        if (route) {
          paths.push(route.coordinates);
        }
      }

      setRoutePaths(paths);
    };

    fetchRoutes();
  }, [customers, currentLocation]);

  return (
    <div className="h-[400px] rounded-lg overflow-hidden shadow-md">
      <MapContainer 
        center={mapCenter}
        zoom={12} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeMapView coords={mapCenter} />
        
        {/* Route paths */}
        {routePaths.map((path, index) => (
          <Polyline
            key={index}
            positions={path}
            pathOptions={{
              color: '#3b82f6',
              weight: 4,
              opacity: 0.7,
              dashArray: '10, 5'
            }}
          />
        ))}
        
        {/* Current location marker */}
        {currentLocation && (
          <Marker 
            position={currentLocation}
            icon={currentLocationIcon}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-bold">Your Current Location</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Customer markers */}
        {customers.map((customer) => {
          let markerIcon;
          if (customer.status === 'completed') {
            markerIcon = completedIcon;
          } else if (customer.status === 'current') {
            markerIcon = currentIcon;
          } else {
            markerIcon = pendingIcon;
          }
              
          return (
            <Marker 
              key={customer.id} 
              position={[customer.location.lat, customer.location.lng]}
              icon={markerIcon}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{customer.name}</p>
                  <p>{customer.address}</p>
                  <p>{customer.phone}</p>
                  <p className="font-semibold mt-1">
                    Status: {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                  </p>
                </div>
            </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;
