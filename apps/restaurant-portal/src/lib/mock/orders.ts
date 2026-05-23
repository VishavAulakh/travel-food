import type { DeliveryOrder, OrderStatus } from "@/types";

const now = Date.now();
const minsAgo = (m: number) => new Date(now - m * 60 * 1000).toISOString();

export const mockOrders: DeliveryOrder[] = [
  // ─── PLACED (just arrived) ───────────────────────────────────────────────
  {
    id: "ord-001",
    orderId: "TF100231",
    status: "placed",
    customerName: "Rahul Sharma",
    customerPhone: "+91 98765 43210",
    deliveryAddress: "14/3, Indiranagar 100 Feet Road, near HDFC ATM, Bangalore – 560038",
    items: [
      { id: "i1", name: "Chicken Biryani", qty: 2, pricePaise: 28000, isVeg: false },
      { id: "i2", name: "Raita", qty: 2, pricePaise: 5000, isVeg: true },
      { id: "i3", name: "Gulab Jamun", qty: 1, pricePaise: 8000, isVeg: true },
    ],
    subtotalPaise: 74000,
    deliveryFeePaise: 4000,
    totalPaise: 78000,
    placedAt: minsAgo(1),
  },
  {
    id: "ord-002",
    orderId: "TF100232",
    status: "placed",
    customerName: "Priya Nair",
    customerPhone: "+91 87654 32109",
    deliveryAddress: "Block C, Apartment 204, Prestige Shantiniketan, Whitefield, Bangalore – 560066",
    items: [
      { id: "i4", name: "Paneer Butter Masala", qty: 1, pricePaise: 24000, isVeg: true },
      { id: "i5", name: "Dal Makhani", qty: 1, pricePaise: 20000, isVeg: true },
      { id: "i6", name: "Garlic Naan", qty: 4, pricePaise: 5000, isVeg: true },
      { id: "i7", name: "Jeera Rice", qty: 1, pricePaise: 12000, isVeg: true },
    ],
    subtotalPaise: 84000,
    deliveryFeePaise: 3500,
    totalPaise: 87500,
    placedAt: minsAgo(3),
  },

  // ─── CONFIRMED ────────────────────────────────────────────────────────────
  {
    id: "ord-003",
    orderId: "TF100228",
    status: "confirmed",
    customerName: "Arjun Menon",
    customerPhone: "+91 76543 21098",
    deliveryAddress: "No. 8, 3rd Cross, Koramangala 5th Block, Bangalore – 560095",
    items: [
      { id: "i8", name: "Butter Chicken", qty: 1, pricePaise: 30000, isVeg: false },
      { id: "i9", name: "Garlic Naan", qty: 3, pricePaise: 5000, isVeg: true },
      { id: "i10", name: "Mango Lassi", qty: 2, pricePaise: 9000, isVeg: true },
    ],
    subtotalPaise: 75000,
    deliveryFeePaise: 4000,
    totalPaise: 79000,
    estimatedPrepMinutes: 20,
    placedAt: minsAgo(18),
    confirmedAt: minsAgo(15),
  },
  {
    id: "ord-004",
    orderId: "TF100229",
    status: "confirmed",
    customerName: "Deepika Reddy",
    customerPhone: "+91 65432 10987",
    deliveryAddress: "Villa 22, Brigade Meadows, Kanakapura Road, Bangalore – 560109",
    items: [
      { id: "i11", name: "Masala Dosa", qty: 2, pricePaise: 14000, isVeg: true },
      { id: "i12", name: "Medu Vada", qty: 4, pricePaise: 7000, isVeg: true },
      { id: "i13", name: "Filter Coffee", qty: 2, pricePaise: 6000, isVeg: true },
      { id: "i14", name: "Coconut Chutney", qty: 2, pricePaise: 2000, isVeg: true },
    ],
    subtotalPaise: 64000,
    deliveryFeePaise: 3500,
    totalPaise: 67500,
    estimatedPrepMinutes: 15,
    placedAt: minsAgo(22),
    confirmedAt: minsAgo(19),
  },

  // ─── PREPARING ────────────────────────────────────────────────────────────
  {
    id: "ord-005",
    orderId: "TF100225",
    status: "preparing",
    customerName: "Vikram Singh",
    customerPhone: "+91 54321 09876",
    deliveryAddress: "Flat 501, Mantri Serene, Sarjapur Road, Bangalore – 560102",
    items: [
      { id: "i15", name: "Mutton Rogan Josh", qty: 1, pricePaise: 38000, isVeg: false },
      { id: "i16", name: "Saffron Rice", qty: 1, pricePaise: 15000, isVeg: true },
      { id: "i17", name: "Mixed Raita", qty: 1, pricePaise: 6000, isVeg: true },
      { id: "i18", name: "Phirni", qty: 2, pricePaise: 10000, isVeg: true },
    ],
    subtotalPaise: 79000,
    deliveryFeePaise: 4500,
    totalPaise: 83500,
    estimatedPrepMinutes: 30,
    placedAt: minsAgo(35),
    confirmedAt: minsAgo(32),
    preparingAt: minsAgo(28),
  },
  {
    id: "ord-006",
    orderId: "TF100226",
    status: "preparing",
    customerName: "Ananya Krishnamurthy",
    customerPhone: "+91 43210 98765",
    deliveryAddress: "No. 56, 12th Main, JP Nagar 6th Phase, Bangalore – 560078",
    items: [
      { id: "i19", name: "Veg Thali", qty: 2, pricePaise: 22000, isVeg: true },
      { id: "i20", name: "Aloo Paratha", qty: 3, pricePaise: 8000, isVeg: true },
    ],
    subtotalPaise: 68000,
    deliveryFeePaise: 3500,
    totalPaise: 71500,
    estimatedPrepMinutes: 20,
    placedAt: minsAgo(28),
    confirmedAt: minsAgo(25),
    preparingAt: minsAgo(20),
  },

  // ─── READY FOR PICKUP ─────────────────────────────────────────────────────
  {
    id: "ord-007",
    orderId: "TF100222",
    status: "ready_for_pickup",
    customerName: "Suresh Babu",
    customerPhone: "+91 32109 87654",
    deliveryAddress: "103, 1st Main, RT Nagar, Bangalore – 560032",
    items: [
      { id: "i21", name: "Chole Bhature", qty: 2, pricePaise: 18000, isVeg: true },
      { id: "i22", name: "Lassi", qty: 2, pricePaise: 8000, isVeg: true },
    ],
    subtotalPaise: 52000,
    deliveryFeePaise: 3000,
    totalPaise: 55000,
    estimatedPrepMinutes: 15,
    placedAt: minsAgo(55),
    confirmedAt: minsAgo(52),
    preparingAt: minsAgo(47),
    readyAt: minsAgo(5),
  },

  // ─── DELIVERED (history) ──────────────────────────────────────────────────
  {
    id: "ord-008",
    orderId: "TF100218",
    status: "delivered",
    customerName: "Kavitha Iyer",
    customerPhone: "+91 21098 76543",
    deliveryAddress: "Flat 12B, Sobha Dream Acres, Panathur Road, Bangalore – 560037",
    items: [
      { id: "i23", name: "Grilled Fish Thali", qty: 1, pricePaise: 35000, isVeg: false },
      { id: "i24", name: "Prawn Masala", qty: 1, pricePaise: 42000, isVeg: false },
      { id: "i25", name: "Appam", qty: 4, pricePaise: 4000, isVeg: true },
      { id: "i26", name: "Coconut Milk Payasam", qty: 2, pricePaise: 12000, isVeg: true },
    ],
    subtotalPaise: 105000,
    deliveryFeePaise: 5000,
    totalPaise: 110000,
    estimatedPrepMinutes: 25,
    placedAt: minsAgo(90),
    confirmedAt: minsAgo(87),
    preparingAt: minsAgo(82),
    readyAt: minsAgo(60),
  },
];

