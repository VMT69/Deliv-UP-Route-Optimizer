
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Customer } from '@/types/customer';
import { getMockCustomers, optimizeRoute } from '@/services/api';
import DeliveryMap from '@/components/DeliveryMap';
import CustomerList from '@/components/CustomerList';
import { MapPin } from 'lucide-react';

const Delivery = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [journeyStarted, setJourneyStarted] = useState(false);
  const { toast } = useToast();

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
        description: `Optimized route for ${optimizedCustomers.length} deliveries`,
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

  const resetJourney = () => {
    setCustomers([]);
    setJourneyStarted(false);
  };

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Delivery Route Optimizer</h1>
        <p className="text-muted-foreground">
          Efficiently manage deliveries with optimized routes
        </p>
      </div>
      
      {!journeyStarted ? (
        <div className="flex flex-col items-center justify-center py-16 bg-muted rounded-lg">
          <div className="bg-background p-8 rounded-lg shadow-sm max-w-md w-full text-center">
            <MapPin className="mx-auto h-12 w-12 text-primary mb-4" />
            <h2 className="text-xl font-semibold mb-2">Ready for Deliveries?</h2>
            <p className="text-muted-foreground mb-6">
              Start your journey to optimize the delivery route for today's customers.
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
            <Button variant="outline" onClick={resetJourney}>
              Reset Journey
            </Button>
          </div>
          
          <DeliveryMap customers={customers} />
          
          <CustomerList 
            customers={customers} 
            onDeliveryComplete={handleDeliveryComplete} 
          />
          
          {customers.every(c => c.status === 'completed') && (
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
