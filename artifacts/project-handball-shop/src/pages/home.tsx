import { Link } from "wouter";
import { motion } from "framer-motion";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-primary">
        <div className="absolute inset-0">
          <img 
            src="/images/hero.png" 
            alt="Handball players on outdoor court" 
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end pb-24 md:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-black text-white leading-none mb-6 tracking-tight uppercase">
              Built for the <br/><span className="text-accent">Concrete.</span>
            </h1>
            <p className="text-lg md:text-xl text-secondary/90 mb-8 max-w-xl font-medium">
              Premium apparel engineered for the streets. We create quality handball gear for players who leave it all on the court.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold text-lg px-8 py-6 rounded-none uppercase tracking-widest border-2 border-accent" data-testid="button-hero-shop">
                  Shop Now
                </Button>
              </Link>
              <Link href="/shop?category=Tees">
                <Button variant="outline" size="lg" className="bg-transparent border-white text-white hover:bg-white hover:text-primary font-bold text-lg px-8 py-6 rounded-none uppercase tracking-widest" data-testid="button-hero-tees">
                  View Tees
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b-2 border-primary/10 pb-6">
            <div>
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight text-primary"
              >
                Latest Drops
              </motion.h2>
              <p className="text-muted-foreground mt-2 font-medium">The newest gear hitting the streets.</p>
            </div>
            <Link href="/shop" className="group flex items-center gap-2 font-bold uppercase tracking-wider text-accent hover:text-primary transition-colors mt-4 md:mt-0">
              View All <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* As Seen On Court - Lifestyle Gallery */}
      <section className="py-20 bg-primary text-white overflow-hidden">
        <div className="container mx-auto px-4 mb-12 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-display font-bold uppercase tracking-tight mb-4"
          >
            As Seen On Court
          </motion.h2>
          <p className="text-secondary/80 max-w-2xl mx-auto font-medium">
            Tag us <span className="text-accent font-bold">@ProjectHandball</span> to be featured.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 px-4 md:px-0">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-1/3 aspect-square relative group overflow-hidden"
          >
            <img src="/images/court-3.png" alt="Wide shot of court" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full md:w-1/3 aspect-square relative group overflow-hidden"
          >
            <img src="/images/classic-tee.png" alt="Classic tee action" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500" />
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full md:w-1/3 aspect-square relative group overflow-hidden"
          >
            <img src="/images/shorts.png" alt="Shorts action" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-primary/20 group-hover:bg-transparent transition-colors duration-500" />
          </motion.div>
        </div>
      </section>

      {/* Brand Value Props */}
      <section className="py-24 bg-background border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mb-6 text-primary">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h3 className="font-display font-bold text-xl uppercase mb-3">Premium Quality</h3>
              <p className="text-muted-foreground">Built to withstand the toughest concrete courts and intense play.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mb-6 text-primary">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
              </div>
              <h3 className="font-display font-bold text-xl uppercase mb-3">Free Shipping</h3>
              <p className="text-muted-foreground">On all domestic orders over $75. Use code SHIRT at checkout.</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="w-16 h-16 bg-secondary/30 rounded-full flex items-center justify-center mb-6 text-primary">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </div>
              <h3 className="font-display font-bold text-xl uppercase mb-3">Secure Checkout</h3>
              <p className="text-muted-foreground">Shop with confidence. Your payment information is processed securely.</p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
