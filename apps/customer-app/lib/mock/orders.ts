export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready"
  | "picked_up"
  | "on_the_way"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  id: string;
  name: string;
  qty: number;
  pricePaise: number;
  isVeg: boolean;
};

export type Order = {
  id: string;
  shortId: string; // displayed to user
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  restaurantArea: string;
  items: OrderItem[];
  itemsTotalPaise: number;
  deliveryFeePaise: number;
  taxPaise: number;
  discountPaise: number;
  totalPaise: number;
  status: OrderStatus;
  placedAt: string; // ISO
  expectedAt?: string; // ISO
  deliveredAt?: string; // ISO
  addressId: string;
  paymentMethod: "upi" | "card" | "cod" | "wallet";
  paymentLabel: string;
  riderId?: string;
};

const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60_000).toISOString();
const minsFromNow = (m: number) => new Date(now + m * 60_000).toISOString();

export const orders: Order[] = [
  {
    id: "o1",
    shortId: "GO-49281",
    restaurantId: "r1",
    restaurantName: "Paradise Biryani",
    restaurantImage: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400",
    restaurantArea: "Banjara Hills, Hyderabad",
    items: [
      { id: "r1-i1", name: "Chicken Dum Biryani", qty: 2, pricePaise: 32900, isVeg: false },
      { id: "r1-i10", name: "Mirchi ka Salan", qty: 1, pricePaise: 9900, isVeg: true },
      { id: "r1-i11", name: "Onion Raita", qty: 2, pricePaise: 5900, isVeg: true },
    ],
    itemsTotalPaise: 87500,
    deliveryFeePaise: 3500,
    taxPaise: 4400,
    discountPaise: 15000,
    totalPaise: 80400,
    status: "on_the_way",
    placedAt: minsAgo(18),
    expectedAt: minsFromNow(12),
    addressId: "a1",
    paymentMethod: "upi",
    paymentLabel: "Google Pay UPI",
    riderId: "rider-101",
  },
  {
    id: "o2",
    shortId: "GO-49204",
    restaurantId: "r4",
    restaurantName: "MTR 1924",
    restaurantImage: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400",
    restaurantArea: "Lalbagh, Bangalore",
    items: [
      { id: "r4-i1", name: "MTR Special Thali", qty: 1, pricePaise: 32900, isVeg: true },
      { id: "r4-i10", name: "Filter Coffee", qty: 2, pricePaise: 5900, isVeg: true },
    ],
    itemsTotalPaise: 44700,
    deliveryFeePaise: 0,
    taxPaise: 2200,
    discountPaise: 0,
    totalPaise: 46900,
    status: "delivered",
    placedAt: minsAgo(60 * 24),
    deliveredAt: minsAgo(60 * 24 - 35),
    addressId: "a2",
    paymentMethod: "card",
    paymentLabel: "HDFC Bank ••• 4242",
  },
  {
    id: "o3",
    shortId: "GO-49150",
    restaurantId: "r2",
    restaurantName: "Truffles",
    restaurantImage: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    restaurantArea: "Koramangala, Bangalore",
    items: [
      { id: "r2-i1", name: "Mexican Cheese Burger", qty: 1, pricePaise: 34900, isVeg: false },
      { id: "r2-i9", name: "Nutella Thick Shake", qty: 1, pricePaise: 22900, isVeg: true },
    ],
    itemsTotalPaise: 57800,
    deliveryFeePaise: 4900,
    taxPaise: 2900,
    discountPaise: 5000,
    totalPaise: 60600,
    status: "delivered",
    placedAt: minsAgo(60 * 24 * 3),
    deliveredAt: minsAgo(60 * 24 * 3 - 42),
    addressId: "a1",
    paymentMethod: "upi",
    paymentLabel: "PhonePe UPI",
  },
  {
    id: "o4",
    shortId: "GO-49099",
    restaurantId: "r3",
    restaurantName: "Domino's Pizza",
    restaurantImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
    restaurantArea: "Indiranagar, Bangalore",
    items: [
      { id: "r3-i1", name: "Farmhouse (Medium)", qty: 1, pricePaise: 49900, isVeg: true },
      { id: "r3-i6", name: "Garlic Breadsticks", qty: 1, pricePaise: 21900, isVeg: true },
      { id: "r3-i8", name: "Choco Lava Cake", qty: 2, pricePaise: 9900, isVeg: true },
    ],
    itemsTotalPaise: 91600,
    deliveryFeePaise: 0,
    taxPaise: 4600,
    discountPaise: 20000,
    totalPaise: 76200,
    status: "delivered",
    placedAt: minsAgo(60 * 24 * 7),
    deliveredAt: minsAgo(60 * 24 * 7 - 28),
    addressId: "a1",
    paymentMethod: "cod",
    paymentLabel: "Cash on Delivery",
  },
];

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "placed",
  "confirmed",
  "preparing",
  "picked_up",
  "on_the_way",
  "delivered",
];

export const ORDER_STATUS_META: Record<OrderStatus, { label: string; description: string; icon: string }> = {
  placed: { label: "Order Placed", description: "We've received your order", icon: "checkmark-circle" },
  confirmed: { label: "Order Confirmed", description: "Restaurant has accepted your order", icon: "restaurant" },
  preparing: { label: "Preparing your food", description: "The chef is cooking with love", icon: "flame" },
  ready: { label: "Ready for pickup", description: "Waiting for rider", icon: "bag-handle" },
  picked_up: { label: "Picked up", description: "Rider has your order", icon: "bicycle" },
  on_the_way: { label: "On the way", description: "Rider is heading to you", icon: "navigate" },
  delivered: { label: "Delivered", description: "Enjoy your meal!", icon: "happy" },
  cancelled: { label: "Cancelled", description: "Order was cancelled", icon: "close-circle" },
};

export const getOrderById = (id: string) => orders.find((o) => o.id === id);

export const activeOrders = () =>
  orders.filter((o) => !["delivered", "cancelled"].includes(o.status));

export const pastOrders = () =>
  orders.filter((o) => ["delivered", "cancelled"].includes(o.status));
