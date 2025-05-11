
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { Icon } from 'leaflet';
import { Customer } from '@/types/customer';
import 'leaflet/dist/leaflet.css';

interface DeliveryMapProps {
  customers: Customer[];
}

const DeliveryMap = ({ customers }: DeliveryMapProps) => {
  // Create custom icons
  const completedIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const pendingIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const currentIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  // Create polyline coordinates for the route
  const polylinePositions = customers.map(customer => [
    customer.location.lat,
    customer.location.lng
  ]);

  // Calculate center position based on average of all customer coordinates
  const calculateCenterPosition = () => {
    if (customers.length === 0) return [40.7128, -74.0060]; // Default to NYC

    const sumLat = customers.reduce((sum, customer) => sum + customer.location.lat, 0);
    const sumLng = customers.reduce((sum, customer) => sum + customer.location.lng, 0);
    
    return [sumLat / customers.length, sumLng / customers.length];
  };

  return (
    <div className="h-[400px] rounded-lg overflow-hidden shadow-md">
      <MapContainer 
        center={calculateCenterPosition() as [number, number]} 
        zoom={13} 
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
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
        
        <Polyline 
          positions={polylinePositions as [number, number][]} 
          color="#3B82F6" 
          weight={4} 
          opacity={0.7} 
          dashArray="10, 10"
        />
      </MapContainer>
    </div>
  );
};

export default DeliveryMap;
