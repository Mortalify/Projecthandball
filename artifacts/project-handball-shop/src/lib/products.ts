export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  sizes: string[];
  category: string;
  isNew?: boolean;
};

export const products: Product[] = [
  {
    id: "classic-tee",
    name: "Project Handball Classic Tee",
    price: 35,
    description: "The essential wallball tee. Premium navy blue cotton with the classic Project Handball wordmark. Built for the concrete courts.",
    image: "/images/classic-tee.png",
    sizes: ["S", "M", "L", "XL", "2XL"],
    category: "Tees",
    isNew: true
  },
  {
    id: "hoodie",
    name: "Project Handball Hoodie",
    price: 65,
    description: "Heavyweight navy hoodie for cold nights on the court. Featuring a durable embroidered logo and a deep hood.",
    image: "/images/hoodie.png",
    sizes: ["S", "M", "L", "XL", "2XL"],
    category: "Outerwear"
  },
  {
    id: "warrior-tee",
    name: "Wallball Warrior Tee",
    price: 35,
    description: "Crisp white tee featuring a dynamic action graphic. Lightweight and breathable for intense matches.",
    image: "/images/warrior-tee.png",
    sizes: ["S", "M", "L", "XL"],
    category: "Tees"
  },
  {
    id: "cap",
    name: "Project Handball Cap",
    price: 30,
    description: "Classic snapback cap in navy with electric blue accents. Keeps the sun out of your eyes while you serve.",
    image: "/images/cap.png",
    sizes: ["One Size"],
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
    category: "Bottoms"
  },
  {
    id: "long-sleeve",
    name: "Project Handball Long Sleeve",
    price: 45,
    description: "Navy long sleeve tee with electric blue sleeve prints. Perfect for warming up or casual streetwear.",
    image: "/images/long-sleeve.png",
    sizes: ["S", "M", "L", "XL", "2XL"],
    category: "Tees"
  }
];

export function getProduct(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getRelatedProducts(id: string, limit = 4): Product[] {
  return products.filter(p => p.id !== id).slice(0, limit);
}
