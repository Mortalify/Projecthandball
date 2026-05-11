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

  const navLinks = [
    { href: "/", label: "Home", active: location === "/" },
    { href: "/tournaments", label: "Tournaments", active: location === "/tournaments", beta: true },
    { href: "/shop", label: "Shop All", active: location === "/shop" || location.startsWith("/product") },
  ];

  return (
    <>
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
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-semibold uppercase tracking-widest transition-colors hover:text-accent relative group inline-flex items-center gap-1.5 ${link.active ? "text-accent" : "text-foreground"}`}
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {link.label}
                  {link.beta && (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-accent/15 text-accent border border-accent/30 px-1.5 py-0.5 rounded-full leading-none">
                      Beta
                    </span>
                  )}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-accent transition-all duration-300 ${link.active ? "w-full" : "w-0 group-hover:w-full"}`} />
                </Link>
              ))}
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
            className="fixed inset-x-0 top-16 z-40 bg-background/98 backdrop-blur-md border-b shadow-lg md:hidden"
          >
            <div className="flex flex-col p-6 gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className={`py-3 px-4 text-base font-bold uppercase tracking-widest rounded-lg transition-colors inline-flex items-center gap-2 ${link.active ? "text-accent bg-accent/10" : "hover:bg-muted"}`}
                >
                  {link.label}
                  {link.beta && (
                    <span className="text-[9px] font-black uppercase tracking-wider bg-accent/15 text-accent border border-accent/30 px-1.5 py-0.5 rounded-full leading-none">
                      Beta
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
