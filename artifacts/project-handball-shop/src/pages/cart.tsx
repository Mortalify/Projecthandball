import { Link } from "wouter";
import { useCart } from "@/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  
  const isFreeShipping = subtotal >= 75;
  const shippingProgress = Math.min((subtotal / 75) * 100, 100);
  const amountToFreeShipping = 75 - subtotal;

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
        </div>
        <h1 className="text-3xl font-display font-bold text-primary uppercase tracking-tight mb-4 text-center">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8 text-center max-w-md">Looks like you haven't added any gear to your cart yet. Time to gear up for the court.</p>
        <Link href="/shop">
          <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider px-8 h-14">
            Shop All Gear
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight text-primary mb-10">
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Free Shipping Progress */}
            <div className="bg-muted p-6 rounded-lg border border-primary/10">
              <p className="font-bold text-primary uppercase tracking-wide text-sm mb-3">
                {isFreeShipping 
                  ? "🎉 You've unlocked free shipping!" 
                  : `You're $${amountToFreeShipping.toFixed(2)} away from free shipping`
                }
              </p>
              <div className="h-2 w-full bg-primary/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent transition-all duration-500 ease-in-out"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 font-medium">Use code SHIRT at checkout</p>
            </div>

            <div className="border-t-2 border-primary">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div 
                    key={`${item.product.id}-${item.size}`}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="py-6 border-b border-primary/10 flex flex-col sm:flex-row gap-6"
                  >
                    {/* Item Image */}
                    <Link href={`/product/${item.product.id}`} className="w-24 sm:w-32 aspect-[3/4] bg-muted shrink-0 block">
                      <img 
                        src={item.product.image} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Item Details */}
                    <div className="flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-2">
                        <Link href={`/product/${item.product.id}`}>
                          <h3 className="font-display font-bold text-lg uppercase tracking-wide text-primary hover:text-accent transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="font-bold text-lg">${(item.product.price * item.quantity).toFixed(2)}</p>
                      </div>
                      
                      <p className="text-muted-foreground text-sm font-medium mb-4">Size: {item.size}</p>
                      
                      <div className="mt-auto flex justify-between items-end">
                        <div className="flex items-center border border-primary/20 bg-background h-10 w-max">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                            className="w-10 h-full flex items-center justify-center text-primary hover:bg-muted transition-colors"
                            data-testid={`btn-decrease-${item.product.id}`}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <div className="w-10 h-full flex items-center justify-center font-bold text-sm border-x border-primary/20">
                            {item.quantity}
                          </div>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                            className="w-10 h-full flex items-center justify-center text-primary hover:bg-muted transition-colors"
                            data-testid={`btn-increase-${item.product.id}`}
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button 
                          onClick={() => removeItem(item.product.id, item.size)}
                          className="text-muted-foreground hover:text-destructive flex items-center gap-1 text-sm font-medium transition-colors"
                          data-testid={`btn-remove-${item.product.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">Remove</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-muted p-8 sticky top-24 border border-primary/10">
              <h2 className="font-display font-bold text-2xl uppercase tracking-tight text-primary mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 border-b border-primary/10 pb-6">
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Subtotal</span>
                  <span className="text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Shipping</span>
                  <span className={isFreeShipping ? "text-green-600 font-bold uppercase text-sm" : "text-foreground"}>
                    {isFreeShipping ? "Free" : "Calculated at next step"}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground font-medium">
                  <span>Tax</span>
                  <span className="text-foreground">Calculated at next step</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-8">
                <span className="font-display font-bold text-xl uppercase tracking-wide text-primary">Total</span>
                <span className="font-display font-bold text-2xl text-accent">${subtotal.toFixed(2)}</span>
              </div>
              
              <Button 
                className="w-full h-14 text-lg font-bold uppercase tracking-widest rounded-none bg-primary hover:bg-primary/90 flex items-center justify-center gap-2 group"
                data-testid="button-checkout"
              >
                Checkout <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <p className="text-center text-xs text-muted-foreground mt-4">
                Secure checkout. 30-day returns.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
