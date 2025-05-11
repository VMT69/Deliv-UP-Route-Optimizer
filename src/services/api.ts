
import axios from 'axios';
import { Customer } from '@/types/customer';

// Mock API service for route optimization
// In a real application, this would call your Express backend
export const optimizeRoute = async (customers: Customer[]): Promise<Customer[]> => {
  // For this demo, we'll implement a simple nearest neighbor algorithm directly in the frontend
  // In production, this would be a call to your backend API
  console.log('Optimizing route for customers:', customers);
  
  // Simulate API call with a delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Starting point (could be current location or depot)
  const start = { lat: 40.7128, lng: -74.0060 }; // New York City as default starting point
  
  // Clone the customers array to avoid mutating the original
  const remaining = [...customers];
  const optimizedRoute: Customer[] = [];
  let currentPoint = start;
  
  // Simple nearest neighbor algorithm
  while (remaining.length > 0) {
    // Find nearest customer to current point
    const nearestIndex = findNearestCustomerIndex(currentPoint, remaining);
    const nearestCustomer = remaining.splice(nearestIndex, 1)[0];
    optimizedRoute.push(nearestCustomer);
    currentPoint = { lat: nearestCustomer.location.lat, lng: nearestCustomer.location.lng };
  }
  
  return optimizedRoute;
};

// Helper function to find the nearest customer from current point
const findNearestCustomerIndex = (
  point: { lat: number, lng: number }, 
  customers: Customer[]
): number => {
  let minDistance = Infinity;
  let nearestIndex = 0;
  
  customers.forEach((customer, index) => {
    const distance = calculateDistance(
      point.lat, 
      point.lng, 
      customer.location.lat, 
      customer.location.lng
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestIndex = index;
    }
  });
  
  return nearestIndex;
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

// Mock customer data
export const getMockCustomers = (): Customer[] => {
  return [
    {
      id: '1',
      name: 'John Smith',
      address: '123 Main St, New York, NY 10001',
      phone: '(212) 555-1234',
      location: { lat: 40.7128, lng: -74.0060 },
      status: 'pending'
    },
    {
      id: '2',
      name: 'Jane Doe',
      address: '456 Park Ave, New York, NY 10022',
      phone: '(212) 555-5678',
      location: { lat: 40.7580, lng: -73.9855 },
      status: 'pending'
    },
    {
      id: '3',
      name: 'Robert Johnson',
      address: '789 Broadway, New York, NY 10003',
      phone: '(212) 555-9012',
      location: { lat: 40.7264, lng: -73.9878 },
      status: 'pending'
    },
    {
      id: '4',
      name: 'Sarah Williams',
      address: '101 5th Ave, New York, NY 10010',
      phone: '(212) 555-3456',
      location: { lat: 40.7410, lng: -73.9896 },
      status: 'pending'
    },
    {
      id: '5',
      name: 'Michael Brown',
      address: '202 W 21st St, New York, NY 10011',
      phone: '(212) 555-7890',
      location: { lat: 40.7430, lng: -74.0018 },
      status: 'pending'
    }
  ];
};
