import type { OpeningHours } from "@/types";

export const todayStats = {
  totalOrders: 24,
  pendingOrders: 3,
  completedOrders: 19,
  cancelledOrders: 2,
  totalRevenuePaise: 1847500, // ₹18,475
  avgOrderValuePaise: 76979, // ₹769.79
  avgPrepMinutes: 22,
  peakHour: "1:00 PM",
};

export const weeklyRevenue = [
  { day: "Mon", revenuePaise: 1240000 },
  { day: "Tue", revenuePaise: 980000 },
  { day: "Wed", revenuePaise: 1560000 },
  { day: "Thu", revenuePaise: 1890000 },
  { day: "Fri", revenuePaise: 2340000 },
  { day: "Sat", revenuePaise: 2870000 },
  { day: "Sun", revenuePaise: 1847500 }, // today
];

export const topItems = [
  { name: "Chicken Biryani", orders: 42, revenuePaise: 1176000 },
  { name: "Butter Chicken", orders: 31, revenuePaise: 868000 },
  { name: "Paneer Tikka", orders: 28, revenuePaise: 560000 },
  { name: "Mutton Biryani", orders: 19, revenuePaise: 665000 },
  { name: "Garlic Naan", orders: 67, revenuePaise: 402000 },
];

export const recentOrders = [
  {
    id: "ord-r01",
    customerName: "Kavitha Iyer",
    items: [{ name: "Grilled Fish Thali" }],
    totalPaise: 110000,
    deliveredAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: "ord-r02",
    customerName: "Suresh Babu",
    items: [{ name: "Chole Bhature" }],
    totalPaise: 55000,
    deliveredAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
  },
  {
    id: "ord-r03",
    customerName: "Ananya Krishnamurthy",
    items: [{ name: "Veg Thali" }],
    totalPaise: 71500,
    deliveredAt: new Date(Date.now() - 68 * 60 * 1000).toISOString(),
  },
  {
    id: "ord-r04",
    customerName: "Vikram Singh",
    items: [{ name: "Mutton Rogan Josh" }],
    totalPaise: 83500,
    deliveredAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
  },
  {
    id: "ord-r05",
    customerName: "Deepika Reddy",
    items: [{ name: "Masala Dosa" }],
    totalPaise: 67500,
    deliveredAt: new Date(Date.now() - 130 * 60 * 1000).toISOString(),
  },
];

export const openingHoursDefault: OpeningHours[] = [
  { dayOfWeek: 0, isOpen: false, opensAt: "11:00", closesAt: "23:00" }, // Sunday
  { dayOfWeek: 1, isOpen: true, opensAt: "11:00", closesAt: "23:00" },  // Monday
  { dayOfWeek: 2, isOpen: true, opensAt: "11:00", closesAt: "23:00" },  // Tuesday
  { dayOfWeek: 3, isOpen: true, opensAt: "11:00", closesAt: "23:00" },  // Wednesday
  { dayOfWeek: 4, isOpen: true, opensAt: "11:00", closesAt: "23:00" },  // Thursday
  { dayOfWeek: 5, isOpen: true, opensAt: "11:00", closesAt: "23:00" },  // Friday
  { dayOfWeek: 6, isOpen: true, opensAt: "11:00", closesAt: "23:00" },  // Saturday
];
