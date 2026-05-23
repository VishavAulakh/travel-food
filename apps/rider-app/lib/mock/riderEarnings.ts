export type EarningEntry = {
  id: string;
  orderId: string;
  restaurantName: string;
  amount: number;
  distanceKm: number;
  date: string;
  timeSlot: "morning" | "afternoon" | "evening" | "night";
};

export type EarningsSummary = {
  todayPaise: number;
  weekPaise: number;
  monthPaise: number;
  totalDeliveries: number;
  averageRating: number;
  onlineHoursToday: number;
};

const now = new Date();

const makeDate = (daysAgo: number, hour: number): string => {
  const d = new Date(now);
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
};

const timeSlot = (hour: number): EarningEntry["timeSlot"] => {
  if (hour >= 6 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
};

const restaurants = [
  "Paradise Biryani",
  "MTR 1924",
  "Truffles",
  "Burger King",
  "Saravana Bhavan",
  "Wow! Momo",
  "Behrouz Biryani",
  "Faasos",
];

const orderIds = [
  "#TF100200", "#TF100201", "#TF100202", "#TF100203", "#TF100204",
  "#TF100205", "#TF100206", "#TF100207", "#TF100208", "#TF100209",
  "#TF100210", "#TF100211", "#TF100212", "#TF100213", "#TF100214",
  "#TF100215", "#TF100216", "#TF100217", "#TF100218", "#TF100219",
  "#TF100220", "#TF100221", "#TF100222", "#TF100223", "#TF100224",
  "#TF100225", "#TF100226", "#TF100227", "#TF100228", "#TF100229",
];

const amounts = [
  4200, 3500, 5500, 4800, 2800, 3800, 5800, 2600,
  4100, 3200, 5000, 4600, 2900, 3700, 5200, 2700,
  4400, 3100, 5100, 4900, 3000, 3900, 5300, 2800,
  4300, 3300, 4700, 4500, 2700, 3600,
];

const distances = [
  1.8, 2.6, 3.4, 1.2, 2.0, 1.4, 3.8, 0.8,
  2.1, 1.9, 2.8, 1.5, 2.3, 1.7, 3.1, 1.0,
  2.4, 1.6, 2.7, 2.0, 1.8, 2.2, 3.0, 1.3,
  1.9, 2.5, 2.9, 1.4, 1.1, 2.6,
];

// Today: 4 entries (hours 9, 12, 16, 20)
// Rest spread over last 29 days (1 per day)
const todayHours = [9, 12, 16, 20];
const pastDayEntries: Array<{ daysAgo: number; hour: number }> = [];
for (let d = 1; d <= 29; d++) {
  pastDayEntries.push({ daysAgo: d, hour: 9 + (d % 12) });
}
// Add a few extra for realism in past week
pastDayEntries.push({ daysAgo: 1, hour: 14 });
pastDayEntries.push({ daysAgo: 2, hour: 19 });
pastDayEntries.push({ daysAgo: 3, hour: 11 });

// Build 30 entries total: 4 today + 26 from recent past
const allSlots: Array<{ daysAgo: number; hour: number }> = [
  ...todayHours.map((h) => ({ daysAgo: 0, hour: h })),
  ...pastDayEntries.slice(0, 26),
];

export const earningEntries: EarningEntry[] = allSlots.map((slot, i) => ({
  id: `earn-${String(i + 1).padStart(3, "0")}`,
  orderId: orderIds[i % orderIds.length],
  restaurantName: restaurants[i % restaurants.length],
  amount: amounts[i % amounts.length],
  distanceKm: distances[i % distances.length],
  date: makeDate(slot.daysAgo, slot.hour),
  timeSlot: timeSlot(slot.hour),
}));

const todayStr = now.toISOString().slice(0, 10);

const startOfWeek = new Date(now);
startOfWeek.setDate(now.getDate() - 6);
startOfWeek.setHours(0, 0, 0, 0);

const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

export const todayEarnings = earningEntries.filter((e) =>
  e.date.startsWith(todayStr)
);

export const weekEarnings = earningEntries.filter(
  (e) => new Date(e.date) >= startOfWeek
);

export const monthEarnings = earningEntries.filter(
  (e) => new Date(e.date) >= startOfMonth
);

export const earningsSummary: EarningsSummary = {
  todayPaise: todayEarnings.reduce((s, e) => s + e.amount, 0),
  weekPaise: weekEarnings.reduce((s, e) => s + e.amount, 0),
  monthPaise: earningEntries.reduce((s, e) => s + e.amount, 0),
  totalDeliveries: earningEntries.length,
  averageRating: 4.8,
  onlineHoursToday: 6.5,
};
