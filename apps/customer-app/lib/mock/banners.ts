// Promotional banner content for home screen carousel.
export type Banner = {
  id: string;
  title: string;
  subtitle: string;
  cta: string;
  bgColor: string;
  textColor: string;
  imageUrl: string;
  badge?: string;
};

export const banners: Banner[] = [
  {
    id: "b1",
    title: "Eat What Makes You Happy",
    subtitle: "Get 60% off + free delivery on your first 3 orders",
    cta: "Order Now",
    bgColor: "#FC5F30",
    textColor: "#FFFFFF",
    imageUrl: "https://images.unsplash.com/photo-1606851094291-6efae152bb87?w=600",
    badge: "WELCOME60",
  },
  {
    id: "b2",
    title: "Hyderabadi Biryani Festival",
    subtitle: "Authentic dum biryani from 40+ restaurants",
    cta: "Explore",
    bgColor: "#7A1F1F",
    textColor: "#FFFFFF",
    imageUrl: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600",
  },
  {
    id: "b3",
    title: "Healthy Bowls Under ₹250",
    subtitle: "Salads, poke bowls and protein meals",
    cta: "Browse",
    bgColor: "#2E7D32",
    textColor: "#FFFFFF",
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
  },
  {
    id: "b4",
    title: "Late Night Cravings?",
    subtitle: "Open till 3 AM in your area",
    cta: "Open Now",
    bgColor: "#1A1A2E",
    textColor: "#FFFFFF",
    imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
  },
];
