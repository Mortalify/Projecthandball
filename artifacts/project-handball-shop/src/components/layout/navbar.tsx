import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, Circle } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [location] = useLocation();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs font-medium tracking-wide">
        Free Shipping on Orders Over $75 | Use Code: <span className="font-bold text-accent">SHIRT</span>
      </div>
      
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" onClick={closeMenu} className="flex items-center gap-2" data-testid="link-home">
                <Circle className="h-6 w-6 text-accent fill-accent" />
                <span className="font-display font-bold text-xl tracking-tight text-primary uppercase">
                  Project Handball
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center gap-8">
              <Link 
                href="/" 
                className={`text-sm font-semibold uppercase tracking-wider transition-colors hover:text-accent ${location === "/" ? "text-accent" : "text-foreground"}`}
                data-testid="link-nav-home"
              >
                Home
              </Link>
              <Link 
                href="/shop" 
                className={`text-sm font-semibold uppercase tracking-wider transition-colors hover:text-accent ${location === "/shop" || location.startsWith("/product") ? "text-accent" : "text-foreground"}`}
                data-testid="link-nav-shop"
              >
                Shop All
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link href="/cart" data-testid="link-cart" className="relative group">
                <div className="flex items-center justify-center p-2 rounded-full transition-colors group-hover:bg-secondary">
                  <ShoppingBag className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
              </Link>
              
              <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu} data-testid="button-mobile-menu">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[104px] z-40 bg-background border-b shadow-lg md:hidden"
          >
            <div className="flex flex-col p-4 space-y-4">
              <Link 
                href="/" 
                onClick={closeMenu}
                className={`p-4 text-lg font-bold uppercase tracking-wider border-b ${location === "/" ? "text-accent" : ""}`}
              >
                Home
              </Link>
              <Link 
                href="/shop" 
                onClick={closeMenu}
                className={`p-4 text-lg font-bold uppercase tracking-wider ${location === "/shop" ? "text-accent" : ""}`}
              >
                Shop All
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
