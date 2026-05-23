export type RiderProfile = {
  id: string;
  name: string;
  phone: string;
  avatarUrl: string;
  vehicleType: "scooter" | "motorcycle";
  vehicleNumber: string;
  rating: number;
  totalRatings: number;
  totalDeliveries: number;
  joinedDate: string;
  isVerified: boolean;
  bankAccount: {
    bankName: string;
    last4: string;
  };
  documents: {
    aadhar: { verified: boolean };
    drivingLicense: { verified: boolean; number: string };
    vehicleRC: { verified: boolean; number: string };
  };
};

export const riderProfile: RiderProfile = {
  id: "rider-kv-001",
  name: "Karan Verma",
  phone: "+91 98765 43210",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  vehicleType: "motorcycle",
  vehicleNumber: "KA 01 HH 1234",
  rating: 4.8,
  totalRatings: 342,
  totalDeliveries: 1248,
  joinedDate: "2022-08-15T00:00:00.000Z",
  isVerified: true,
  bankAccount: {
    bankName: "HDFC",
    last4: "7821",
  },
  documents: {
    aadhar: { verified: true },
    drivingLicense: { verified: true, number: "KA0120210012345" },
    vehicleRC: { verified: true, number: "KA01HH1234" },
  },
};

export const mockRider = {
  id: riderProfile.id,
  name: riderProfile.name,
  phone: riderProfile.phone,
};
