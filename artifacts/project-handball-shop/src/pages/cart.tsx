import { useState } from "react";
import { Link } from "wouter";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFreeShipping = subtotal >= 150;
  const shippingProgress = Math.min((subtotal / 150) * 100, 100);
  const amountToFreeShipping = (150 - subtotal).toFixed(2);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const BASE = import.meta.env.BASE_URL ?? "/";
      const res = await fetch(`${BASE}api/stripe/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.product.id,
            colorName: i.color.name,
            sizeName: i.size,
            quantity: i.quantity,
            name: i.product.name,
            price: i.product.price,
            image: i.product.image,
          })),
        }),
      });
      if (!res.ok) throw new Error("Failed to start checkout");
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4">
        <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="font-display text-3xl font-black text-primary uppercase tracking-tight mb-3 text-center">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-sm text-sm leading-relaxed">Looks like you haven't added any gear yet. Time to get court-ready.</p>
        <Link href="/shop">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-widest px-8 h-12 rounded-xl" data-testid="button-empty-cart-shop">
            Shop All Gear
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-primary">
            Your Cart
          </h1>
          <Link href="/shop" className="text-sm font-bold text-accent hover:text-primary transition-colors uppercase tracking-widest hidden md:flex items-center gap-1">
            Continue Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">
          {/* Cart Items */}
          <div className="lg:col-span-3 space-y-4">
            {/* Free Shipping Bar */}
            <div className="rounded-2xl bg-muted/60 border border-border/50 p-5">
              <div className="flex justify-between items-center mb-2.5">
                <p className="font-bold text-sm text-primary">
                  {isFreeShipping
                    ? "You've unlocked free shipping!"
                    : `$${amountToFreeShipping} away from free shipping`}
                </p>
                {isFreeShipping && (
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">FREE</span>
                )}
              </div>
              <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${shippingProgress}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">Use code <span className="font-bold text-accent">ACESERVE</span> at checkout</p>
            </div>

            <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
              <AnimatePresence>
                {items.map((item, idx) => (
                  <motion.div
                    key={`${item.product.id}-${item.size}-${item.color.name}`}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-5 p-5 ${idx < items.length - 1 ? "border-b border-border/50" : ""}`}
                  >
                    <Link href={`/product/${item.product.id}`} className="w-20 h-24 shrink-0 rounded-xl overflow-hidden bg-muted block">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </Link>

                    <div className="flex flex-col flex-grow min-w-0">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <Link href={`/product/${item.product.id}`}>
                          <h3 className="font-display font-black text-sm uppercase tracking-wide text-primary hover:text-accent transition-colors leading-tight">
                            {item.product.name}
                          </h3>
                        </Link>
                        <span className="font-black text-base shrink-0">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-border shrink-0"
                            style={{ backgroundColor: item.color.hex }}
                          />
                          <span className="text-xs text-muted-foreground font-medium">{item.color.name}</span>
                        </div>
                        <span className="text-muted-foreground/40 text-xs">·</span>
                        <span className="text-xs text-muted-foreground font-medium">Size: {item.size}</span>
                        <span className="text-muted-foreground/40 text-xs">·</span>
                        <span className="text-xs text-muted-foreground">${item.product.price} each</span>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center rounded-xl border border-border overflow-hidden h-9">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.color.name, item.quantity - 1)}
                            className="w-9 h-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            data-testid={`btn-decrease-${item.product.id}`}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <div className="w-9 h-full flex items-center justify-center font-bold text-sm border-x border-border">
                            {item.quantity}
                          </div>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.size, item.color.name, item.quantity + 1)}
                            className="w-9 h-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            data-testid={`btn-increase-${item.product.id}`}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id, item.size, item.color.name)}
                          className="text-muted-foreground hover:text-destructive flex items-center gap-1.5 text-xs font-semibold transition-colors"
                          data-testid={`btn-remove-${item.product.id}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border/50 bg-card p-6 sticky top-24 shadow-sm">
              <h2 className="font-display font-black text-xl uppercase tracking-tight text-primary mb-6">Order Summary</h2>

              <div className="space-y-3 mb-5 pb-5 border-b border-border/50 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span className="text-foreground font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className={isFreeShipping ? "text-green-600 font-bold" : "text-foreground font-semibold"}>
                    {isFreeShipping ? "Free" : "Calculated at checkout"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-display font-black text-base uppercase tracking-wide text-primary">Total</span>
                <span className="font-display font-black text-2xl text-accent">${subtotal.toFixed(2)}</span>
              </div>

              {error && (
                <p className="text-destructive text-sm font-medium mb-4 text-center">{error}</p>
              )}

              <Button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full h-12 text-sm font-bold uppercase tracking-widest rounded-xl bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/20 flex items-center justify-center gap-2 group"
                data-testid="button-checkout"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Redirecting to payment...
                  </>
                ) : (
                  <>
                    Proceed to Checkout <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>

              <div className="flex items-center justify-center gap-2 mt-4">
                <svg className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
                <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
                  Secured by Stripe · Your payment info is encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
