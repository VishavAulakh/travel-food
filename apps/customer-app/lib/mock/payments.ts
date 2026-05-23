export type PaymentMethod = {
  id: string;
  type: "upi" | "card" | "wallet" | "cod" | "netbanking";
  label: string;
  subLabel?: string;
  icon: string; // ionicons name
  iconColor?: string;
  isDefault?: boolean;
};

// India-first payment methods. UPI is dominant.
export const paymentMethods: PaymentMethod[] = [
  {
    id: "pm-upi-gpay",
    type: "upi",
    label: "Google Pay",
    subLabel: "vish***@oksbi",
    icon: "logo-google",
    iconColor: "#4285F4",
    isDefault: true,
  },
  {
    id: "pm-upi-phonepe",
    type: "upi",
    label: "PhonePe",
    subLabel: "9876543210@ybl",
    icon: "phone-portrait",
    iconColor: "#5F259F",
  },
  {
    id: "pm-upi-paytm",
    type: "upi",
    label: "Paytm UPI",
    icon: "wallet",
    iconColor: "#00BAF2",
  },
  {
    id: "pm-card-hdfc",
    type: "card",
    label: "HDFC Bank Credit Card",
    subLabel: "•••• 4242",
    icon: "card",
    iconColor: "#004C8F",
  },
  {
    id: "pm-wallet",
    type: "wallet",
    label: "GoLocal Money",
    subLabel: "Balance: ₹245",
    icon: "wallet-outline",
    iconColor: "#FC5F30",
  },
  {
    id: "pm-cod",
    type: "cod",
    label: "Cash on Delivery",
    subLabel: "Pay when you receive",
    icon: "cash-outline",
    iconColor: "#16A34A",
  },
];
