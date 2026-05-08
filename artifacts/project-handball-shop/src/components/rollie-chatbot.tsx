import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logoSrc from "@assets/project_handball_logo_1778253221361.png";

interface Message {
  id: string;
  from: "rollie" | "user";
  text: string;
}

const ROLLIE_RESPONSES: { keywords: string[]; reply: string }[] = [
  {
    keywords: ["size", "sizing", "fit", "measurements", "small", "medium", "large"],
    reply: "Our gear runs true to size! For a relaxed court fit, size up one. Tees and long sleeves run S–2XL. If you're between sizes, I'd recommend going up. Check our Size Guide in the footer for exact measurements.",
  },
  {
    keywords: ["shipping", "delivery", "ship", "how long", "arrive", "when"],
    reply: "All orders are handcrafted with care — please allow up to 30 days for delivery. Orders over $150 ship free with code SHIRT. We ship domestically and are working on international shipping.",
  },
  {
    keywords: ["return", "refund", "exchange", "wrong size"],
    reply: "We want you to love your gear! Contact us within 30 days of delivery for exchanges. Items must be unworn and unwashed. Reach out via Instagram @ProjectHandball and we'll sort it out.",
  },
  {
    keywords: ["discount", "promo", "code", "coupon", "free"],
    reply: "You're in luck — use code SHIRT at checkout for free shipping on orders over $150! Follow us on Instagram and TikTok @ProjectHandball to catch future drops and giveaways.",
  },
  {
    keywords: ["hoodie", "sweatshirt", "pullover"],
    reply: "The Project Handball Hoodie ($65) is our most popular piece. Heavyweight navy fleece, embroidered logo, deep hood — built for cold nights on the court. Only a few left!",
  },
  {
    keywords: ["tee", "shirt", "t-shirt", "classic", "warrior"],
    reply: "We've got two fire tees right now: the Classic Tee ($35) in navy with the logo, and the Wallball Warrior Tee ($35) in white with a dynamic action graphic. Both are premium cotton, built to breathe on the court.",
  },
  {
    keywords: ["cap", "hat", "snapback"],
    reply: "The Project Handball Cap ($30) is a classic navy snapback with electric blue accents. One size fits all. Fresh piece for before and after the game.",
  },
  {
    keywords: ["shorts", "pants", "bottoms"],
    reply: "The Handball Shorts ($45) are built for max mobility — secure pockets, moisture-wicking fabric. Perfect for serious court time.",
  },
  {
    keywords: ["wallball", "handball", "sport", "game", "play", "court"],
    reply: "Wallball handball is the real deal — just you, a wall, and a rubber ball. No net, no racket, pure skill. Project Handball exists to rep the culture and keep it growing. What wall is your home court?",
  },
  {
    keywords: ["order", "status", "tracking", "track"],
    reply: "To check your order status, reach out to us on Instagram @ProjectHandball with your name and email. We're a small team and respond fast. Remember — all orders can take up to 30 days to ship.",
  },
  {
    keywords: ["hello", "hi", "hey", "sup", "what's up", "hola"],
    reply: "Yo! What's good? I'm Rollie, your Project Handball assistant. Ask me anything — sizing, shipping, products, or the sport itself. I'm here for you.",
  },
  {
    keywords: ["who", "rollie", "bot", "ai", "assistant"],
    reply: "I'm Rollie — Project Handball's virtual assistant. Named after the rubber handball we all love. Ask me about our gear, sizing, shipping, or anything handball. Let's talk!",
  },
  {
    keywords: ["contact", "reach", "social", "instagram", "tiktok", "youtube"],
    reply: "Find us everywhere: @ProjectHandball on Instagram, TikTok, and YouTube. Slide into our DMs for anything. We're always watching the court.",
  },
];

const FALLBACK_REPLIES = [
  "Good question! For anything specific, hit us up on Instagram @ProjectHandball — the team is always around.",
  "I'm still learning the ropes! Try asking about sizing, shipping, products, or wallball handball.",
  "Hmm, not sure about that one. DM us @ProjectHandball on Instagram and a real human will get you sorted.",
];

function getRollieReply(input: string): string {
  const lower = input.toLowerCase();
  for (const response of ROLLIE_RESPONSES) {
    if (response.keywords.some(kw => lower.includes(kw))) {
      return response.reply;
    }
  }
  return FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome",
    from: "rollie",
    text: "Yo! I'm Rollie, your Project Handball assistant. Ask me about sizing, shipping, products, or wallball handball. What's good?",
  },
];

export function RollieChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setHasNewMessage(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [open, messages]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;

    const userMsg: Message = { id: `u-${Date.now()}`, from: "user", text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getRollieReply(text);
      setMessages(prev => [...prev, { id: `r-${Date.now()}`, from: "rollie", text: reply }]);
      setIsTyping(false);
      if (!open) setHasNewMessage(true);
    }, 900 + Math.random() * 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="w-[340px] rounded-2xl shadow-2xl border border-border overflow-hidden bg-background flex flex-col"
            style={{ maxHeight: "480px" }}
          >
            <div className="bg-primary px-4 py-3 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={logoSrc} alt="Rollie" className="h-9 w-9 object-contain rounded-full bg-white/10 p-0.5" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-primary" />
                </div>
                <div>
                  <p className="font-display font-black text-white text-sm uppercase tracking-wide">Rollie</p>
                  <p className="text-white/50 text-[10px] font-medium">Project Handball Assistant</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/50 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10" data-testid="button-close-rollie">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.from === "rollie" && (
                    <img src={logoSrc} alt="Rollie" className="h-6 w-6 object-contain rounded-full bg-primary/10 p-0.5 mr-2 shrink-0 self-end mb-0.5" />
                  )}
                  <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.from === "user"
                      ? "bg-accent text-white rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-end gap-2">
                  <img src={logoSrc} alt="Rollie" className="h-6 w-6 object-contain rounded-full bg-primary/10 p-0.5 shrink-0" />
                  <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                        animate={{ y: [0, -4, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <div className="p-3 border-t border-border shrink-0">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Rollie anything..."
                  className="flex-1 h-10 text-sm rounded-xl bg-muted border-0 focus-visible:ring-accent"
                  data-testid="input-rollie-message"
                />
                <Button
                  onClick={sendMessage}
                  size="icon"
                  className="h-10 w-10 rounded-xl bg-accent hover:bg-accent/90 shrink-0"
                  disabled={!input.trim()}
                  data-testid="button-rollie-send"
                >
                  <Send className="h-4 w-4 text-white" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-14 h-14 rounded-full bg-primary shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors border-2 border-accent/30"
        data-testid="button-open-rollie"
        aria-label="Chat with Rollie"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6 text-white" />
            </motion.div>
          ) : (
            <motion.div key="logo" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <img src={logoSrc} alt="Chat with Rollie" className="h-8 w-8 object-contain" />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {hasNewMessage && !open && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-white text-[9px] font-bold flex items-center justify-center shadow"
            >
              1
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
