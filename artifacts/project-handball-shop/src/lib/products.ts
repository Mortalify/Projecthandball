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
  images: string[];
  sizes: string[];
  colors: ProductColor[];
  category: string;
  isNew?: boolean;
};

function gallery(folder: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => `/images/products/${folder}/${i + 1}.jpg`);
}

export const products: Product[] = [
  {
    id: "i-got-next-cotton-tee",
    name: "ProjectHandball X FL Limited Edition Tee",
    price: 35,
    description: "A limited edition collab tee you won't find anywhere else. Premium cotton, bold graphics, and that Project Handball energy. Grab it before it's gone.",
    image: "/images/products/i-got-next-cotton-tee/1.jpg",
    images: gallery("i-got-next-cotton-tee", 8),
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
    image: "/images/products/simply-handball-hoodie/1.jpg",
    images: gallery("simply-handball-hoodie", 8),
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
    image: "/images/products/maroon-i-got-next-hoodie/1.jpg",
    images: gallery("maroon-i-got-next-hoodie", 8),
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Hoodies",
  },
  {
    id: "i-love-handball-hoodie",
    name: "I ♥ Handball Hoodie",
    price: 45,
    description: "For those who don't just play handball — they live it. Cozy heavyweight hoodie with the classic I Love Handball graphic. A gift-ready fan favorite.",
    image: "/images/products/i-3-handball-hoodie/1.jpg",
    images: gallery("i-3-handball-hoodie", 8),
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Hoodies",
  },
  {
    id: "rightside-stripe",
    name: "Rightside Hoodie (Stripe)",
    price: 45,
    description: "A bold stripe design that turns heads on and off the court. Heavyweight fleece with a clean cut. Because your warm-up gear should be as sharp as your serve.",
    image: "/images/products/rightside-stripe/1.jpg",
    images: gallery("rightside-stripe", 8),
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Hoodies",
  },
  {
    id: "true-sport-dry-fit",
    name: '"The True Sport" Dry-Fit Tee',
    price: 35,
    description: "Lightweight, breathable dry-fit material built for competitive play. Moisture-wicking fabric keeps you cool when the rallies get long. Represent the truest sport.",
    image: "/images/products/the-true-sport-dry-fit-tee/1.jpg",
    images: gallery("the-true-sport-dry-fit-tee", 8),
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tees",
  },
  {
    id: "true-sport-cotton",
    name: '"The True Sport" Cotton Tee',
    price: 25,
    description: "Represent handball and New York culture with this unique cotton tee. Soft, durable, and broken in from day one. A staple for any real one.",
    image: "/images/products/the-true-sport-t-shirt/1.jpg",
    images: gallery("the-true-sport-t-shirt", 8),
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tees",
  },
  {
    id: "where-theres-a-will",
    name: '"Where There\'s A Will" Tee',
    price: 35,
    description: "The mantra of every handball player who ever grinded through a tough match. Heavyweight cotton tee with a motivational graphic that hits every time.",
    image: "/images/products/where-theres-a-will-t-shirt/1.jpg",
    images: gallery("where-theres-a-will-t-shirt", 8),
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tees",
  },
  {
    id: "may-the-4th",
    name: "May The 4th Be With You Tee",
    price: 35,
    description: "A crossover classic for the handball player who's also a fan of the galaxy far, far away. Limited seasonal drop. Wear it with pride on and off the court.",
    image: "/images/products/may-the-4th-be-with-you/1.jpg",
    images: gallery("may-the-4th-be-with-you", 8),
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tees",
  },
  {
    id: "vlogger-tee",
    name: '"What Are You Wearing?" Tee',
    price: 35,
    description: "For the player documenting the culture. A tongue-in-cheek nod to everyone out here filming every ace and lob shot. Soft cotton, standout graphic.",
    image: "/images/products/what-are-you-wearing-tee/1.jpg",
    images: gallery("what-are-you-wearing-tee", 2),
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: AVAILABLE_COLORS,
    category: "Tees",
  },
  {
    id: "pink-dry-fit-tank",
    name: 'Pink "I Got Next." Dry-Fit Tank',
    price: 35,
    description: "Sleek pink dry-fit tank for the player who stays fresh under pressure. Moisture-wicking, lightweight, and built for full range of motion. Court-ready from the jump.",
    image: "/images/products/pink-i-got-next-dry-fit-jersey/1.jpg",
    images: gallery("pink-i-got-next-dry-fit-jersey", 2),
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: [{ name: "Pink", hex: "#FFB6C1" }],
    category: "Tanks",
  },
  {
    id: "black-dry-fit-tank",
    name: 'Black "I Got Next." Dry-Fit Tank',
    price: 35,
    description: "The classic in black. Dry-fit performance tank that moves with you. Clean, minimal, and unmistakably Project Handball. A wardrobe essential for any player.",
    image: "/images/products/black-i-got-next-dry-fit-jersey/1.jpg",
    images: gallery("black-i-got-next-dry-fit-jersey", 2),
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: [{ name: "Black", hex: "#1A1A1A" }],
    category: "Tanks",
  },
  {
    id: "red-dry-fit-tank",
    name: 'Red "I Got Next." Dry-Fit Tank',
    price: 35,
    description: "Bold red colorway for players who want to be seen. Same performance dry-fit build — moisture-wicking, breathable, competition-ready on any court.",
    image: "/images/products/red-i-got-next-v-neck-jersey/1.jpg",
    images: gallery("red-i-got-next-v-neck-jersey", 2),
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: [{ name: "Red", hex: "#CC0000" }],
    category: "Tanks",
  },
  {
    id: "blue-dry-fit-tank",
    name: 'Blue "I Got Next." Dry-Fit Tank',
    price: 35,
    description: "Sky blue dry-fit tank for the warm weather grinder. Lightweight performance fabric keeps you cool when the sun is beating down and the rallies keep coming.",
    image: "/images/products/blue-i-got-next-v-neck-jersey/1.jpg",
    images: gallery("blue-i-got-next-v-neck-jersey", 2),
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: [{ name: "Blue", hex: "#3BB7FD" }],
    category: "Tanks",
  },
  {
    id: "grey-dry-fit-tank",
    name: 'Grey "I Got Next." Dry-Fit Tank',
    price: 35,
    description: "The clean grey colorway for the understated player who lets their game speak loudest. Dry-fit performance with the iconic I Got Next. graphic.",
    image: "/images/products/grey-i-got-next-dry-fit-jersey/1.jpg",
    images: gallery("grey-i-got-next-dry-fit-jersey", 2),
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: [{ name: "Grey", hex: "#9E9E9E" }],
    category: "Tanks",
  },
  {
    id: "airpods-case",
    name: "ProjectHandball AirPods Case",
    price: 15,
    description: "Rep the brand even when you're not on the court. Custom ProjectHandball AirPods case — the perfect accessory drop for the handball fan who has everything.",
    image: "/images/products/projecthandball-airpods-case/1.jpg",
    images: gallery("projecthandball-airpods-case", 6),
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
  const sameCategory = products.filter(p => p.id !== id && p.category === product?.category);
  const others = products.filter(p => p.id !== id && p.category !== product?.category);
  return [...sameCategory, ...others].slice(0, limit);
}
