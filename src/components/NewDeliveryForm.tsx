import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Customer } from '@/types/customer';
import { useToast } from '@/components/ui/use-toast';

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
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isGeocoding) {
      toast({
        title: "Still finding location",
        description: "Please wait while we determine the exact location",
        variant: "destructive"
      });
      return;
    }
    
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

  const handleAddressChange = (addressValue: string) => {
    setAddress(addressValue);
  };

  useEffect(() => {
    // Debounce the geocoding request
    const timer = setTimeout(() => {
      if (address.length > 5) {
        geocodeAddress(address);
      }
    }, 800); // Wait 800ms after last keypress

    return () => clearTimeout(timer);
  }, [address]);

  // Geocode the address to get coordinates
  async function geocodeAddress(addressValue: string) {
    if (!addressValue || addressValue.length < 5) return;

    setIsGeocoding(true);
    try {
      // Add "Bangalore" to the address if it's not already included
      const fullAddress = addressValue.toLowerCase().includes('bangalore') 
        ? addressValue 
        : `${addressValue}, Bangalore, India`;

      // Use the OpenStreetMap Nominatim API for geocoding
      const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fullAddress)}&format=json&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        setLocation({
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        });
        
        toast({
          title: "Location found",
          description: "Address has been located on the map",
        });
      } else {
        // If API couldn't find the location, generate a location near Bangalore
        const randomOffset = () => (Math.random() - 0.5) * 0.05;
        setLocation({
          lat: 12.9716 + randomOffset(),
          lng: 77.5946 + randomOffset()
        });
        
        toast({
          title: "Using approximate location",
          description: "Couldn't find exact coordinates, using an approximate location in Bangalore",
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      // Fallback to random location
      const randomOffset = () => (Math.random() - 0.5) * 0.05;
      setLocation({
        lat: 12.9716 + randomOffset(),
        lng: 77.5946 + randomOffset()
      });
      
      toast({
        title: "Geocoding error",
        description: "Using approximate location in Bangalore area",
        variant: "destructive"
      });
    } finally {
      setIsGeocoding(false);
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
        {isGeocoding && (
          <p className="text-xs text-muted-foreground mt-1">Finding location...</p>
        )}
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
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading || isGeocoding}
        >
          {isLoading ? 'Adding...' : isGeocoding ? 'Finding Location...' : 'Add Delivery'}
        </Button>
      </div>
    </form>
  );
};

export default NewDeliveryForm;
