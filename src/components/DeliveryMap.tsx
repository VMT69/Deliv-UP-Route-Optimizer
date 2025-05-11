
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { Customer } from '@/types/customer';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
  // Bangalore coordinates
  const bangaloreCoords: [number, number] = [12.9716, 77.5946];
  
  // Create custom icons
  const completedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  const pendingIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  const currentIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  const currentLocationIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    shadowSize: [41, 41],
  });

  // Create polyline coordinates for the route
  const polylinePositions = customers.map(customer => [
    customer.location.lat,
    customer.location.lng
  ]);

  // Calculate center position
  const mapCenter = currentLocation || 
                   (customers.length > 0 ? calculateCenterPosition() : bangaloreCoords);

  // Calculate center position based on average of all customer coordinates
  function calculateCenterPosition(): [number, number] {
    if (customers.length === 0) return bangaloreCoords;

    const sumLat = customers.reduce((sum, customer) => sum + customer.location.lat, 0);
    const sumLng = customers.reduce((sum, customer) => sum + customer.location.lng, 0);
    
    return [sumLat / customers.length, sumLng / customers.length];
  }

  return (
    <div className="h-[400px] rounded-lg overflow-hidden shadow-md">
      <MapContainer 
        center={bangaloreCoords}
        zoom={12} 
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <ChangeMapView coords={mapCenter} />
        
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
        {customers.map((customer) => (
          <Marker 
            key={customer.id} 
            position={[customer.location.lat, customer.location.lng]}
            icon={
              customer.status === 'completed' 
                ? completedIcon 
                : customer.status === 'current' 
                  ? currentIcon 
                  : pendingIcon
            }
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
        ))}
        
        {/* Route polyline */}
        {customers.length > 0 && (
          <Polyline 
            positions={polylinePositions}
            pathOptions={{ color: '#3B82F6', weight: 4, opacity: 0.7, dashArray: '10, 10' }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;
