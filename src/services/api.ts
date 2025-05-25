import axios from 'axios';
import { Customer } from '@/types/customer';

// Kruskal's algorithm for finding Minimum Spanning Tree
interface Edge {
  start: number;
  end: number;
  weight: number;
}

class DisjointSet {
  private parent: number[];
  
  constructor(n: number) {
    this.parent = Array(n).fill(0).map((_, i) => i);
  }
  
  find(x: number): number {
    if (this.parent[x] !== x) {
      this.parent[x] = this.find(this.parent[x]); // Path compression
    }
    return this.parent[x];
  }
  
  union(x: number, y: number): void {
    const rootX = this.find(x);
    const rootY = this.find(y);
    if (rootX !== rootY) {
      this.parent[rootY] = rootX;
    }
  }
}

export const optimizeRoute = async (customers: Customer[], currentLocation?: { lat: number, lng: number }): Promise<Customer[]> => {
  console.log('Optimizing route for customers using enhanced closest-first algorithm:', customers);
  
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

  // Enhanced algorithm: If there's a current customer, start from their location
  // Otherwise, start from the provided location
  let optimizationStart = start;
  if (currentCustomer) {
    optimizationStart = currentCustomer.location;
  }

  // Sort ALL remaining customers by distance from the optimization start point
  const customersWithDistance = remainingCustomers.map(customer => ({
    customer,
    distance: calculateDistance(
      optimizationStart.lat,
      optimizationStart.lng,
      customer.location.lat,
      customer.location.lng
    )
  }));

  // Sort by distance - closest first
  customersWithDistance.sort((a, b) => a.distance - b.distance);
  
  // Special handling for single customer or when we have a current customer
  if (customersWithDistance.length === 1) {
    optimizedRoute.push(customersWithDistance[0].customer);
    return optimizedRoute;
  }

  // For route optimization, use a greedy nearest-neighbor approach starting from the closest customer
  const allCustomers = customersWithDistance.map(item => item.customer);
  
  // Start with the closest customer to our starting point
  const routeOrder: Customer[] = [];
  const visited = new Set<string>();
  
  // If we have a current customer, it should be processed first (but might not be the closest)
  if (currentCustomer && !visited.has(currentCustomer.id)) {
    routeOrder.push(currentCustomer);
    visited.add(currentCustomer.id);
  }
  
  // Current position for the next nearest neighbor search
  let currentPos = currentCustomer ? currentCustomer.location : optimizationStart;
  
  // Use nearest neighbor for the remaining customers
  while (visited.size < allCustomers.length) {
    let nearestCustomer: Customer | null = null;
    let nearestDistance = Infinity;
    
    // Find the nearest unvisited customer
    for (const customer of allCustomers) {
      if (!visited.has(customer.id)) {
        const distance = calculateDistance(
          currentPos.lat,
          currentPos.lng,
          customer.location.lat,
          customer.location.lng
        );
        
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestCustomer = customer;
        }
      }
    }
    
    if (nearestCustomer) {
      routeOrder.push(nearestCustomer);
      visited.add(nearestCustomer.id);
      currentPos = nearestCustomer.location;
    } else {
      break;
    }
  }
  
  // Add the optimized route to our final result
  optimizedRoute.push(...routeOrder);
  
  console.log('Enhanced route optimization with nearest-neighbor from closest point:', optimizedRoute);
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
