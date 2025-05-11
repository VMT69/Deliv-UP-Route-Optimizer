
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Customer } from '@/types/customer';
import { getMockCustomers, optimizeRoute } from '@/services/api';
import DeliveryMap from '@/components/DeliveryMap';
import CustomerList from '@/components/CustomerList';
import { MapPin, Plus } from 'lucide-react';
import NewDeliveryForm from '@/components/NewDeliveryForm';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Delivery = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [journeyStarted, setJourneyStarted] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<[number, number] | undefined>(undefined);
  const [isWatchingLocation, setIsWatchingLocation] = useState(false);
  const [locationWatchId, setLocationWatchId] = useState<number | null>(null);
  const { toast } = useToast();

  // Watch current location when journey starts
  useEffect(() => {
    if (journeyStarted && !isWatchingLocation) {
      // Initial location fetch
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location Error",
            description: "Couldn't access your location. Using default Bangalore center.",
            variant: "destructive",
          });
          setCurrentLocation([12.9716, 77.5946]); // Default to Bangalore
        }
      );

      // Start watching location
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setCurrentLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error('Error watching location:', error);
        }
      );

      setLocationWatchId(watchId);
      setIsWatchingLocation(true);
    }

    // Cleanup
    return () => {
      if (locationWatchId !== null) {
        navigator.geolocation.clearWatch(locationWatchId);
      }
    };
  }, [journeyStarted, isWatchingLocation, toast]);

  const startJourney = async () => {
    try {
      setIsLoading(true);
      
      // Get mock customers
      const mockCustomers = getMockCustomers();
      
      // Optimize the route
      const optimizedCustomers = await optimizeRoute(mockCustomers);
      
      // Set the first customer as current
      if (optimizedCustomers.length > 0) {
        optimizedCustomers[0].status = 'current';
      }
      
      setCustomers(optimizedCustomers);
      setJourneyStarted(true);
      
      toast({
        title: "Journey Started",
        description: `Optimized route for ${optimizedCustomers.length} deliveries in Bangalore`,
      });
    } catch (error) {
      console.error('Failed to start journey:', error);
      toast({
        title: "Error Starting Journey",
        description: "Failed to optimize the delivery route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliveryComplete = (customerId: string) => {
    setCustomers(prev => {
      const updatedCustomers = [...prev];
      
      // Find the index of the completed customer
      const completedIndex = updatedCustomers.findIndex(c => c.id === customerId);
      if (completedIndex === -1) return prev;
      
      // Mark the customer as completed
      updatedCustomers[completedIndex].status = 'completed';
      
      // Find the next pending customer
      const nextPendingIndex = updatedCustomers.findIndex(
        (c, index) => index > completedIndex && c.status === 'pending'
      );
      
      // If there's a next customer, mark it as current
      if (nextPendingIndex !== -1) {
        updatedCustomers[nextPendingIndex].status = 'current';
      }
      
      toast({
        title: "Delivery Completed",
        description: `Delivery to ${updatedCustomers[completedIndex].name} marked as completed`,
      });
      
      return updatedCustomers;
    });
  };

  const handleAddNewDelivery = async (newCustomer: Omit<Customer, 'id' | 'status'>) => {
    try {
      setIsLoading(true);

      // Create new customer object with id and status
      const newCustomerId = `${customers.length + 1}-${Date.now()}`;
      const customerToAdd: Customer = {
        id: newCustomerId,
        ...newCustomer,
        status: 'pending'
      };

      // Optimize route with the new customer
      let updatedCustomers: Customer[];

      if (customers.length === 0) {
        // If no existing customers, just add the new one as current
        updatedCustomers = [{ ...customerToAdd, status: 'current' }];
      } else {
        // Create an array with existing customers and the new one
        const combinedCustomers = [...customers, customerToAdd];
        
        // Re-optimize the route
        const optimized = await optimizeRoute(combinedCustomers);
        
        // Preserve the status of existing customers
        updatedCustomers = optimized.map(c => {
          if (c.id === newCustomerId) return c; // New customer
          
          const existingCustomer = customers.find(ec => ec.id === c.id);
          if (existingCustomer) return { ...c, status: existingCustomer.status };
          
          return c;
        });
      }

      setCustomers(updatedCustomers);
      
      toast({
        title: "Delivery Added",
        description: `New delivery to ${newCustomer.name} has been added to your route`,
      });

    } catch (error) {
      console.error('Failed to add new delivery:', error);
      toast({
        title: "Error Adding Delivery", 
        description: "Failed to add new delivery to the route. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetJourney = () => {
    // Clear location watch
    if (locationWatchId !== null) {
      navigator.geolocation.clearWatch(locationWatchId);
      setLocationWatchId(null);
      setIsWatchingLocation(false);
    }
    
    setCustomers([]);
    setJourneyStarted(false);
    setCurrentLocation(undefined);
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">DeliUp</h1>
        <p className="text-muted-foreground">
          Efficiently manage deliveries across Bangalore
        </p>
      </div>
      
      {!journeyStarted ? (
        <div className="flex flex-col items-center justify-center py-16 bg-muted rounded-lg">
          <div className="bg-background p-8 rounded-lg shadow-sm max-w-md w-full text-center">
            <MapPin className="mx-auto h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ready for Deliveries?</h2>
            <p className="text-muted-foreground mb-6">
              Start your journey to optimize delivery routes across Bangalore.
            </p>
            <Button 
              onClick={startJourney} 
              disabled={isLoading} 
              className="w-full"
              size="lg"
            >
              {isLoading ? "Optimizing Route..." : "Start Journey"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Delivery Map</h2>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Delivery
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Delivery</DialogTitle>
                    <DialogDescription>
                      Enter the customer details for the new delivery.
                    </DialogDescription>
                  </DialogHeader>
                  <NewDeliveryForm onAddDelivery={handleAddNewDelivery} isLoading={isLoading} />
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" onClick={resetJourney}>
                Reset Journey
              </Button>
            </div>
          </div>
          
          <DeliveryMap customers={customers} currentLocation={currentLocation} />
          
          <CustomerList 
            customers={customers} 
            onDeliveryComplete={handleDeliveryComplete} 
          />
          
          {customers.every(c => c.status === 'completed') && customers.length > 0 && (
            <div className="bg-green-100 p-4 rounded-lg border border-green-200 text-center">
              <h3 className="font-semibold text-green-800 mb-2">
                All Deliveries Completed!
              </h3>
              <p className="text-green-700 mb-4">
                You've successfully completed all deliveries for today.
              </p>
              <Button onClick={resetJourney} variant="outline" className="bg-white">
                Start New Journey
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Delivery;
