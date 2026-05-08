import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import logoSrc from "@assets/project_handball_logo_1778253221361.png";

export function Navbar() {
  const [location] = useLocation();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs font-medium tracking-widest uppercase">
        Free Shipping on Orders Over $150 &nbsp;|&nbsp; Use Code: <span className="font-bold text-accent">ACESERVE</span>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" onClick={closeMenu} className="flex items-center gap-3" data-testid="link-home">
              <img src={logoSrc} alt="Project Handball Logo" className="h-10 w-10 object-contain" />
              <span className="font-display font-black text-lg tracking-tight text-primary uppercase hidden sm:inline">
                Project Handball
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/"
                className={`text-sm font-semibold uppercase tracking-widest transition-colors hover:text-accent relative group ${location === "/" ? "text-accent" : "text-foreground"}`}
                data-testid="link-nav-home"
              >
                Home
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300 ${location === "/" ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
              <Link
                href="/shop"
                className={`text-sm font-semibold uppercase tracking-widest transition-colors hover:text-accent relative group ${location === "/shop" || location.startsWith("/product") ? "text-accent" : "text-foreground"}`}
                data-testid="link-nav-shop"
              >
                Shop All
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300 ${location === "/shop" || location.startsWith("/product") ? "w-full" : "w-0 group-hover:w-full"}`} />
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link href="/cart" data-testid="link-cart" className="relative group">
                <div className="flex items-center justify-center w-10 h-10 rounded-full transition-colors hover:bg-muted">
                  <ShoppingBag className="h-5 w-5" />
                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.span
                        key="cart-count"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-accent text-[10px] font-bold text-white flex items-center justify-center shadow"
                      >
                        {totalItems}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>

              <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu} data-testid="button-mobile-menu">
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[104px] z-40 bg-background/98 backdrop-blur-md border-b shadow-lg md:hidden"
          >
            <div className="flex flex-col p-6 gap-1">
              <Link
                href="/"
                onClick={closeMenu}
                className={`py-3 px-4 text-base font-bold uppercase tracking-widest rounded-lg transition-colors ${location === "/" ? "text-accent bg-accent/10" : "hover:bg-muted"}`}
              >
                Home
              </Link>
              <Link
                href="/shop"
                onClick={closeMenu}
                className={`py-3 px-4 text-base font-bold uppercase tracking-widest rounded-lg transition-colors ${location === "/shop" ? "text-accent bg-accent/10" : "hover:bg-muted"}`}
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
