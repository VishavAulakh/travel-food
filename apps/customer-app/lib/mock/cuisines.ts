// Indian-market cuisine taxonomy. Image URLs use Unsplash Source for stable random photos.

export type Cuisine = {
  id: string;
  name: string;
  emoji: string;
  imageUrl: string;
};

export const cuisines: Cuisine[] = [
  { id: "biryani", name: "Biryani", emoji: "🍛", imageUrl: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=400" },
  { id: "pizza", name: "Pizza", emoji: "🍕", imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400" },
  { id: "burger", name: "Burger", emoji: "🍔", imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
  { id: "north-indian", name: "North Indian", emoji: "🍱", imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400" },
  { id: "south-indian", name: "South Indian", emoji: "🥞", imageUrl: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=400" },
  { id: "chinese", name: "Chinese", emoji: "🥡", imageUrl: "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400" },
  { id: "rolls", name: "Rolls", emoji: "🌯", imageUrl: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400" },
  { id: "thali", name: "Thali", emoji: "🍽️", imageUrl: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400" },
  { id: "desserts", name: "Desserts", emoji: "🍰", imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400" },
  { id: "ice-cream", name: "Ice Cream", emoji: "🍨", imageUrl: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400" },
  { id: "beverages", name: "Beverages", emoji: "🥤", imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400" },
  { id: "healthy", name: "Healthy", emoji: "🥗", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400" },
  { id: "cafe", name: "Café", emoji: "☕", imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400" },
  { id: "bakery", name: "Bakery", emoji: "🥐", imageUrl: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=400" },
];
