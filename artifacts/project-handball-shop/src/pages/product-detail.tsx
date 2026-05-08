import { useState } from "react";
import { useParams, Link } from "wouter";
import { getProduct, getRelatedProducts } from "@/lib/products";
import { useCart } from "@/contexts/cart-context";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Minus, Plus, ChevronRight, Check } from "lucide-react";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const product = id ? getProduct(id) : undefined;
  const { addItem } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes[0] || "");
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background">
        <h1 className="text-3xl font-display font-bold text-primary mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">The gear you're looking for doesn't exist.</p>
        <Link href="/shop">
          <Button className="bg-accent font-bold uppercase tracking-wider">Return to Shop</Button>
        </Link>
      </div>
    );
  }

  const relatedProducts = getRelatedProducts(product.id, 3);

  const handleAddToCart = () => {
    addItem(product, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const increaseQuantity = () => setQuantity(q => q + 1);
  const decreaseQuantity = () => setQuantity(q => Math.max(1, q - 1));

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumbs */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-4 flex items-center text-sm text-muted-foreground font-medium">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-primary font-bold">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Product Image */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="relative aspect-[3/4] bg-muted w-full overflow-hidden"
          >
            {product.isNew && (
              <div className="absolute top-4 left-4 z-10 bg-accent text-white text-sm font-bold px-3 py-1 uppercase tracking-wider">
                New Arrival
              </div>
            )}
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Product Details */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight text-primary mb-4">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-accent mb-6">${product.price}</p>
            
            <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
              {product.description}
            </p>

            <div className="space-y-8 mb-10">
              {/* Size Selector */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Label className="font-bold text-sm uppercase tracking-wider text-primary">Select Size</Label>
                  <a href="#" className="text-sm text-muted-foreground underline hover:text-accent">Size Guide</a>
                </div>
                
                {product.sizes.length === 1 ? (
                  <div className="inline-flex h-14 items-center justify-center rounded-md border-2 border-primary/20 bg-muted px-6 font-bold text-primary">
                    {product.sizes[0]}
                  </div>
                ) : (
                  <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <div key={size} className="flex items-center">
                        <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                        <Label
                          htmlFor={`size-${size}`}
                          className="flex h-14 w-14 items-center justify-center rounded-none border-2 border-primary/20 bg-background font-bold text-lg hover:border-primary peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent peer-data-[state=checked]:text-white cursor-pointer transition-all"
                        >
                          {size}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>

              {/* Quantity */}
              <div>
                <Label className="block font-bold text-sm uppercase tracking-wider text-primary mb-4">Quantity</Label>
                <div className="flex items-center border-2 border-primary/20 w-max">
                  <button 
                    onClick={decreaseQuantity}
                    className="w-12 h-14 flex items-center justify-center hover:bg-muted text-primary transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <div className="w-14 h-14 flex items-center justify-center font-bold text-lg border-x-2 border-primary/20">
                    {quantity}
                  </div>
                  <button 
                    onClick={increaseQuantity}
                    className="w-12 h-14 flex items-center justify-center hover:bg-muted text-primary transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            <Button 
              size="lg" 
              className={`w-full h-16 text-lg font-bold uppercase tracking-widest rounded-none transition-all duration-300 ${
                isAdded ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary/90'
              }`}
              onClick={handleAddToCart}
              data-testid="button-add-to-cart-detail"
            >
              {isAdded ? (
                <span className="flex items-center gap-2"><Check className="h-6 w-6" /> Added to Cart</span>
              ) : (
                `Add to Cart - $${product.price * quantity}`
              )}
            </Button>

            <div className="mt-8 space-y-4 pt-8 border-t border-primary/10 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> Free shipping on orders over $150</p>
              <p className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> Secure checkout</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Related Products */}
      <section className="py-20 bg-muted/30 border-t border-primary/10">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-display font-bold uppercase tracking-tight text-primary mb-10 text-center">Complete The Fit</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {relatedProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
