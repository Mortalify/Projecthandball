import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Product } from "@/lib/products";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem } = useCart();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0]);

  const handleQuickAdd = () => {
    addItem(product, selectedSize, 1);
    setIsQuickAddOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group flex flex-col h-full"
    >
      <Link href={`/product/${product.id}`} className="relative overflow-hidden aspect-[3/4] bg-muted mb-4 block" data-testid={`link-product-${product.id}`}>
        {product.isNew && (
          <div className="absolute top-3 left-3 z-10 bg-accent text-white text-xs font-bold px-2 py-1 uppercase tracking-wider">
            New
          </div>
        )}
        <img
          src={product.image}
          alt={product.name}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      <div className="flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <Link href={`/product/${product.id}`} className="font-display font-bold text-lg hover:text-accent transition-colors">
            {product.name}
          </Link>
          <span className="font-bold">${product.price}</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">{product.category}</p>

        <div className="mt-auto">
          {product.sizes.length === 1 ? (
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider"
              onClick={() => addItem(product, product.sizes[0], 1)}
              data-testid={`button-add-${product.id}`}
            >
              Add to Cart
            </Button>
          ) : (
            <Dialog open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground font-bold uppercase tracking-wider transition-colors"
                  data-testid={`button-quickadd-${product.id}`}
                >
                  Quick Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display uppercase">{product.name}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Label className="mb-3 block font-bold text-sm uppercase tracking-wider text-muted-foreground">Select Size</Label>
                  <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <RadioGroupItem value={size} id={`size-${product.id}-${size}`} className="peer sr-only" />
                        <Label
                          htmlFor={`size-${product.id}-${size}`}
                          className="flex h-12 w-12 items-center justify-center rounded-md border-2 border-muted bg-popover font-bold hover:bg-accent hover:text-white peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent peer-data-[state=checked]:text-white cursor-pointer transition-colors"
                        >
                          {size}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <DialogFooter>
                  <Button 
                    onClick={handleQuickAdd} 
                    className="w-full bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider"
                    data-testid="button-confirm-quickadd"
                  >
                    Add to Cart - ${product.price}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </motion.div>
  );
}
