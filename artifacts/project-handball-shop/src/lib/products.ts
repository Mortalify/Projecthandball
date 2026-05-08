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
    id: "i-got-next-cotton-tee",
    name: "ProjectHandball X FL Limited Edition Tee",
    price: 35,
    description: "A limited edition collab tee you won't find anywhere else. Premium cotton, bold graphics, and that Project Handball energy. Grab it before it's gone.",
    image: "/images/i-got-next-cotton-tee.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tees",
    isNew: true,
  },
  {
    id: "simply-handball-hoodie",
    name: "Simply Handball Hoodie",
    price: 45,
    description: "100% organic cotton hoodie that says exactly what it needs to say. Clean design, premium feel, built for the player who lets their game do the talking.",
    image: "/images/simply-handball-hoodie.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Hoodies",
    isNew: true,
  },
  {
    id: "i-got-next-hoodie",
    name: '"I Got Next." Hoodie',
    price: 45,
    description: "The three words that echo across every handball court. Heavy fleece hoodie with embroidered details. A statement piece for those who are always ready.",
    image: "/images/i-got-next-hoodie.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Hoodies",
  },
  {
    id: "i-love-handball-hoodie",
    name: "I ♥ Handball Hoodie",
    price: 45,
    description: "For those who don't just play handball — they live it. Cozy heavyweight hoodie with the classic I Love Handball graphic. A gift-ready fan favorite.",
    image: "/images/i-love-handball-hoodie.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Hoodies",
  },
  {
    id: "rightside-stripe",
    name: "Rightside Hoodie (Stripe)",
    price: 45,
    description: "A bold stripe design that turns heads on and off the court. Heavyweight fleece with a clean cut. Because your warm-up gear should be as sharp as your serve.",
    image: "/images/rightside-stripe.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Hoodies",
  },
  {
    id: "true-sport-dry-fit",
    name: '"The True Sport" Dry-Fit Tee',
    price: 35,
    description: "Lightweight, breathable dry-fit material built for competitive play. Moisture-wicking fabric keeps you cool when the rallies get long. Represent the truest sport.",
    image: "/images/true-sport-dry-fit.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tees",
  },
  {
    id: "true-sport-cotton",
    name: '"The True Sport" Cotton Tee',
    price: 25,
    description: "Represent handball and New York culture with this unique cotton tee. Soft, durable, and broken in from day one. A staple for any real one.",
    image: "/images/true-sport-cotton.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tees",
  },
  {
    id: "where-theres-a-will",
    name: '"Where There\'s A Will" Tee',
    price: 35,
    description: "The mantra of every handball player who ever grinded through a tough match. Heavyweight cotton tee with a motivational graphic that hits every time.",
    image: "/images/where-theres-a-will.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tees",
  },
  {
    id: "may-the-4th",
    name: "May The 4th Be With You Tee",
    price: 35,
    description: "A crossover classic for the handball player who's also a fan of the galaxy far, far away. Limited seasonal drop. Wear it with pride on and off the court.",
    image: "/images/may-the-4th.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tees",
  },
  {
    id: "vlogger-tee",
    name: '"Im A Vlogger" Tee',
    price: 35,
    description: "For the player documenting the culture. A tongue-in-cheek nod to everyone out here filming every ace and lob shot. Soft cotton, standout graphic.",
    image: "/images/vlogger-tee.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tees",
  },
  {
    id: "pink-dry-fit-tank",
    name: 'Pink "I Got Next." Dry-Fit Tank',
    price: 35,
    description: "Sleek pink dry-fit tank for the player who stays fresh under pressure. Moisture-wicking, lightweight, and built for full range of motion. Court-ready from the jump.",
    image: "/images/pink-dry-fit-tank.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tanks",
  },
  {
    id: "black-dry-fit-tank",
    name: 'Black "I Got Next." Dry-Fit Tank',
    price: 35,
    description: "The classic in black. Dry-fit performance tank that moves with you. Clean, minimal, and unmistakably Project Handball. A wardrobe essential for any player.",
    image: "/images/black-dry-fit-tank.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tanks",
  },
  {
    id: "red-dry-fit-tank",
    name: 'Red "I Got Next." Dry-Fit Tank',
    price: 35,
    description: "Bold red colorway for players who want to be seen. Same performance dry-fit build — moisture-wicking, breathable, competition-ready on any court.",
    image: "/images/red-dry-fit-tank.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tanks",
  },
  {
    id: "blue-dry-fit-tank",
    name: 'Blue "I Got Next." Dry-Fit Tank',
    price: 35,
    description: "Sky blue dry-fit tank for the warm weather grinder. Lightweight performance fabric keeps you cool when the sun is beating down and the rallies keep coming.",
    image: "/images/blue-dry-fit-tank.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tanks",
  },
  {
    id: "grey-dry-fit-tank",
    name: 'Grey "I Got Next." Dry-Fit Tank',
    price: 35,
    description: "The clean grey colorway for the understated player who lets their game speak loudest. Dry-fit performance with the iconic I Got Next. graphic.",
    image: "/images/grey-dry-fit-tank.jpg",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tanks",
  },
  {
    id: "airpods-case",
    name: "ProjectHandball AirPods Case",
    price: 15,
    description: "Rep the brand even when you're not on the court. Custom ProjectHandball AirPods case — the perfect accessory drop for the handball fan who has everything.",
    image: "/images/airpods-case.jpg",
    sizes: ["One Size"],
    colors: [{ name: "Black", hex: "#1A1A1A" }],
    category: "Accessories",
    isNew: true,
  },
];

export function getProduct(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getRelatedProducts(id: string, limit = 4): Product[] {
  const product = products.find(p => p.id === id);
  // Prefer same category
  const sameCategory = products.filter(p => p.id !== id && p.category === product?.category);
  const others = products.filter(p => p.id !== id && p.category !== product?.category);
  return [...sameCategory, ...others].slice(0, limit);
}
