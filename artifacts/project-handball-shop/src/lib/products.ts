export type ProductColor = {
  name: string;
  hex: string;
};

export const AVAILABLE_COLORS: ProductColor[] = [
  { name: "Light Blue",    hex: "#ADD8E6" },
  { name: "Light Pink",    hex: "#FFB6C1" },
  { name: "Red",           hex: "#CC0000" },
  { name: "Black",         hex: "#1A1A1A" },
  { name: "Navy",          hex: "#002151" },
  { name: "Tropical Blue", hex: "#00B5CC" },
  { name: "Irish Green",   hex: "#009A44" },
  { name: "Orange",        hex: "#FF6B00" },
  { name: "Purple",        hex: "#6B2D8B" },
  { name: "Safety Green",  hex: "#9DD900" },
  { name: "Russet",        hex: "#80461B" },
  { name: "Gravel",        hex: "#6B6B6B" },
];

export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  sizes: string[];
  colors: ProductColor[];
  category: string;
  isNew?: boolean;
};

export const products: Product[] = [
  {
    id: "classic-tee",
    name: "Project Handball Classic Tee",
    price: 35,
    description: "The essential wallball tee. Premium cotton with the classic Project Handball wordmark. Built for the concrete courts.",
    image: "/images/classic-tee.png",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tees",
    isNew: true
  },
  {
    id: "hoodie",
    name: "Project Handball Hoodie",
    price: 65,
    description: "Heavyweight hoodie for cold nights on the court. Featuring a durable embroidered logo and a deep hood.",
    image: "/images/hoodie.png",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Outerwear"
  },
  {
    id: "warrior-tee",
    name: "Wallball Warrior Tee",
    price: 35,
    description: "A dynamic action graphic tee. Lightweight and breathable for intense matches.",
    image: "/images/warrior-tee.png",
    sizes: ["S", "M", "L", "XL"],
    colors: AVAILABLE_COLORS,
    category: "Tees"
  },
  {
    id: "cap",
    name: "Project Handball Cap",
    price: 30,
    description: "Classic snapback cap with electric blue accents. Keeps the sun out of your eyes while you serve.",
    image: "/images/cap.png",
    sizes: ["One Size"],
    colors: AVAILABLE_COLORS,
    category: "Accessories",
    isNew: true
  },
  {
    id: "shorts",
    name: "Handball Shorts",
    price: 45,
    description: "Performance athletic shorts built for maximum mobility. Features secure pockets so you don't lose your keys during a match.",
    image: "/images/shorts.png",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Bottoms"
  },
  {
    id: "long-sleeve",
    name: "Project Handball Long Sleeve",
    price: 45,
    description: "Long sleeve tee with electric blue sleeve prints. Perfect for warming up or casual streetwear.",
    image: "/images/long-sleeve.png",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tees"
  }
];

export function getProduct(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getRelatedProducts(id: string, limit = 4): Product[] {
  return products.filter(p => p.id !== id).slice(0, limit);
}
