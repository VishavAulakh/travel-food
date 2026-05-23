export type DeliveryRequest = {
  id: string;
  orderId: string;
  restaurant: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    distanceFromRiderKm: number;
  };
  customer: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    distanceFromRestaurantKm: number;
  };
  items: { name: string; qty: number }[];
  totalPaise: number;
  payoutPaise: number;
  estimatedDeliveryMinutes: number;
  createdAt: string;
  status: "pending" | "accepted" | "picked_up" | "delivered";
};

export const deliveryRequests: DeliveryRequest[] = [
  {
    id: "dr-001",
    orderId: "#TF100291",
    restaurant: {
      name: "Paradise Biryani",
      address: "80 Feet Rd, Koramangala 4th Block, Bengaluru",
      lat: 12.9352,
      lng: 77.6245,
      distanceFromRiderKm: 0.4,
    },
    customer: {
      name: "Aditya Sharma",
      address: "Indiranagar 100 Feet Rd, Bengaluru - 560038",
      lat: 12.9719,
      lng: 77.6412,
      distanceFromRestaurantKm: 1.8,
    },
    items: [
      { name: "Chicken Dum Biryani", qty: 2 },
      { name: "Raita", qty: 1 },
    ],
    totalPaise: 54000,
    payoutPaise: 4200,
    estimatedDeliveryMinutes: 22,
    createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
    status: "pending",
  },
  {
    id: "dr-002",
    orderId: "#TF100292",
    restaurant: {
      name: "MTR 1924",
      address: "Lalbagh Rd, Mavalli, Bengaluru - 560004",
      lat: 12.9472,
      lng: 77.5918,
      distanceFromRiderKm: 0.9,
    },
    customer: {
      name: "Priya Menon",
      address: "27th Main, HSR Layout Sector 2, Bengaluru - 560102",
      lat: 12.9116,
      lng: 77.6389,
      distanceFromRestaurantKm: 2.6,
    },
    items: [
      { name: "Masala Dosa", qty: 2 },
      { name: "Filter Coffee", qty: 2 },
      { name: "Kesari Bath", qty: 1 },
    ],
    totalPaise: 38000,
    payoutPaise: 3500,
    estimatedDeliveryMinutes: 28,
    createdAt: new Date(Date.now() - 4 * 60000).toISOString(),
    status: "pending",
  },
  {
    id: "dr-003",
    orderId: "#TF100293",
    restaurant: {
      name: "Truffles",
      address: "St. John's Rd, Shivajinagar, Bengaluru - 560042",
      lat: 12.9767,
      lng: 77.6101,
      distanceFromRiderKm: 1.3,
    },
    customer: {
      name: "Rahul Nair",
      address: "Jayanagar 4th T Block, Bengaluru - 560041",
      lat: 12.9299,
      lng: 77.5920,
      distanceFromRestaurantKm: 3.4,
    },
    items: [
      { name: "That Burger", qty: 1 },
      { name: "Loaded Fries", qty: 1 },
      { name: "Chocolate Shake", qty: 1 },
    ],
    totalPaise: 72000,
    payoutPaise: 5500,
    estimatedDeliveryMinutes: 35,
    createdAt: new Date(Date.now() - 1 * 60000).toISOString(),
    status: "pending",
  },
  {
    id: "dr-004",
    orderId: "#TF100288",
    restaurant: {
      name: "Burger King",
      address: "Phoenix MarketCity, Whitefield, Bengaluru - 560066",
      lat: 12.9982,
      lng: 77.6969,
      distanceFromRiderKm: 2.1,
    },
    customer: {
      name: "Sneha Reddy",
      address: "ITPL Main Rd, Whitefield, Bengaluru - 560048",
      lat: 12.9914,
      lng: 77.7063,
      distanceFromRestaurantKm: 1.2,
    },
    items: [
      { name: "Whopper", qty: 2 },
      { name: "Onion Rings", qty: 1 },
      { name: "Coke", qty: 2 },
    ],
    totalPaise: 82000,
    payoutPaise: 4800,
    estimatedDeliveryMinutes: 20,
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    status: "accepted",
  },
  {
    id: "dr-005",
    orderId: "#TF100280",
    restaurant: {
      name: "Saravana Bhavan",
      address: "Koramangala 1st Block, Bengaluru - 560034",
      lat: 12.9279,
      lng: 77.6271,
      distanceFromRiderKm: 0.6,
    },
    customer: {
      name: "Karthik Iyer",
      address: "BTM Layout 2nd Stage, Bengaluru - 560076",
      lat: 12.9165,
      lng: 77.6101,
      distanceFromRestaurantKm: 2.0,
    },
    items: [
      { name: "Ghee Pongal", qty: 1 },
      { name: "Sambar Vada", qty: 2 },
    ],
    totalPaise: 29000,
    payoutPaise: 2800,
    estimatedDeliveryMinutes: 25,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    status: "delivered",
  },
  {
    id: "dr-006",
    orderId: "#TF100275",
    restaurant: {
      name: "Wow! Momo",
      address: "Indiranagar 12th Main, Bengaluru - 560038",
      lat: 12.9784,
      lng: 77.6405,
      distanceFromRiderKm: 1.8,
    },
    customer: {
      name: "Ananya Singh",
      address: "HAL 3rd Stage, Indiranagar, Bengaluru - 560075",
      lat: 12.9638,
      lng: 77.6487,
      distanceFromRestaurantKm: 1.4,
    },
    items: [
      { name: "Steamed Momos (8 pcs)", qty: 2 },
      { name: "Fried Momos (8 pcs)", qty: 1 },
    ],
    totalPaise: 42000,
    payoutPaise: 3800,
    estimatedDeliveryMinutes: 30,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    status: "delivered",
  },
  {
    id: "dr-007",
    orderId: "#TF100268",
    restaurant: {
      name: "Behrouz Biryani",
      address: "Marathahalli Bridge, Bengaluru - 560037",
      lat: 12.9592,
      lng: 77.6974,
      distanceFromRiderKm: 2.5,
    },
    customer: {
      name: "Vikram Patel",
      address: "Varthur Main Rd, Whitefield, Bengaluru - 560066",
      lat: 12.9456,
      lng: 77.7142,
      distanceFromRestaurantKm: 3.8,
    },
    items: [
      { name: "Royal Murgh Biryani", qty: 1 },
      { name: "Boti Korma", qty: 1 },
      { name: "Shahi Tukda", qty: 1 },
    ],
    totalPaise: 96000,
    payoutPaise: 5800,
    estimatedDeliveryMinutes: 40,
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    status: "delivered",
  },
  {
    id: "dr-008",
    orderId: "#TF100261",
    restaurant: {
      name: "Faasos",
      address: "Electronic City Phase 1, Bengaluru - 560100",
      lat: 12.8450,
      lng: 77.6602,
      distanceFromRiderKm: 0.3,
    },
    customer: {
      name: "Meera Krishnan",
      address: "Electronic City Phase 2, Bengaluru - 560100",
      lat: 12.8398,
      lng: 77.6687,
      distanceFromRestaurantKm: 0.8,
    },
    items: [
      { name: "Chicken Wrap", qty: 2 },
      { name: "Naan Roll", qty: 1 },
    ],
    totalPaise: 35000,
    payoutPaise: 2600,
    estimatedDeliveryMinutes: 18,
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    status: "delivered",
  },
];

export const getRequestById = (id: string) =>
  deliveryRequests.find((r) => r.id === id);

export const pendingRequests = deliveryRequests.filter((r) => r.status === "pending");

export const deliveryHistory = deliveryRequests.filter((r) => r.status === "delivered");
