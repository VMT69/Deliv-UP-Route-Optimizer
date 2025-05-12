import axios from 'axios';
import { Customer } from '@/types/customer';

// Enhanced route optimization using Nearest Neighbor algorithm
// prioritizing efficient routing rather than sequence order
export const optimizeRoute = async (customers: Customer[], currentLocation?: { lat: number, lng: number }): Promise<Customer[]> => {
  console.log('Optimizing route for customers:', customers);
  
  // If no customers, return empty array
  if (customers.length === 0) return [];
  
  // Simulate API call with a delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Use provided current location or default Bangalore location
  let start = currentLocation || { lat: 12.9716, lng: 77.5946 };
  
  // If we don't have current location explicitly passed, try to get it
  if (!currentLocation && typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => 
        navigator.geolocation.getCurrentPosition(resolve, reject, { 
          enableHighAccuracy: true, 
          timeout: 5000, 
          maximumAge: 0 
        })
      );
      
      start = { 
        lat: position.coords.latitude, 
        lng: position.coords.longitude 
      };
      console.log('Using current position for optimization:', start);
    } catch (error) {
      console.error("Couldn't get current location, using default:", error);
    }
  }
  
  // Clone the customers array to avoid mutating the original
  const customersClone = customers.map(customer => ({...customer}));
  
  // Separate customers by status
  const completedCustomers = customersClone.filter(c => c.status === 'completed');
  const currentCustomer = customersClone.find(c => c.status === 'current');
  const pendingCustomers = customersClone.filter(c => c.status === 'pending');
  
  // The final optimized route
  const optimizedRoute: Customer[] = [];
  
  // First, add all completed customers (keep their original order)
  optimizedRoute.push(...completedCustomers);
  
  // For path optimization we'll only work with current and pending customers
  // Include current customer in the optimization if it exists
  const remainingCustomers = currentCustomer 
    ? [currentCustomer, ...pendingCustomers] 
    : [...pendingCustomers];
  
  // If we have no remaining customers, return just the completed ones
  if (remainingCustomers.length === 0) {
    return optimizedRoute;
  }
  
  // Enhanced nearest neighbor algorithm
  // Always start from the user's current location
  let currentPoint = start;
  const unvisited = [...remainingCustomers];
  
  while (unvisited.length > 0) {
    // Find nearest unvisited customer from current point
    let nearestIndex = -1;
    let minDistance = Infinity;
    
    // Find the genuinely closest location from the current point
    for (let i = 0; i < unvisited.length; i++) {
      const distance = calculateDistance(
        currentPoint.lat,
        currentPoint.lng,
        unvisited[i].location.lat,
        unvisited[i].location.lng
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = i;
      }
    }
    
    // Add nearest customer to optimized route
    if (nearestIndex !== -1) {
      const nearestCustomer = unvisited.splice(nearestIndex, 1)[0];
      optimizedRoute.push(nearestCustomer);
      
      // Update current point for next iteration
      currentPoint = { 
        lat: nearestCustomer.location.lat, 
        lng: nearestCustomer.location.lng 
      };
    }
  }
  
  return optimizedRoute;
};

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (
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

// Mock customer data - Bangalore locations
export const getMockCustomers = (): Customer[] => {
  return [
    {
      id: '1',
      name: 'Rahul Sharma',
      address: '42, Richmond Road, Bangalore, 560025',
      phone: '+91 98765 43210',
      location: { lat: 12.9647, lng: 77.6082 },
      status: 'pending'
    },
    {
      id: '2',
      name: 'Priya Patel',
      address: '121, MG Road, Bangalore, 560001',
      phone: '+91 87654 32109',
      location: { lat: 12.9758, lng: 77.6065 },
      status: 'pending'
    },
    {
      id: '3',
      name: 'Vikram Malhotra',
      address: '78, Indiranagar 100ft Road, Bangalore, 560038',
      phone: '+91 76543 21098',
      location: { lat: 12.9784, lng: 77.6408 },
      status: 'pending'
    },
    {
      id: '4',
      name: 'Ananya Desai',
      address: '22, Koramangala 5th Block, Bangalore, 560095',
      phone: '+91 65432 10987',
      location: { lat: 12.9340, lng: 77.6155 },
      status: 'pending'
    },
    {
      id: '5',
      name: 'Karthik Iyer',
      address: '155, HSR Layout, Bangalore, 560102',
      phone: '+91 54321 09876',
      location: { lat: 12.9116, lng: 77.6416 },
      status: 'pending'
    }
  ];
};
