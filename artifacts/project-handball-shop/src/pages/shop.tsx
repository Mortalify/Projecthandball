import { useState } from "react";
import { useProducts } from "@/hooks/use-printify";
import { ProductCard } from "@/components/product-card";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Tees", "Hoodies", "Tanks", "Accessories"];

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-muted rounded-xl mb-4" />
      <div className="h-4 bg-muted rounded w-3/4 mb-2" />
      <div className="h-4 bg-muted rounded w-1/3" />
    </div>
  );
}

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { products, loading, error } = useProducts();

  const filteredProducts = activeCategory === "All"
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs font-medium tracking-widest uppercase">
        Free Shipping on Orders Over $150 &nbsp;|&nbsp; Use Code: <span className="font-bold text-accent">ACESERVE</span>
      </div>

      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tight text-primary mb-4">Shop All Gear</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Everything you need for the court. Premium apparel designed for wallball athletes.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-10 pb-6 border-b border-primary/10">
            {CATEGORIES.map(category => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className={
                  activeCategory === category
                    ? "bg-primary text-white font-bold uppercase tracking-wider"
                    : "border-primary/20 text-primary font-bold uppercase tracking-wider hover:bg-secondary/50"
                }
                data-testid={`filter-${category.toLowerCase()}`}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="py-20 text-center">
              <h3 className="text-2xl font-display font-bold text-primary mb-2">Couldn't load products</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          )}

          {/* Product Grid */}
          {!loading && !error && filteredProducts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="py-20 text-center">
              <h3 className="text-2xl font-display font-bold text-primary mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">We don't have any products in this category yet.</p>
              <Button onClick={() => setActiveCategory("All")} variant="outline" className="uppercase font-bold tracking-wider">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
