import { useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/cart-context";

export default function CheckoutSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex justify-center"
        >
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
        </motion.div>

        <div className="space-y-3">
          <h1 className="font-display font-black text-4xl uppercase tracking-tight text-primary">
            Order Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your payment was successful. Our team is getting your gear ready.
          </p>
        </div>

        <div className="bg-muted/60 rounded-2xl p-5 flex items-start gap-4 text-left border border-border/50">
          <Package className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-foreground">What happens next?</p>
            <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
              You'll receive an email confirmation shortly. Your order is sent to our print partner and will ship within <span className="font-semibold text-foreground">7–14 business days</span>.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/shop">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-widest px-8 h-12 rounded-xl flex items-center gap-2 group"
            >
              Keep Shopping
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto font-bold uppercase tracking-widest px-8 h-12 rounded-xl"
            >
              Go Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
