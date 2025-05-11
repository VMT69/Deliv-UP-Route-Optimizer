
import { Button } from '@/components/ui/button';
import { Customer } from '@/types/customer';
import { Check, Trash2 } from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  onDeliveryComplete: (customerId: string) => void;
  onDeleteDelivery?: (customerId: string) => void;
}

const CustomerList = ({ customers, onDeliveryComplete, onDeleteDelivery }: CustomerListProps) => {
  return (
    <div className="space-y-4 mt-4">
      <h2 className="text-xl font-bold">Delivery Route</h2>
      
      {customers.length === 0 ? (
        <div className="text-center p-8 bg-secondary rounded-lg">
          <p className="text-muted-foreground">No deliveries scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {customers.map((customer, index) => (
            <div 
              key={customer.id}
              className={`customer-card ${customer.status}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-primary text-primary-foreground rounded-full h-6 w-6 flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    
                    {customer.status === 'completed' && (
                      <span className="delivery-status-badge bg-green-100 text-green-800">
                        <Check className="mr-1 h-3 w-3" />
                        Delivered
                      </span>
                    )}
                    {customer.status === 'current' && (
                      <span className="delivery-status-badge bg-blue-100 text-blue-800">
                        Current
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm mt-1">{customer.address}</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant={customer.status === 'completed' ? "outline" : "default"}
                    size="sm"
                    disabled={customer.status === 'completed' || 
                              (customer.status === 'pending' && 
                               customers.some(c => c.status === 'current'))}
                    onClick={() => onDeliveryComplete(customer.id)}
                  >
                    {customer.status === 'completed' ? 'Delivered' : 'Mark Delivered'}
                  </Button>
                  
                  {onDeleteDelivery && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDeleteDelivery(customer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerList;