// ─── Derived slices ───────────────────────────────────────────────────────────

export const placedOrders = mockOrders.filter((o) => o.status === "placed");

export const activeOrders = mockOrders.filter((o) =>
  (["confirmed", "preparing", "ready_for_pickup"] as OrderStatus[]).includes(o.status)
);

export const historyOrders = mockOrders.filter((o) =>
  (["delivered", "cancelled"] as OrderStatus[]).includes(o.status)
);

// ─── Status meta helper ───────────────────────────────────────────────────────

type StatusMeta = { label: string; color: string; bg: string };

export function getStatusMeta(status: OrderStatus): StatusMeta {
  switch (status) {
    case "placed":
      return { label: "New Order", color: "text-amber-400", bg: "bg-amber-400/10" };
    case "confirmed":
      return { label: "Confirmed", color: "text-blue-400", bg: "bg-blue-400/10" };
    case "preparing":
      return { label: "Preparing", color: "text-violet-400", bg: "bg-violet-400/10" };
    case "ready_for_pickup":
      return { label: "Ready", color: "text-green-400", bg: "bg-green-400/10" };
    case "picked_up":
      return { label: "Picked Up", color: "text-cyan-400", bg: "bg-cyan-400/10" };
    case "delivered":
      return { label: "Delivered", color: "text-green-400", bg: "bg-green-400/10" };
    case "cancelled":
      return { label: "Cancelled", color: "text-red-400", bg: "bg-red-400/10" };
  }
}
