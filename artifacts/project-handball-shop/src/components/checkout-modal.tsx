import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartItem } from "@/contexts/cart-context";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, CheckCircle2, Loader2, Package } from "lucide-react";
import logoSrc from "@assets/project_handball_logo_1778253221361.png";

type Step = "contact" | "shipping" | "review" | "confirmed";

interface CheckoutForm {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  subtotal: number;
  onConfirmed: () => void;
}

const STEPS: Step[] = ["contact", "shipping", "review", "confirmed"];

export function CheckoutModal({ open, onClose, items, subtotal, onConfirmed }: CheckoutModalProps) {
  const [step, setStep] = useState<Step>("contact");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CheckoutForm>({
    name: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "", country: "United States",
  });

  const isFreeShipping = subtotal >= 75;
  const shipping = isFreeShipping ? 0 : 8.99;
  const total = subtotal + shipping;

  const update = (field: keyof CheckoutForm, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const validateContact = () => form.name.trim() && form.email.trim() && form.phone.trim();
  const validateShipping = () => form.address.trim() && form.city.trim() && form.state.trim() && form.zip.trim();

  const handleNext = () => {
    if (step === "contact" && !validateContact()) {
      setError("Please fill in all contact fields.");
      return;
    }
    if (step === "shipping" && !validateShipping()) {
      setError("Please fill in all shipping fields.");
      return;
    }
    setError(null);
    const idx = STEPS.indexOf(step);
    if (idx < STEPS.length - 1) setStep(STEPS[idx + 1]);
  };

  const handleBack = () => {
    setError(null);
    const idx = STEPS.indexOf(step);
    if (idx > 0) setStep(STEPS[idx - 1]);
  };

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        customer: { name: form.name, email: form.email, phone: form.phone },
        shipping: {
          address: form.address, city: form.city,
          state: form.state, zip: form.zip, country: form.country,
        },
        order: {
          items: items.map(i => ({
            name: i.product.name,
            size: i.size,
            quantity: i.quantity,
            price: i.product.price,
            lineTotal: i.product.price * i.quantity,
          })),
          subtotal,
          shipping: shipping,
          total,
          freeShipping: isFreeShipping,
        },
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Order submission failed");
      setStep("confirmed");
      onConfirmed();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (step === "confirmed") {
      setStep("contact");
      setForm({ name: "", email: "", phone: "", address: "", city: "", state: "", zip: "", country: "United States" });
    }
    onClose();
  };

  const stepNumber = STEPS.indexOf(step) + 1;
  const totalSteps = STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-0 shadow-2xl" aria-describedby={undefined}>
        <DialogTitle className="sr-only">Checkout</DialogTitle>

        {step !== "confirmed" && (
          <div className="bg-primary px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logoSrc} alt="Project Handball" className="h-8 w-8 object-contain" />
              <span className="font-display font-black text-sm uppercase tracking-wider text-white">Checkout</span>
            </div>
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(n => (
                <div key={n} className={`h-1.5 rounded-full transition-all duration-300 ${n <= stepNumber ? "bg-accent w-8" : "bg-white/20 w-4"}`} />
              ))}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === "contact" && (
            <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-5">
              <div>
                <h2 className="font-display font-bold text-xl text-primary">Contact Information</h2>
                <p className="text-muted-foreground text-sm mt-1">We'll use this to keep you updated on your order.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider">Full Name *</Label>
                  <Input id="name" value={form.name} onChange={e => update("name", e.target.value)} placeholder="Your full name" data-testid="input-checkout-name" className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider">Email Address *</Label>
                  <Input id="email" type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="your@email.com" data-testid="input-checkout-email" className="h-11" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider">Phone Number *</Label>
                  <Input id="phone" type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="(555) 000-0000" data-testid="input-checkout-phone" className="h-11" />
                </div>
              </div>
              {error && <p className="text-destructive text-sm font-medium">{error}</p>}
              <Button onClick={handleNext} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider" data-testid="button-checkout-next-contact">
                Continue to Shipping <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          )}

          {step === "shipping" && (
            <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-5">
              <div>
                <h2 className="font-display font-bold text-xl text-primary">Shipping Address</h2>
                <p className="text-muted-foreground text-sm mt-1">Where should we deliver your gear?</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-bold uppercase tracking-wider">Street Address *</Label>
                  <Input id="address" value={form.address} onChange={e => update("address", e.target.value)} placeholder="123 Court St" data-testid="input-checkout-address" className="h-11" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="city" className="text-xs font-bold uppercase tracking-wider">City *</Label>
                    <Input id="city" value={form.city} onChange={e => update("city", e.target.value)} placeholder="New York" data-testid="input-checkout-city" className="h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="state" className="text-xs font-bold uppercase tracking-wider">State *</Label>
                    <Input id="state" value={form.state} onChange={e => update("state", e.target.value)} placeholder="NY" data-testid="input-checkout-state" className="h-11" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="zip" className="text-xs font-bold uppercase tracking-wider">ZIP Code *</Label>
                    <Input id="zip" value={form.zip} onChange={e => update("zip", e.target.value)} placeholder="10001" data-testid="input-checkout-zip" className="h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="country" className="text-xs font-bold uppercase tracking-wider">Country</Label>
                    <Input id="country" value={form.country} onChange={e => update("country", e.target.value)} data-testid="input-checkout-country" className="h-11" />
                  </div>
                </div>
              </div>
              {error && <p className="text-destructive text-sm font-medium">{error}</p>}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="h-12 px-5" data-testid="button-checkout-back-shipping">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button onClick={handleNext} className="flex-1 h-12 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider" data-testid="button-checkout-next-shipping">
                  Review Order <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === "review" && (
            <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-6 space-y-5">
              <div>
                <h2 className="font-display font-bold text-xl text-primary">Review Your Order</h2>
                <p className="text-muted-foreground text-sm mt-1">Confirm your details before submitting.</p>
              </div>

              <div className="space-y-3">
                <div className="bg-muted rounded-xl p-4 space-y-1 text-sm">
                  <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">Contact</p>
                  <p className="font-semibold">{form.name}</p>
                  <p className="text-muted-foreground">{form.email}</p>
                  <p className="text-muted-foreground">{form.phone}</p>
                </div>
                <div className="bg-muted rounded-xl p-4 space-y-1 text-sm">
                  <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">Ship To</p>
                  <p className="font-semibold">{form.address}</p>
                  <p className="text-muted-foreground">{form.city}, {form.state} {form.zip}</p>
                  <p className="text-muted-foreground">{form.country}</p>
                </div>
                <div className="bg-muted rounded-xl p-4 text-sm">
                  <p className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Items</p>
                  <div className="space-y-2">
                    {items.map(item => (
                      <div key={`${item.product.id}-${item.size}`} className="flex justify-between items-center">
                        <div>
                          <span className="font-semibold">{item.product.name}</span>
                          <span className="text-muted-foreground ml-2 text-xs">× {item.quantity} / {item.size}</span>
                        </div>
                        <span className="font-bold">${(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 mt-2 space-y-1">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Subtotal</span><span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Shipping</span>
                        <span className={isFreeShipping ? "text-green-600 font-bold" : ""}>{isFreeShipping ? "Free" : `$${shipping.toFixed(2)}`}</span>
                      </div>
                      <div className="flex justify-between font-black text-base text-primary pt-1 border-t border-border">
                        <span>Total</span><span className="text-accent">${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && <p className="text-destructive text-sm font-medium">{error}</p>}
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="h-12 px-5" data-testid="button-checkout-back-review">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button onClick={handleConfirm} disabled={loading} className="flex-1 h-12 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider" data-testid="button-confirm-order">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order...</> : "Confirm Order"}
                </Button>
              </div>
            </motion.div>
          )}

          {step === "confirmed" && (
            <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center space-y-5">
              <div className="flex justify-center">
                <img src={logoSrc} alt="Project Handball" className="h-16 w-16 object-contain" />
              </div>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}>
                <CheckCircle2 className="h-16 w-16 text-accent mx-auto" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="font-display font-black text-2xl text-primary uppercase">Order Confirmed!</h2>
                <p className="text-lg font-semibold text-foreground">Our handball artisans are working on your order.</p>
                <p className="text-muted-foreground text-sm">A confirmation will be sent to <span className="font-semibold text-foreground">{form.email}</span>.</p>
              </div>
              <div className="bg-muted/60 rounded-xl p-4 flex items-start gap-3 text-left">
                <Package className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm text-foreground">Delivery Estimate</p>
                  <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                    Orders are handcrafted with care. Please allow up to <span className="font-semibold">30 days</span> for delivery.
                  </p>
                </div>
              </div>
              <Button onClick={handleClose} className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-wider" data-testid="button-close-confirmed">
                Continue Shopping
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
