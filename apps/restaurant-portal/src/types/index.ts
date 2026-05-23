export type OrderStatus =
  | "placed"
  | "confirmed"
  | "preparing"
  | "ready_for_pickup"
  | "picked_up"
  | "delivered"
  | "cancelled";

export type OrderItem = {
  id: string;
  name: string;
  qty: number;
  pricePaise: number;
  isVeg: boolean;
};

export type DeliveryOrder = {
  id: string;
  orderId: string; // #TF123456
  status: OrderStatus;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: OrderItem[];
  subtotalPaise: number;
  deliveryFeePaise: number;
  totalPaise: number;
  estimatedPrepMinutes?: number;
  placedAt: string;
  confirmedAt?: string;
  preparingAt?: string;
  readyAt?: string;
};

export type MenuItem = {
  id: string;
  name: string;
  description?: string;
  pricePaise: number;
  category: string;
  isVeg: boolean;
  isAvailable: boolean;
  imageUrl?: string;
};

export type OpeningHours = {
  dayOfWeek: number; // 0=Sun, 6=Sat
  isOpen: boolean;
  opensAt: string; // "09:00"
  closesAt: string; // "22:00"
};
