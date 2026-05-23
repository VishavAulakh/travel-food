import type { MenuItem } from "@/types";

export const CATEGORIES = [
  "Biryani & Rice",
  "Starters",
  "Main Course",
  "Breads & Sides",
  "Desserts & Drinks",
] as const;

export const menuItems: MenuItem[] = [
  // ─── Biryani & Rice ───────────────────────────────────────────────────────
  {
    id: "menu-001",
    name: "Chicken Biryani",
    description:
      "Slow-cooked basmati rice layered with spiced chicken, saffron, and crispy fried onions.",
    pricePaise: 28000,
    category: "Biryani & Rice",
    isVeg: false,
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "menu-002",
    name: "Mutton Biryani",
    description:
      "Tender mutton pieces marinated overnight, slow-dum cooked with aged basmati and whole spices.",
    pricePaise: 35000,
    category: "Biryani & Rice",
    isVeg: false,
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "menu-003",
    name: "Veg Biryani",
    description:
      "Fragrant basmati rice tossed with seasonal vegetables, paneer, and aromatic whole spices.",
    pricePaise: 20000,
    category: "Biryani & Rice",
    isVeg: true,
    isAvailable: false,
    imageUrl:
      "https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "menu-004",
    name: "Egg Fried Rice",
    description:
      "Wok-tossed basmati rice with scrambled eggs, spring onions, soy, and sesame oil.",
    pricePaise: 16000,
    category: "Biryani & Rice",
    isVeg: false,
    isAvailable: false,
    imageUrl:
      "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&auto=format&fit=crop&q=80",
  },

  // ─── Starters ─────────────────────────────────────────────────────────────
  {
    id: "menu-005",
    name: "Chicken 65",
    description:
      "Crispy deep-fried chicken tossed in a fiery red chilli and curry leaf tempering.",
    pricePaise: 22000,
    category: "Starters",
    isVeg: false,
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1610057099431-d73a1c9d2f2f?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "menu-006",
    name: "Paneer Tikka",
    description:
      "Smoky cottage cheese cubes marinated in yoghurt and spices, grilled in a tandoor.",
    pricePaise: 20000,
    category: "Starters",
    isVeg: true,
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "menu-007",
    name: "Seekh Kebab",
    description:
      "Minced lamb skewers spiced with ginger, garlic, and herbs, cooked over charcoal.",
    pricePaise: 24000,
    category: "Starters",
    isVeg: false,
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "menu-008",
    name: "Veg Spring Roll",
    description:
      "Golden crispy rolls stuffed with stir-fried cabbage, carrots, and glass noodles.",
    pricePaise: 16000,
    category: "Starters",
    isVeg: true,
    isAvailable: false,
    imageUrl:
      "https://images.unsplash.com/photo-1607116667981-ff148a78f1b8?w=600&auto=format&fit=crop&q=80",
  },

  // ─── Main Course ──────────────────────────────────────────────────────────
  {
    id: "menu-009",
    name: "Butter Chicken",
    description:
      "Tender chicken in a rich, velvety tomato-cream sauce with a hint of fenugreek.",
    pricePaise: 28000,
    category: "Main Course",
    isVeg: false,
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "menu-010",
    name: "Paneer Butter Masala",
    description:
      "Soft paneer cubes simmered in a luscious tomato-cashew gravy with butter and cream.",
    pricePaise: 24000,
    category: "Main Course",
    isVeg: true,
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "menu-011",
    name: "Dal Makhani",
    description:
      "Black lentils and kidney beans slow-simmered overnight with butter and smoky spices.",
    pricePaise: 18000,
    category: "Main Course",
    isVeg: true,
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "menu-012",
    name: "Mutton Rogan Josh",
    description:
      "Kashmiri slow-braised mutton in a bold gravy of dried Kashmiri chillies and whole spices.",
    pricePaise: 36000,
    category: "Main Course",
    isVeg: false,
    isAvailable: false,
    imageUrl:
      "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?w=600&auto=format&fit=crop&q=80",
  },

  // ─── Breads & Sides ───────────────────────────────────────────────────────
  {
    id: "menu-013",
    name: "Garlic Naan",
    description:
      "Fluffy leavened flatbread topped with roasted garlic and fresh coriander, baked in tandoor.",
    pricePaise: 6000,
    category: "Breads & Sides",
    isVeg: true,
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "menu-014",
    name: "Laccha Paratha",
    description:
      "Flaky, multi-layered whole-wheat flatbread with a light crunch on every bite.",
    pricePaise: 5000,
    category: "Breads & Sides",
    isVeg: true,
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "menu-015",
    name: "Butter Roti",
    description:
      "Soft whole-wheat flatbread freshly baked on a tawa and finished with a slather of butter.",
    pricePaise: 4000,
    category: "Breads & Sides",
    isVeg: true,
    isAvailable: false,
    imageUrl:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "menu-016",
    name: "Raita",
    description:
      "Chilled whisked yoghurt with cucumber, cumin, and a pinch of chaat masala.",
    pricePaise: 6000,
    category: "Breads & Sides",
    isVeg: true,
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=600&auto=format&fit=crop&q=80",
  },

  // ─── Desserts & Drinks ────────────────────────────────────────────────────
  {
    id: "menu-017",
    name: "Gulab Jamun",
    description:
      "Soft milk-solid dumplings soaked in rose-saffron sugar syrup, served warm.",
    pricePaise: 8000,
    category: "Desserts & Drinks",
    isVeg: true,
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1666451497124-d4aa3d3e5f00?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "menu-018",
    name: "Kulfi",
    description:
      "Traditional Indian ice cream made with condensed milk, cardamom, and pistachio.",
    pricePaise: 10000,
    category: "Desserts & Drinks",
    isVeg: true,
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1570197571499-166b36435e9f?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "menu-019",
    name: "Mango Lassi",
    description:
      "Thick and creamy blended yoghurt drink with Alphonso mango pulp and a hint of cardamom.",
    pricePaise: 9000,
    category: "Desserts & Drinks",
    isVeg: true,
    isAvailable: true,
    imageUrl:
      "https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=600&auto=format&fit=crop&q=80",
  },
  {
    id: "menu-020",
    name: "Masala Chai",
    description:
      "Strong Assam tea brewed with ginger, cardamom, cinnamon, and cloves in full-fat milk.",
    pricePaise: 4000,
    category: "Desserts & Drinks",
    isVeg: true,
    isAvailable: false,
    imageUrl:
      "https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=600&auto=format&fit=crop&q=80",
  },
];

export function getItemsByCategory(category: string): MenuItem[] {
  return menuItems.filter((item) => item.category === category);
}
