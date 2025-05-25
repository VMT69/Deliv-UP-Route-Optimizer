
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
  console.log('Optimizing route for customers using Kruskal\'s MST algorithm:', customers);
  
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

  // Sort remaining customers by distance from start point to prioritize closest ones
  const customersWithDistance = remainingCustomers.map(customer => ({
    customer,
    distance: calculateDistance(
      start.lat,
      start.lng,
      customer.location.lat,
      customer.location.lng
    )
  }));

  // Sort by distance - closest first
  customersWithDistance.sort((a, b) => a.distance - b.distance);
  
  // If we only have one or two customers, just return them sorted by distance
  if (customersWithDistance.length <= 2) {
    optimizedRoute.push(...customersWithDistance.map(item => item.customer));
    return optimizedRoute;
  }
  
  // For more than 2 customers, use MST but ensure the closest one is first
  const sortedCustomers = customersWithDistance.map(item => item.customer);
  
  // Create a list of all locations including the current location
  const locations: Array<{ lat: number, lng: number, index: number }> = [
    { ...start, index: -1 } // Current location has index -1
  ];
  
  // Add all remaining customer locations
  sortedCustomers.forEach((customer, i) => {
    locations.push({
      lat: customer.location.lat,
      lng: customer.location.lng,
      index: i
    });
  });
  
  // Generate all edges between locations with their distances as weights
  const edges: Edge[] = [];
  
  for (let i = 0; i < locations.length; i++) {
    for (let j = i + 1; j < locations.length; j++) {
      const distance = calculateDistance(
        locations[i].lat,
        locations[i].lng,
        locations[j].lat,
        locations[j].lng
      );
      
      edges.push({
        start: i,
        end: j,
        weight: distance
      });
    }
  }
  
  // Sort edges by weight (distance) in ascending order
  edges.sort((a, b) => a.weight - b.weight);
  
  // Apply Kruskal's algorithm to find MST
  const n = locations.length;
  const mst: Edge[] = [];
  const disjointSet = new DisjointSet(n);
  
  for (const edge of edges) {
    if (disjointSet.find(edge.start) !== disjointSet.find(edge.end)) {
      mst.push(edge);
      disjointSet.union(edge.start, edge.end);
    }
    
    // Stop when we have n-1 edges (MST is complete)
    if (mst.length === n - 1) break;
  }
  
  // Convert MST to an adjacency list
  const graph: number[][] = Array(n).fill(0).map(() => []);
  for (const edge of mst) {
    graph[edge.start].push(edge.end);
    graph[edge.end].push(edge.start); // Undirected graph
  }
  
  // Instead of DFS, use a greedy approach starting from the current location
  // and always choosing the nearest unvisited neighbor
  const visited = Array(n).fill(false);
  const route: number[] = [];
  let currentNode = 0; // Start from current location
  
  visited[currentNode] = true;
  route.push(currentNode);
  
  // Greedily select the nearest unvisited customer
  while (route.length < n) {
    let nearestNode = -1;
    let nearestDistance = Infinity;
    
    // Find the nearest unvisited customer to current position
    for (let i = 1; i < n; i++) { // Start from 1 to skip current location
      if (!visited[i]) {
        const distance = calculateDistance(
          locations[currentNode].lat,
          locations[currentNode].lng,
          locations[i].lat,
          locations[i].lng
        );
        
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestNode = i;
        }
      }
    }
    
    if (nearestNode !== -1) {
      visited[nearestNode] = true;
      route.push(nearestNode);
      currentNode = nearestNode;
    } else {
      break;
    }
  }
  
  // Convert route indices back to customers
  // Skip the first index (0) as it's the current location
  for (let i = 1; i < route.length; i++) {
    const customerIndex = locations[route[i]].index;
    if (customerIndex >= 0) {
      optimizedRoute.push(sortedCustomers[customerIndex]);
    }
  }
  
  console.log('Optimized route with closest-first prioritization:', optimizedRoute);
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
