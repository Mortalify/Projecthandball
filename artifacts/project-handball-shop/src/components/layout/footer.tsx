import { Link } from "wouter";
import { Instagram, Youtube } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoSrc from "@assets/project_handball_logo_1778253221361.png";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-5">
              <img src={logoSrc} alt="Project Handball Logo" className="h-12 w-12 object-contain" />
              <div className="flex flex-col">
                <span className="font-display font-black text-base tracking-tight uppercase leading-tight">
                  Project Handball
                </span>
                <span className="text-accent/80 text-[10px] font-medium tracking-widest uppercase">Est. 2022</span>
              </div>
            </Link>
            <p className="text-primary-foreground/60 text-sm mb-6 max-w-xs leading-relaxed">
              We Create Quality Handball Apparel. Built for the concrete courts, designed for the culture.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" aria-label="YouTube" className="w-9 h-9 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:text-accent hover:border-accent transition-colors" data-testid="link-social-youtube">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:text-accent hover:border-accent transition-colors" data-testid="link-social-instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" aria-label="TikTok" className="w-9 h-9 rounded-full border border-primary-foreground/20 flex items-center justify-center text-primary-foreground/60 hover:text-accent hover:border-accent transition-colors" data-testid="link-social-tiktok">
                <FaTiktok className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-display font-bold text-sm uppercase tracking-widest mb-5 text-primary-foreground/40">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/shop" className="text-primary-foreground/70 hover:text-accent transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=Tees" className="text-primary-foreground/70 hover:text-accent transition-colors">Tees</Link></li>
              <li><Link href="/shop?category=Outerwear" className="text-primary-foreground/70 hover:text-accent transition-colors">Outerwear</Link></li>
              <li><Link href="/shop?category=Bottoms" className="text-primary-foreground/70 hover:text-accent transition-colors">Bottoms</Link></li>
              <li><Link href="/shop?category=Accessories" className="text-primary-foreground/70 hover:text-accent transition-colors">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-sm uppercase tracking-widest mb-5 text-primary-foreground/40">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">FAQ</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">Shipping Info</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">Contact Us</a></li>
              <li><a href="#" className="text-primary-foreground/70 hover:text-accent transition-colors">Size Guide</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display font-bold text-sm uppercase tracking-widest mb-5 text-primary-foreground/40">Stay in the loop</h3>
            <p className="text-primary-foreground/60 text-sm mb-4 leading-relaxed">
              Get early access to drops, court content, and exclusive deals.
            </p>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-white/5 border-white/15 text-white placeholder:text-white/30 focus-visible:ring-accent focus-visible:border-accent h-10"
                data-testid="input-newsletter"
              />
              <Button type="submit" className="bg-accent text-white hover:bg-accent/90 h-10 font-bold uppercase tracking-wider" data-testid="button-newsletter">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-primary-foreground/40 text-xs">
            © {new Date().getFullYear()} Project Handball. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-primary-foreground/40">
            <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
