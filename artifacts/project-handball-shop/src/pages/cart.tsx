import { useState } from "react";
import { Link } from "wouter";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckoutModal } from "@/components/checkout-modal";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const isFreeShipping = subtotal >= 75;
  const shippingProgress = Math.min((subtotal / 75) * 100, 100);
  const amountToFreeShipping = (75 - subtotal).toFixed(2);

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
    <>
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
                <p className="text-xs text-muted-foreground mt-2">Use code <span className="font-bold text-accent">SHIRT</span> at checkout</p>
              </div>

              <div className="rounded-2xl border border-border/50 overflow-hidden bg-card">
                <AnimatePresence>
                  {items.map((item, idx) => (
                    <motion.div
                      key={`${item.product.id}-${item.size}`}
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
                        <p className="text-xs text-muted-foreground font-medium mb-3">Size: {item.size} &nbsp;·&nbsp; ${item.product.price} each</p>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center rounded-xl border border-border overflow-hidden h-9">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                              className="w-9 h-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              data-testid={`btn-decrease-${item.product.id}`}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <div className="w-9 h-full flex items-center justify-center font-bold text-sm border-x border-border">
                              {item.quantity}
                            </div>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                              className="w-9 h-full flex items-center justify-center hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                              data-testid={`btn-increase-${item.product.id}`}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.size)}
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

                <Button
                  onClick={() => setCheckoutOpen(true)}
                  className="w-full h-12 text-sm font-bold uppercase tracking-widest rounded-xl bg-accent hover:bg-accent/90 text-white shadow-md shadow-accent/20 flex items-center justify-center gap-2 group"
                  data-testid="button-checkout"
                >
                  Proceed to Checkout <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>

                <p className="text-center text-[11px] text-muted-foreground mt-4 leading-relaxed">
                  Orders are handcrafted with care. Please allow up to 30 days for delivery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={items}
        subtotal={subtotal}
        onConfirmed={() => clearCart()}
      />
    </>
  );
}
