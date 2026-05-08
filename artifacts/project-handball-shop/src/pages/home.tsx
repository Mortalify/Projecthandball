import { Link } from "wouter";
import { motion } from "framer-motion";
import { products } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Truck, ShieldCheck } from "lucide-react";
import logoSrc from "@assets/project_handball_logo_1778253221361.png";

export default function Home() {
  const featuredProducts = products.slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[70vh] w-full overflow-hidden bg-primary">
        <div className="absolute inset-0">
          <img
            src="/images/hero.jpg"
            alt="Handball players on outdoor court"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/70 to-primary/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent" />
        </div>

        {/* Floating logo watermark */}
        <div className="absolute top-8 right-8 opacity-10 hidden lg:block">
          <img src={logoSrc} alt="" className="h-48 w-48 object-contain" />
        </div>

        <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center pb-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center gap-3 mb-6"
            >
              <img src={logoSrc} alt="Project Handball Logo" className="h-14 w-14 object-contain" />
              <div className="h-px flex-1 max-w-[80px] bg-accent/50" />
              <span className="text-accent font-bold text-xs uppercase tracking-[0.3em]">Official Store</span>
            </motion.div>

            <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.95] mb-6 tracking-tight uppercase">
              Built for the{" "}
              <span className="text-accent relative">
                Concrete.
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute -bottom-2 left-0 h-1 w-full bg-accent origin-left block"
                />
              </span>
            </h1>
            <p className="text-lg md:text-xl text-white/70 mb-10 max-w-lg leading-relaxed font-medium">
              Premium apparel engineered for the streets. We create quality handball gear for players who leave it all on the court.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-white font-bold text-sm px-8 h-14 rounded-xl uppercase tracking-widest shadow-lg shadow-accent/30" data-testid="button-hero-shop">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/shop?category=Tees">
                <Button variant="outline" size="lg" className="bg-transparent border-white/30 text-white hover:bg-white/10 font-bold text-sm px-8 h-14 rounded-xl uppercase tracking-widest" data-testid="button-hero-tees">
                  View Tees
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom scroll hint */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-white/30"
        >
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
          <span className="text-[10px] uppercase tracking-widest font-medium">Scroll</span>
        </motion.div>
      </section>

      {/* Feature bar */}
      <section className="bg-accent py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-white text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              <span>Free Shipping Over $150</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/30" />
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              <span>Premium Court Quality</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/30" />
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span>Handcrafted with Care</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 md:py-32 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-4">
            <div>
              <p className="text-accent font-bold text-xs uppercase tracking-[0.3em] mb-2">New Arrivals</p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-primary leading-tight"
              >
                Latest Drops
              </motion.h2>
            </div>
            <Link href="/shop" className="group flex items-center gap-2 font-bold uppercase tracking-widest text-sm text-accent hover:text-primary transition-colors">
              View All Gear <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Brand Story — Logo Feature */}
      <section className="py-20 bg-primary overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:w-1/3 flex justify-center shrink-0"
            >
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-accent/20 blur-3xl scale-125" />
                <img src={logoSrc} alt="Project Handball" className="relative h-56 w-56 md:h-72 md:w-72 object-contain drop-shadow-2xl" />
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:w-2/3 text-white"
            >
              <p className="text-accent font-bold text-xs uppercase tracking-[0.3em] mb-4">Our Story</p>
              <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight leading-tight mb-6">
                Repping the Court.<br />
                <span className="text-accent">Always.</span>
              </h2>
              <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl">
                Project Handball was born on the concrete. We saw a culture with no brand to call its own — so we built one. Every piece of gear we make is a rep for the sport, the community, and the grind.
              </p>
              <Link href="/shop">
                <Button className="bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-widest h-12 px-8 rounded-xl" data-testid="button-story-shop">
                  Shop the Collection
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* As Seen On Court */}
      <section className="py-20 bg-background overflow-hidden">
        <div className="container mx-auto px-4 mb-10">
          <p className="text-accent font-bold text-xs uppercase tracking-[0.3em] mb-2 text-center">Community</p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-primary text-center mb-3"
          >
            As Seen On Court
          </motion.h2>
          <p className="text-muted-foreground text-center max-w-md mx-auto font-medium">
            Tag us <span className="text-accent font-bold">@ProjectHandball</span> to be featured.
          </p>
        </div>

        {/* 8-photo community grid */}
        <div className="px-4 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            {[
              { src: "/images/community/rooftop-duo.jpg", alt: "Two players repping PH on the rooftop", tall: true },
              { src: "/images/community/purple-set.jpg", alt: "Player in purple PH set on the court", tall: false },
              { src: "/images/community/supporter-navy.jpg", alt: "Fan in navy Project Handball hoodie", tall: false },
              { src: "/images/community/couple-hoodies.jpg", alt: "Couple in Project Handball hoodies", tall: false },
              { src: "/images/community/got-next-hoodie.jpg", alt: "I Got Next hoodie back shot", tall: false },
              { src: "/images/community/mirror-set.jpg", alt: "Mirror selfie in full PH set", tall: false },
              { src: "/images/community/kids-hoodie.jpg", alt: "Kids wearing Project Handball hoodies", tall: false },
              { src: "/images/community/too-fresh.jpg", alt: "Community member rocking the hoodie", tall: false },
            ].map((photo, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className={`relative group overflow-hidden rounded-2xl bg-muted ${i === 0 ? "row-span-2" : "aspect-square"}`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                  <img src={logoSrc} alt="" className="h-7 w-7 object-contain" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-24 bg-background border-t border-border/50 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <p className="text-accent font-bold text-xs uppercase tracking-[0.3em] mb-3">What The Community Says</p>
            <h2 className="font-display text-4xl md:text-5xl font-black uppercase tracking-tight text-primary">Real People. Real Court.</h2>
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 text-sm font-bold text-muted-foreground">5.0 · 47 reviews</span>
            </div>
          </motion.div>

          {(() => {
            const reviews = [
              { name: "Marcus T.", location: "Brooklyn, NY", initials: "MT", color: "bg-accent", product: "Classic Tee", title: "I swear I play better in this shirt", body: "I know it sounds crazy but putting on this tee before a game genuinely changes my mindset. The fabric is light, doesn't cling when you sweat, and moves with you. Three weeks in, undefeated at Coney Island. Coincidence? I think not." },
              { name: "Denise R.", location: "Queens, NY", initials: "DR", color: "bg-purple-500", product: "Hoodie", title: "Never held a handball in my life but I'm a fan", body: "My boyfriend plays and I wore the hoodie to support him at a tournament. By the end of the day three people asked about the brand and invited me back next weekend. The gear made me feel like I belonged." },
              { name: "Ray V.", location: "The Bronx, NY", initials: "RV", color: "bg-emerald-600", product: "Classic Tee", title: "Brought me right back to '94", body: "I'm 58 years old and haven't played seriously since my 30s. My grandson got me this shirt and when I put it on I felt like I was back on the courts at Orchard Beach. I got out there and hit for two hours. These shirts carry spirit." },
              { name: "Jasmine L.", location: "Harlem, NY", initials: "JL", color: "bg-rose-500", product: "Wallball Warrior Tee", title: "Finally something that doesn't irritate my skin", body: "I have really sensitive skin and most athletic shirts leave me red and itchy by halftime. This tee is incredibly soft — almost feels like wearing nothing. I've washed it a dozen times and it hasn't changed at all." },
              { name: "Big D.", location: "South Bronx, NY", initials: "BD", color: "bg-primary", product: "Hoodie", title: "Finally a hoodie that actually fits right", body: "I'm a bigger dude and most hoodies either squeeze my arms or look like a tent. The 2XL fits perfectly — structured in the shoulders, comfortable through the chest, not tight anywhere. Got three compliments before I even warmed up." },
              { name: "Carla M.", location: "Staten Island, NY", initials: "CM", color: "bg-amber-500", product: "Long Sleeve", title: "The quality is insane for the price", body: "I've bought gear from other handball brands and nothing compares. The embroidery is clean, the fabric is thick without being heavy, and the stitching has held up through months of play. My whole crew has ordered now." },
              { name: "Tony M.", location: "East New York, NY", initials: "TM", color: "bg-sky-600", product: "Handball Shorts", title: "Wore these in a tournament and went deep", body: "Full range of motion — no bunching, no riding up. I've played in a lot of different brands and these are by far the most comfortable for actual play. Light enough that you forget you're wearing them mid-rally." },
            ];

            const ReviewCard = ({ review, idx }: { review: typeof reviews[0]; idx: number }) => (
              <div key={idx} className="flex flex-col bg-card border border-border/50 rounded-2xl p-6 shadow-sm w-[320px] shrink-0">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, s) => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="font-bold text-sm text-primary mb-2">"{review.title}"</p>
                <p className="text-muted-foreground text-sm leading-relaxed flex-grow mb-5">{review.body}</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border/50 mt-auto">
                  <div className={`w-9 h-9 rounded-full ${review.color} flex items-center justify-center shrink-0`}>
                    <span className="text-white text-xs font-black">{review.initials}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-primary leading-none">{review.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{review.location} · <span className="italic">{review.product}</span></p>
                  </div>
                  <div className="ml-auto shrink-0">
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Verified</span>
                  </div>
                </div>
              </div>
            );

            return (
              <div className="relative -mx-4 overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-background to-transparent" />
                <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-background to-transparent" />
                <div className="flex gap-5 w-max animate-marquee hover:[animation-play-state:paused] pb-2">
                  {reviews.map((r, i) => <ReviewCard key={i} review={r} idx={i} />)}
                  {reviews.map((r, i) => <ReviewCard key={`dup-${i}`} review={r} idx={i} />)}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* Value Props */}
      <section className="py-20 bg-muted/50 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Star className="h-6 w-6" />,
                title: "Premium Quality",
                desc: "Built to withstand the toughest concrete courts and the most intense play."
              },
              {
                icon: <Truck className="h-6 w-6" />,
                title: "Free Shipping",
                desc: "On all domestic orders over $150. Use code ACESERVE at checkout."
              },
              {
                icon: <ShieldCheck className="h-6 w-6" />,
                title: "Handcrafted",
                desc: "Every order is made with care by our handball artisans. Worth the wait."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-background border border-border/50 shadow-sm"
              >
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-5 text-accent">
                  {item.icon}
                </div>
                <h3 className="font-display font-black text-lg uppercase tracking-wide mb-3 text-primary">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
