export type Rider = {
  id: string;
  name: string;
  phone: string;
  rating: number;
  totalDeliveries: number;
  vehicle: "bike" | "scooter" | "bicycle";
  vehicleNumber: string;
  photoUrl: string;
  // Live location (for tracking screen)
  lat: number;
  lng: number;
};

export const riders: Rider[] = [
  {
    id: "rider-101",
    name: "Ramesh Kumar",
    phone: "+91 98765 43210",
    rating: 4.8,
    totalDeliveries: 2840,
    vehicle: "scooter",
    vehicleNumber: "KA 05 HX 4521",
    photoUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
    lat: 12.9421,
    lng: 77.6289,
  },
  {
    id: "rider-102",
    name: "Suresh Yadav",
    phone: "+91 99876 54321",
    rating: 4.9,
    totalDeliveries: 4120,
    vehicle: "bike",
    vehicleNumber: "MH 12 KL 7889",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    lat: 19.0760,
    lng: 72.8777,
  },
];

export const getRiderById = (id: string) => riders.find((r) => r.id === id);
