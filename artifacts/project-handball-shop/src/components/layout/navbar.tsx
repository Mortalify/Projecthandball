import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import logoSrc from "@assets/project_handball_logo_1778253221361.png";

export function Navbar() {
  const [location] = useLocation();
  const { totalItems } = useCart();
  const { player, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMenu = () => setMobileMenuOpen(false);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", label: "Home", active: location === "/" },
    { href: "/tournaments", label: "Tournaments", active: location === "/tournaments", beta: true },
    { href: "/clinics", label: "Clinics", active: location === "/clinics", beta: true },
    { href: "/shop", label: "Shop All", active: location === "/shop" || location.startsWith("/product") },
  ];

  const firstName = player?.name?.split(" ")[0] ?? "";

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
              {/* Account area */}
              {!isLoading && (
                player ? (
                  <div className="relative hidden md:block" ref={accountRef}>
                    <button
                      onClick={() => setAccountOpen(o => !o)}
                      className="flex items-center gap-2 h-9 px-3 rounded-xl hover:bg-muted transition-colors text-sm font-semibold"
                    >
                      <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <span className="text-white text-xs font-black leading-none">
                          {firstName[0]?.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-foreground">{firstName}</span>
                      <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${accountOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {accountOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 mt-2 w-44 bg-card border border-border/60 rounded-xl shadow-lg py-1 z-50"
                        >
                          <div className="px-3 py-2 border-b border-border/50">
                            <p className="text-xs font-bold text-primary truncate">{player.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{player.email}</p>
                          </div>
                          <button
                            onClick={() => { logout(); setAccountOpen(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded-b-xl"
                          >
                            <LogOut className="h-4 w-4 text-muted-foreground" />
                            Sign out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="h-9 px-4 font-semibold text-sm">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className="h-9 px-4 bg-accent hover:bg-accent/90 text-white font-bold text-sm rounded-xl">
                        Sign up
                      </Button>
                    </Link>
                  </div>
                )
              )}

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

              <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-2">
                {player ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2">
                      <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                        <span className="text-white text-sm font-black">{firstName[0]?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-primary">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{player.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { logout(); closeMenu(); }}
                      className="flex items-center gap-2 py-3 px-4 text-base font-bold rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={closeMenu}>
                      <div className="flex items-center gap-2 py-3 px-4 text-base font-bold rounded-lg hover:bg-muted transition-colors">
                        <User className="h-4 w-4" />
                        Log in
                      </div>
                    </Link>
                    <Link href="/signup" onClick={closeMenu}>
                      <div className="py-3 px-4 text-base font-bold rounded-lg bg-accent text-white text-center uppercase tracking-widest">
                        Sign up
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
