import { useState } from "react";
import { useParams, Link } from "wouter";
import { getProduct, getRelatedProducts, type ProductColor } from "@/lib/products";
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
  const [selectedColor, setSelectedColor] = useState<ProductColor>(product?.colors[0] || { name: "Black", hex: "#1A1A1A" });
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background">
        <h1 className="text-3xl font-display font-bold text-primary mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">The gear you're looking for doesn't exist.</p>
        <Link href="/shop">
          <Button className="bg-accent font-bold uppercase tracking-wider">Back to Shop</Button>
        </Link>
      </div>
    );
  }

  const relatedProducts = getRelatedProducts(product.id, 3);

  const handleAddToCart = () => {
    addItem(product, selectedSize, selectedColor, quantity);
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
            className="relative aspect-[3/4] bg-muted w-full overflow-hidden rounded-2xl"
          >
            {product.isNew && (
              <div className="absolute top-4 left-4 z-10 bg-accent text-white text-xs font-bold px-3 py-1.5 uppercase tracking-wider rounded-full">
                New Arrival
              </div>
            )}
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>

          {/* Product Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col"
          >
            <p className="text-accent font-bold text-xs uppercase tracking-[0.3em] mb-2">{product.category}</p>
            <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-primary mb-3 leading-tight">
              {product.name}
            </h1>
            <p className="text-2xl font-black text-accent mb-6">${product.price}</p>

            <p className="text-muted-foreground leading-relaxed mb-8">
              {product.description}
            </p>

            <div className="space-y-7 mb-10">
              {/* Color Picker */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="font-bold text-sm uppercase tracking-wider text-primary">
                    Color
                  </Label>
                  <span className="text-sm font-semibold text-foreground">{selectedColor.name}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((color) => {
                    const isSelected = selectedColor.name === color.name;
                    const isLight = ["Light Blue", "Light Pink", "Safety Green"].includes(color.name);
                    return (
                      <button
                        key={color.name}
                        title={color.name}
                        onClick={() => setSelectedColor(color)}
                        className={`relative w-9 h-9 rounded-full transition-all duration-150 focus:outline-none ${
                          isSelected
                            ? "ring-2 ring-offset-2 ring-primary scale-110"
                            : "hover:scale-105 ring-1 ring-border"
                        }`}
                        style={{ backgroundColor: color.hex }}
                        aria-label={color.name}
                        data-testid={`color-${color.name.replace(/\s+/g, "-").toLowerCase()}`}
                      >
                        {isSelected && (
                          <Check
                            className="h-4 w-4 absolute inset-0 m-auto"
                            style={{ color: isLight ? "#002151" : "#ffffff" }}
                            strokeWidth={3}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Selector */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label className="font-bold text-sm uppercase tracking-wider text-primary">Select Size</Label>
                  <a href="#" className="text-xs text-muted-foreground underline hover:text-accent">Size Guide</a>
                </div>

                {product.sizes.length === 1 ? (
                  <div className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-primary/20 bg-muted px-6 font-bold text-primary">
                    {product.sizes[0]}
                  </div>
                ) : (
                  <RadioGroup value={selectedSize} onValueChange={setSelectedSize} className="flex flex-wrap gap-2.5">
                    {product.sizes.map((size) => (
                      <div key={size} className="flex items-center">
                        <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                        <Label
                          htmlFor={`size-${size}`}
                          className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-border bg-background font-bold hover:border-primary peer-data-[state=checked]:border-accent peer-data-[state=checked]:bg-accent peer-data-[state=checked]:text-white cursor-pointer transition-all text-sm"
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
                <Label className="block font-bold text-sm uppercase tracking-wider text-primary mb-3">Quantity</Label>
                <div className="flex items-center rounded-xl border-2 border-border w-max overflow-hidden">
                  <button
                    onClick={decreaseQuantity}
                    className="w-12 h-12 flex items-center justify-center hover:bg-muted text-primary transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <div className="w-12 h-12 flex items-center justify-center font-bold text-base border-x-2 border-border">
                    {quantity}
                  </div>
                  <button
                    onClick={increaseQuantity}
                    className="w-12 h-12 flex items-center justify-center hover:bg-muted text-primary transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className={`w-full h-14 text-base font-bold uppercase tracking-widest rounded-xl transition-all duration-300 ${
                isAdded ? "bg-green-600 hover:bg-green-700" : "bg-primary hover:bg-primary/90"
              }`}
              onClick={handleAddToCart}
              data-testid="button-add-to-cart-detail"
            >
              {isAdded ? (
                <span className="flex items-center gap-2"><Check className="h-5 w-5" /> Added to Cart</span>
              ) : (
                `Add to Cart — $${product.price * quantity}`
              )}
            </Button>

            <div className="mt-8 space-y-3 pt-6 border-t border-border/50 text-sm text-muted-foreground">
              <p className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Free shipping on orders over $150</p>
              <p className="flex items-center gap-2"><Check className="h-4 w-4 text-accent shrink-0" /> Secure checkout</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Related Products */}
      <section className="py-20 bg-muted/30 border-t border-border/50">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-3xl font-black uppercase tracking-tight text-primary mb-10 text-center">Complete The Fit</h2>
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
