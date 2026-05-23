// India-specific formatters. All money values stored in paise (1/100 of ₹).

export const formatINR = (paise: number, options?: { decimals?: boolean }) => {
  const rupees = paise / 100;
  if (options?.decimals === false || rupees % 1 === 0) {
    return `₹${rupees.toLocaleString("en-IN")}`;
  }
  return `₹${rupees.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// "₹350 for two"
export const formatCostForTwo = (paise: number) => `₹${Math.round(paise / 100)} for two`;

export const formatDistance = (meters: number) => {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
};

// Delivery ETA — Swiggy uses "25-30 mins" style
export const formatEta = (minutes: number) => {
  if (minutes <= 15) return `15 mins`;
  const lower = Math.max(5, minutes - 5);
  return `${lower}-${minutes} mins`;
};

export const formatRating = (rating: number) => rating.toFixed(1);

export const formatPhone = (digits: string) => {
  // +91 with 10 digits: format as +91 98765 43210
  const clean = digits.replace(/\D/g, "").slice(-10);
  if (clean.length !== 10) return digits;
  return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
};

export const formatRelativeTime = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

export const formatOrderTime = (date: Date | string) => {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatPercent = (n: number) => `${Math.round(n * 100)}%`;

// "FLAT 50% OFF up to ₹100"
export const formatPromo = (discount: { type: "flat" | "percent"; value: number; maxOffPaise?: number }) => {
  if (discount.type === "percent") {
    const pct = discount.value;
    if (discount.maxOffPaise) {
      return `FLAT ${pct}% OFF up to ${formatINR(discount.maxOffPaise, { decimals: false })}`;
    }
    return `FLAT ${pct}% OFF`;
  }
  return `${formatINR(discount.value, { decimals: false })} OFF`;
};

export const pluralize = (n: number, single: string, multi?: string) =>
  `${n} ${n === 1 ? single : multi ?? `${single}s`}`;
