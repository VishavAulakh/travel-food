export type Promo = {
  code: string;
  title: string;
  description: string;
  discount: { type: "flat" | "percent"; value: number; maxOffPaise?: number };
  minOrderPaise: number;
  expiresAt: string;
  isFirstOrder?: boolean;
};

export const promos: Promo[] = [
  {
    code: "WELCOME60",
    title: "60% OFF on your first order",
    description: "Get flat 60% off up to ₹120 on orders above ₹199",
    discount: { type: "percent", value: 60, maxOffPaise: 12000 },
    minOrderPaise: 19900,
    expiresAt: "2026-12-31T23:59:59Z",
    isFirstOrder: true,
  },
  {
    code: "FLAT100",
    title: "Flat ₹100 OFF",
    description: "On orders above ₹399. Valid on all restaurants.",
    discount: { type: "flat", value: 10000 },
    minOrderPaise: 39900,
    expiresAt: "2026-06-30T23:59:59Z",
  },
  {
    code: "FREEDEL",
    title: "Free delivery",
    description: "No delivery fee on orders above ₹249",
    discount: { type: "flat", value: 4900 },
    minOrderPaise: 24900,
    expiresAt: "2026-07-31T23:59:59Z",
  },
  {
    code: "UPI50",
    title: "₹50 OFF on UPI",
    description: "Pay with UPI and get ₹50 off on orders above ₹299",
    discount: { type: "flat", value: 5000 },
    minOrderPaise: 29900,
    expiresAt: "2026-12-31T23:59:59Z",
  },
];
