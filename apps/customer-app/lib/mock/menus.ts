// Menu fixtures per restaurant. Items grouped by category.

export type MenuItem = {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  pricePaise: number;
  imageUrl?: string;
  rating?: number;
  totalRatings?: number;
  isVeg: boolean;
  isBestseller?: boolean;
  isSpicy?: boolean;
  servingInfo?: string;
  customizable?: boolean;
};

export type MenuCategory = {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
};

export type RestaurantMenu = {
  restaurantId: string;
  categories: MenuCategory[];
};

// --- helpers to keep menus terse ---
const item = (
  id: string,
  restaurantId: string,
  name: string,
  desc: string,
  pricePaise: number,
  isVeg: boolean,
  imageUrl?: string,
  flags?: Partial<MenuItem>
): MenuItem => ({
  id,
  restaurantId,
  name,
  description: desc,
  pricePaise,
  isVeg,
  imageUrl,
  rating: 4.2,
  totalRatings: 320,
  customizable: true,
  ...flags,
});

// --- Paradise Biryani (r1) ---
const paradiseMenu: MenuCategory[] = [
  {
    id: "p-bestseller",
    name: "Bestsellers",
    items: [
      item("r1-i1", "r1", "Chicken Dum Biryani", "Aromatic basmati rice slow-cooked with tender chicken, saffron and whole spices. Served with raita and salan.", 32900, false, "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600", { isBestseller: true, isSpicy: true, rating: 4.6, totalRatings: 8400, servingInfo: "Serves 1" }),
      item("r1-i2", "r1", "Mutton Dum Biryani", "Hyderabad's signature mutton biryani with melt-in-mouth meat and long-grain rice.", 44900, false, "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600", { isBestseller: true, isSpicy: true, rating: 4.7, totalRatings: 6200, servingInfo: "Serves 1" }),
      item("r1-i3", "r1", "Paneer Biryani", "Hand-marinated paneer cubes layered with fragrant rice and herbs.", 27900, true, "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600", { isBestseller: true, rating: 4.4, totalRatings: 3100 }),
    ],
  },
  {
    id: "p-biryani",
    name: "Biryani",
    items: [
      item("r1-i4", "r1", "Egg Biryani", "Classic egg biryani — comfort food in a clay handi.", 22900, false, "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600", { rating: 4.3 }),
      item("r1-i5", "r1", "Veg Dum Biryani", "Mixed vegetable biryani with paneer, beans and carrots.", 22900, true, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600", { rating: 4.2 }),
      item("r1-i6", "r1", "Prawn Biryani", "Coastal-style prawn biryani with curry leaves and coconut.", 39900, false, "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600", { isSpicy: true, rating: 4.5 }),
    ],
  },
  {
    id: "p-starters",
    name: "Starters",
    items: [
      item("r1-i7", "r1", "Chicken 65", "Crispy spicy fried chicken tossed with curry leaves and green chilli.", 28900, false, "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600", { isSpicy: true, rating: 4.4 }),
      item("r1-i8", "r1", "Paneer 65", "Vegetarian's answer to Chicken 65 — fiery, crisp and addictive.", 24900, true, undefined, { isSpicy: true }),
      item("r1-i9", "r1", "Mirchi Bajji", "Stuffed long chillies dipped in besan batter and deep-fried.", 12900, true),
    ],
  },
  {
    id: "p-sides",
    name: "Sides & Breads",
    items: [
      item("r1-i10", "r1", "Mirchi ka Salan", "Traditional Hyderabadi gravy that pairs with biryani.", 9900, true),
      item("r1-i11", "r1", "Onion Raita", "Fresh yoghurt with onions, mint and a pinch of cumin.", 5900, true),
      item("r1-i12", "r1", "Sheermal", "Saffron-infused mildly sweet flatbread, baked in tandoor.", 7900, true),
    ],
  },
  {
    id: "p-desserts",
    name: "Desserts",
    items: [
      item("r1-i13", "r1", "Double Ka Meetha", "Bread pudding soaked in saffron milk, garnished with nuts.", 14900, true, "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600"),
      item("r1-i14", "r1", "Qubani Ka Meetha", "Stewed apricots with cream — a Nizami classic.", 16900, true),
    ],
  },
];

// --- Truffles (r2) ---
const trufflesMenu: MenuCategory[] = [
  {
    id: "t-bestseller",
    name: "Bestsellers",
    items: [
      item("r2-i1", "r2", "Mexican Cheese Burger", "Smashed beef patty, cheddar, jalapeños, sour cream sauce in brioche bun. Served with fries.", 34900, false, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600", { isBestseller: true, rating: 4.7, totalRatings: 12000 }),
      item("r2-i2", "r2", "Crispy Chicken Burger", "Buttermilk-fried chicken thigh, lettuce, mayo, pickles.", 31900, false, "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600", { isBestseller: true, rating: 4.6 }),
      item("r2-i3", "r2", "Veggie Smash Burger", "Beetroot and bean patty, cheddar, caramelised onions, garlic aioli.", 27900, true, undefined, { isBestseller: true, rating: 4.4 }),
    ],
  },
  {
    id: "t-burgers",
    name: "Burgers",
    items: [
      item("r2-i4", "r2", "BBQ Bacon Burger", "Smoky BBQ sauce, bacon strips, onion rings.", 38900, false, undefined, { rating: 4.5 }),
      item("r2-i5", "r2", "Mushroom Swiss", "Sautéed mushrooms, swiss cheese, truffle mayo.", 33900, true, undefined, { rating: 4.3 }),
    ],
  },
  {
    id: "t-sides",
    name: "Sides",
    items: [
      item("r2-i6", "r2", "Loaded Fries", "Fries topped with cheese, jalapeños and bacon bits.", 24900, false),
      item("r2-i7", "r2", "Onion Rings", "Beer-battered onion rings with chipotle dip.", 18900, true),
      item("r2-i8", "r2", "Mozzarella Sticks", "Crispy on the outside, gooey on the inside. 6 pieces.", 21900, true),
    ],
  },
  {
    id: "t-shakes",
    name: "Shakes & Drinks",
    items: [
      item("r2-i9", "r2", "Nutella Thick Shake", "Indulgent chocolate-hazelnut shake topped with whipped cream.", 22900, true, "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=600", { isBestseller: true }),
      item("r2-i10", "r2", "Oreo Cookie Shake", "Crushed oreos blended into vanilla bean shake.", 21900, true),
      item("r2-i11", "r2", "Cold Brew Coffee", "House-roasted cold brew, smooth and bold.", 16900, true),
    ],
  },
];

// --- Domino's (r3) ---
const dominosMenu: MenuCategory[] = [
  {
    id: "d-pizza",
    name: "Pizzas",
    items: [
      item("r3-i1", "r3", "Farmhouse", "Onion, capsicum, tomato, mushroom on a classic hand-tossed base.", 49900, true, "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600", { isBestseller: true, rating: 4.4, totalRatings: 22000 }),
      item("r3-i2", "r3", "Peppy Paneer", "Paneer cubes, capsicum, red paprika and tangy tomato sauce.", 45900, true, undefined, { isBestseller: true, rating: 4.3 }),
      item("r3-i3", "r3", "Chicken Dominator", "Loaded with grilled chicken, BBQ chicken and chicken sausage.", 56900, false, undefined, { isBestseller: true, rating: 4.5 }),
      item("r3-i4", "r3", "Margherita", "Classic 100% real mozzarella on a thin crust.", 27900, true, undefined, { rating: 4.2 }),
      item("r3-i5", "r3", "Veg Extravaganza", "7 veggies on a single pizza — the OG loaded pizza.", 52900, true, undefined, { rating: 4.4 }),
    ],
  },
  {
    id: "d-sides",
    name: "Sides",
    items: [
      item("r3-i6", "r3", "Garlic Breadsticks", "Stuffed cheese garlic breadsticks served with dip.", 21900, true, undefined, { isBestseller: true }),
      item("r3-i7", "r3", "Chicken Wings - Peri Peri", "8 spicy chicken wings, peri peri flavoured.", 34900, false, undefined, { isSpicy: true }),
      item("r3-i8", "r3", "Choco Lava Cake", "Moist chocolate cake with gooey chocolate centre.", 9900, true, undefined, { isBestseller: true }),
    ],
  },
];

// --- MTR (r4) ---
const mtrMenu: MenuCategory[] = [
  {
    id: "m-bestseller",
    name: "Bestsellers",
    items: [
      item("r4-i1", "r4", "MTR Special Thali", "Unlimited rice, 3 curries, 2 sweets, papad, pickle and curd.", 32900, true, "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600", { isBestseller: true, rating: 4.6, servingInfo: "Serves 1" }),
      item("r4-i2", "r4", "Masala Dosa", "Crispy rice crepe with spiced potato filling, sambar and chutneys.", 14900, true, "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600", { isBestseller: true, rating: 4.7 }),
      item("r4-i3", "r4", "Rava Idli (4 pcs)", "Soft semolina idlis served with sambar and three chutneys.", 12900, true, undefined, { isBestseller: true }),
    ],
  },
  {
    id: "m-tiffin",
    name: "Tiffin",
    items: [
      item("r4-i4", "r4", "Set Dosa (3 pcs)", "Three soft small dosas with sambar and chutney.", 13900, true),
      item("r4-i5", "r4", "Pongal", "Comforting rice and lentil porridge with ghee, cashews and pepper.", 11900, true),
      item("r4-i6", "r4", "Uttapam", "Thick pancake with onions, tomatoes and green chilli.", 14900, true),
    ],
  },
  {
    id: "m-meals",
    name: "Meals",
    items: [
      item("r4-i7", "r4", "Bisi Bele Bath", "Hot rice-lentil-vegetable preparation, Karnataka style.", 16900, true),
      item("r4-i8", "r4", "Curd Rice", "Comfort food — cold curd rice with tempering, served with pickle.", 11900, true),
    ],
  },
  {
    id: "m-sweets",
    name: "Sweets",
    items: [
      item("r4-i9", "r4", "Rava Kesari", "Saffron-flavoured semolina pudding with cashews and raisins.", 7900, true),
      item("r4-i10", "r4", "Filter Coffee", "Authentic South Indian filter coffee in steel tumbler.", 5900, true, undefined, { isBestseller: true }),
    ],
  },
];

// --- Generic fallback menu (for restaurants without explicit menus) ---
const genericMenu = (restaurantId: string): MenuCategory[] => [
  {
    id: `${restaurantId}-popular`,
    name: "Popular",
    items: [
      item(`${restaurantId}-g1`, restaurantId, "Signature Special", "Chef's recommended dish of the day — must try!", 28900, false, "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600", { isBestseller: true }),
      item(`${restaurantId}-g2`, restaurantId, "Classic Combo Meal", "Includes main, side and a beverage.", 34900, false, undefined, { isBestseller: true }),
      item(`${restaurantId}-g3`, restaurantId, "Garden Fresh Salad", "Mixed greens, cherry tomatoes and house dressing.", 18900, true, undefined),
    ],
  },
  {
    id: `${restaurantId}-mains`,
    name: "Mains",
    items: [
      item(`${restaurantId}-g4`, restaurantId, "Chef's Curry", "Slow-cooked house-style curry served with rice or naan.", 26900, false),
      item(`${restaurantId}-g5`, restaurantId, "Tandoor Special", "Marinated overnight, grilled in clay oven.", 32900, false),
      item(`${restaurantId}-g6`, restaurantId, "Veg Delight", "Seasonal vegetable medley in a rich gravy.", 22900, true),
    ],
  },
  {
    id: `${restaurantId}-sides`,
    name: "Sides",
    items: [
      item(`${restaurantId}-g7`, restaurantId, "Garlic Naan", "Butter-brushed naan with fresh garlic and coriander.", 7900, true),
      item(`${restaurantId}-g8`, restaurantId, "Jeera Rice", "Basmati rice tempered with cumin.", 14900, true),
    ],
  },
  {
    id: `${restaurantId}-drinks`,
    name: "Drinks",
    items: [
      item(`${restaurantId}-g9`, restaurantId, "Masala Chai", "Strong Indian tea with ginger and cardamom.", 4900, true),
      item(`${restaurantId}-g10`, restaurantId, "Sweet Lassi", "Chilled yoghurt drink with a hint of cardamom.", 8900, true),
    ],
  },
];

export const menus: Record<string, MenuCategory[]> = {
  r1: paradiseMenu,
  r2: trufflesMenu,
  r3: dominosMenu,
  r4: mtrMenu,
};

export const getMenuForRestaurant = (restaurantId: string): MenuCategory[] =>
  menus[restaurantId] ?? genericMenu(restaurantId);

export const getMenuItemById = (itemId: string): MenuItem | undefined => {
  for (const restaurantId of Object.keys(menus).concat([])) {
    const cats = menus[restaurantId];
    for (const cat of cats) {
      const found = cat.items.find((i) => i.id === itemId);
      if (found) return found;
    }
  }
  return undefined;
};
