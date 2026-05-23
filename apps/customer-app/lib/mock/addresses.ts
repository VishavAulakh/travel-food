export type Address = {
  id: string;
  label: "Home" | "Work" | "Other";
  customLabel?: string;
  line1: string;
  line2?: string;
  landmark?: string;
  area: string;
  city: string;
  pincode: string;
  state: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
};

export const addresses: Address[] = [
  {
    id: "a1",
    label: "Home",
    line1: "402, Brigade Meadows",
    line2: "Apartment Tower B",
    landmark: "Opp. Forum Mall",
    area: "Koramangala 4th Block",
    city: "Bangalore",
    pincode: "560034",
    state: "Karnataka",
    lat: 12.9352,
    lng: 77.6245,
    isDefault: true,
  },
  {
    id: "a2",
    label: "Work",
    line1: "WeWork Galaxy",
    line2: "43, Residency Road",
    landmark: "Near Brigade Road Metro",
    area: "Residency Road",
    city: "Bangalore",
    pincode: "560025",
    state: "Karnataka",
    lat: 12.9698,
    lng: 77.6043,
  },
];

export const getDefaultAddress = () =>
  addresses.find((a) => a.isDefault) ?? addresses[0];
