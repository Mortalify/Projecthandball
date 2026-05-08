import { Link } from "wouter";
import { motion } from "framer-motion";
import { XCircle, ShoppingCart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutCancel() {
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
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <XCircle className="h-12 w-12 text-muted-foreground" />
          </div>
        </motion.div>

        <div className="space-y-3">
          <h1 className="font-display font-black text-4xl uppercase tracking-tight text-primary">
            Checkout Cancelled
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            No worries — your cart is still saved. Come back when you're ready.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/cart">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest px-8 h-12 rounded-xl flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Return to Cart
            </Button>
          </Link>
          <Link href="/shop">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto font-bold uppercase tracking-widest px-8 h-12 rounded-xl flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Browse Shop
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
