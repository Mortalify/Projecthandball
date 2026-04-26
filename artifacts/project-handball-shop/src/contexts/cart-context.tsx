import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/lib/products";
import { toast } from "@/hooks/use-toast";

export type CartItem = {
  product: Product;
  size: string;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (product: Product, size: string, quantity?: number) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load from local storage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("ph-cart");
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error("Failed to parse cart from local storage", e);
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem("ph-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, size: string, quantity: number = 1) => {
    setItems((currentItems) => {
      const existingItemIndex = currentItems.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );

      if (existingItemIndex >= 0) {
        const newItems = [...currentItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }

      return [...currentItems, { product, size, quantity }];
    });

    toast({
      title: "Added to cart",
      description: `${quantity}x ${product.name} (${size})`,
    });
  };

  const removeItem = (productId: string, size: string) => {
    setItems((currentItems) => 
      currentItems.filter((item) => !(item.product.id === productId && item.size === size))
    );
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, size);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
