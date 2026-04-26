import { Link } from "wouter";
import { Circle, Instagram, Youtube, Twitter } from "lucide-react";
import { FaTiktok } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Circle className="h-6 w-6 text-accent fill-accent" />
              <span className="font-display font-bold text-xl tracking-tight uppercase">
                Project Handball
              </span>
            </Link>
            <p className="text-secondary/80 text-sm mb-6 max-w-xs">
              We Create Quality Handball Apparel. Built for the concrete courts, designed for the culture.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-secondary hover:text-accent transition-colors" data-testid="link-social-youtube">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary hover:text-accent transition-colors" data-testid="link-social-instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary hover:text-accent transition-colors" data-testid="link-social-tiktok">
                <FaTiktok className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Shop</h3>
            <ul className="space-y-3 text-sm text-secondary/80">
              <li><Link href="/shop" className="hover:text-accent transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=Tees" className="hover:text-accent transition-colors">Tees</Link></li>
              <li><Link href="/shop?category=Outerwear" className="hover:text-accent transition-colors">Outerwear</Link></li>
              <li><Link href="/shop?category=Accessories" className="hover:text-accent transition-colors">Accessories</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-secondary/80">
              <li><a href="#" className="hover:text-accent transition-colors">FAQ</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Shipping & Returns</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Size Guide</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-display font-bold text-lg mb-4">Stay in the loop</h3>
            <p className="text-secondary/80 text-sm mb-4">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
              <Input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-primary-foreground/10 border-primary-foreground/20 text-white placeholder:text-secondary/50 focus-visible:ring-accent"
                data-testid="input-newsletter"
              />
              <Button type="submit" className="bg-accent text-white hover:bg-accent/90" data-testid="button-newsletter">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-secondary/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-secondary/60 text-xs">
            © {new Date().getFullYear()} Project Handball. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-secondary/60">
            <a href="#" className="hover:text-accent">Privacy Policy</a>
            <a href="#" className="hover:text-accent">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
