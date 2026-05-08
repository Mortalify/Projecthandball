import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, ProductColor } from "@/lib/products";
import { toast } from "@/hooks/use-toast";

export type CartItem = {
  product: Product;
  size: string;
  color: ProductColor;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, size: string, color: ProductColor, quantity?: number) => void;
  removeItem: (productId: string, size: string, colorName: string) => void;
  updateQuantity: (productId: string, size: string, colorName: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("ph-cart");
      if (savedCart) setItems(JSON.parse(savedCart));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ph-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, size: string, color: ProductColor, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingIndex = currentItems.findIndex(
        (item) => item.product.id === product.id && item.size === size && item.color.name === color.name
      );
      if (existingIndex >= 0) {
        const newItems = [...currentItems];
        newItems[existingIndex] = { ...newItems[existingIndex], quantity: newItems[existingIndex].quantity + quantity };
        return newItems;
      }
      return [...currentItems, { product, size, color, quantity }];
    });

    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} — ${color.name} / ${size}`,
    });
  };

  const removeItem = (productId: string, size: string, colorName: string) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => !(item.product.id === productId && item.size === size && item.color.name === colorName)
      )
    );
  };

  const updateQuantity = (productId: string, size: string, colorName: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size, colorName);
      return;
    }
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId && item.size === size && item.color.name === colorName
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) throw new Error("useCart must be used within a CartProvider");
  return context;
}
