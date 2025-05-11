
export type DeliveryStatus = 'pending' | 'completed' | 'current';

export interface Customer {
  id: string;
  name: string;
  address: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
  };
  status: DeliveryStatus;
}
