
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Customer } from '@/types/customer';

interface NewDeliveryFormProps {
  onAddDelivery: (customer: Omit<Customer, 'id' | 'status'>) => void;
  isLoading: boolean;
}

const NewDeliveryForm = ({ onAddDelivery, isLoading }: NewDeliveryFormProps) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [location, setLocation] = useState({
    lat: 12.9716, // Default Bangalore latitude
    lng: 77.5946  // Default Bangalore longitude
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAddDelivery({
      name,
      address,
      phone,
      location
    });
    
    // Reset form
    setName('');
    setAddress('');
    setPhone('+91 ');
    setLocation({ lat: 12.9716, lng: 77.5946 });
  };

  // Geocode the address to get coordinates (simplified version)
  // In a real app, this would use a geocoding API like Google Maps
  const handleAddressChange = (addressValue: string) => {
    setAddress(addressValue);
    
    // This is a simulation of geocoding - in a real app, 
    // you would call a geocoding API here
    // For now, we'll just randomly adjust coordinates near Bangalore
    if (addressValue.length > 5) {
      // Generate a location somewhere in Bangalore area
      const randomOffset = () => (Math.random() - 0.5) * 0.05;
      setLocation({
        lat: 12.9716 + randomOffset(),
        lng: 77.5946 + randomOffset()
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Customer Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Rahul Sharma"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={address}
          onChange={(e) => handleAddressChange(e.target.value)}
          placeholder="121, MG Road, Bangalore, 560001"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            type="number"
            step="0.0001"
            value={location.lat}
            onChange={(e) => setLocation({ ...location, lat: parseFloat(e.target.value) })}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            type="number"
            step="0.0001"
            value={location.lng}
            onChange={(e) => setLocation({ ...location, lng: parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>
      
      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Delivery'}
        </Button>
      </div>
    </form>
  );
};

export default NewDeliveryForm;
