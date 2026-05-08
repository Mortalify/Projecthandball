import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { tournaments, type Tournament } from "@/lib/tournaments";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MapPin, Calendar, Users, Trophy, Crown, Star,
  Shield, User, LogIn, LogOut, Check, X
} from "lucide-react";

// ─── Rank config ────────────────────────────────────────────────────────────
const RANKS = [
  {
    key: "s",
    label: "S Player",
    description: "Won a paid tournament (singles or doubles)",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10 border-yellow-500/30",
    badge: "bg-yellow-500 text-black",
    icon: Crown,
  },
  {
    key: "a",
    label: "A Player",
    description: "Elite competitor",
    color: "text-accent",
    bg: "bg-accent/10 border-accent/30",
    badge: "bg-accent text-white",
    icon: Star,
  },
  {
    key: "b",
    label: "B Player",
    description: "Seasoned player",
    color: "text-green-500",
    bg: "bg-green-500/10 border-green-500/30",
    badge: "bg-green-500 text-white",
    icon: Shield,
  },
  {
    key: "c",
    label: "C Player",
    description: "Up and coming",
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/30",
    badge: "bg-orange-500 text-white",
    icon: User,
  },
  {
    key: "unranked",
    label: "Unranked",
    description: "Just getting started",
    color: "text-muted-foreground",
    bg: "bg-muted/50 border-border",
    badge: "bg-muted text-muted-foreground",
    icon: User,
  },
] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

type LeaderboardPlayer = {
  id: number;
  name: string;
  rank: string;
  wins: number;
  losses: number;
};

// ─── Tournament Card ──────────────────────────────────────────────────────────
function TournamentCard({ tournament, onRegister }: { tournament: Tournament; onRegister: (t: Tournament) => void }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/registrations/${tournament.id}/count`)
      .then(r => r.json())
      .then(d => setCount(d.count ?? 0))
      .catch(() => {});
  }, [tournament.id]);

  const spotsLeft = count !== null ? tournament.maxParticipants - count : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${tournament.isPaid ? "bg-primary text-white" : "bg-accent/10 text-accent border border-accent/30"}`}>
            {tournament.isPaid ? `$${tournament.entryFee} Entry` : "Free"}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-muted text-muted-foreground border border-border">
            {tournament.type === "doubles" ? "Doubles" : "Singles"}
          </span>
          {tournament.isPaid && (
            <span className="relative group inline-flex">
              <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-yellow-500/10 text-yellow-600 border border-yellow-500/30 cursor-help">
                <Crown className="h-3 w-3" /> S Rank Eligible
              </span>
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-72 rounded-xl bg-primary px-4 py-3 text-xs text-white shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 normal-case tracking-normal font-normal leading-relaxed">
                <strong className="block text-yellow-400 font-bold uppercase tracking-wider text-[10px] mb-1">What is S Rank?</strong>
                S Rank is a new tier above A — introduced because the gap in skill among today's top players has grown so wide that A alone no longer captures it. Where A was once the ceiling, S exists to separate the best from the best. Only paid tournament winners earn it.
                <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-primary" />
              </span>
            </span>
          )}
        </div>

        <h3 className="font-display text-xl font-black uppercase tracking-tight text-primary mb-1">{tournament.name}</h3>

        <div className="flex flex-col gap-1.5 mb-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {formatDate(tournament.date)} · {tournament.time}
          </span>
          <span className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {tournament.location}, {tournament.borough}
          </span>
          <span className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5 shrink-0" />
            {spotsLeft !== null ? `${spotsLeft} of ${tournament.maxParticipants} spots remaining` : `${tournament.maxParticipants} max`}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-5">{tournament.description}</p>

        <Button
          onClick={() => onRegister(tournament)}
          className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest h-11"
          disabled={spotsLeft === 0}
        >
          {spotsLeft === 0 ? "Sold Out" : "Register Now"}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Registration Modal ───────────────────────────────────────────────────────
function RegisterModal({ tournament, open, onClose }: { tournament: Tournament | null; open: boolean; onClose: () => void }) {
  const { player } = useAuth();
  const [name, setName] = useState(player?.name ?? "");
  const [email, setEmail] = useState(player?.email ?? "");
  const [phone, setPhone] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(player?.name ?? "");
      setEmail(player?.email ?? "");
      setPhone("");
      setPartnerName("");
      setLoading(false);
      setSuccess(false);
      setError("");
    }
  }, [open, player]);

  if (!tournament) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("ph_token");
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          tournamentId: tournament.id,
          name,
          email,
          phone,
          partnerName: tournament.type === "doubles" ? partnerName : undefined,
          isPaidTournament: tournament.isPaid,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-black uppercase tracking-tight text-primary">
            {success ? "You're Registered!" : `Register — ${tournament.name}`}
          </DialogTitle>
          {!success && (
            <DialogDescription>
              {tournament.isPaid
                ? `$${tournament.entryFee} entry fee collected at check-in. ${tournament.type === "doubles" ? "Include your partner's name below." : ""}`
                : `Free entry. ${tournament.type === "doubles" ? "Include your partner's name below." : ""}`}
            </DialogDescription>
          )}
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-500" />
            </div>
            <p className="font-bold text-primary mb-1">See you on the court!</p>
            <p className="text-sm text-muted-foreground mb-6">
              {tournament.isPaid
                ? `Have your $${tournament.entryFee} ready at check-in. We'll see you ${formatDate(tournament.date)}.`
                : `We've got you down. See you ${formatDate(tournament.date)} at ${tournament.location}.`}
            </p>
            <Button onClick={onClose} className="bg-primary text-white font-bold uppercase tracking-widest">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="reg-name" className="text-xs font-bold uppercase tracking-wider">Full Name</Label>
              <Input id="reg-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-email" className="text-xs font-bold uppercase tracking-wider">Email</Label>
              <Input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reg-phone" className="text-xs font-bold uppercase tracking-wider">Phone Number</Label>
              <Input id="reg-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 555-5555" required />
            </div>
            {tournament.type === "doubles" && (
              <div className="space-y-1.5">
                <Label htmlFor="reg-partner" className="text-xs font-bold uppercase tracking-wider">Partner's Name</Label>
                <Input id="reg-partner" value={partnerName} onChange={e => setPartnerName(e.target.value)} placeholder="Your partner's full name" required />
              </div>
            )}
            {tournament.isPaid && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 text-sm text-yellow-700">
                <strong>${tournament.entryFee} entry fee</strong> will be collected at check-in on the day of the tournament.
              </div>
            )}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-600 flex items-center gap-2">
                <X className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest h-11">
              {loading ? "Registering..." : "Confirm Registration"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Auth Modal ───────────────────────────────────────────────────────────────
function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => { setName(""); setEmail(""); setPassword(""); setConfirm(""); setError(""); };
  const switchMode = (m: "login" | "signup") => { setMode(m); reset(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "signup" && password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-black uppercase tracking-tight text-primary">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "login" ? "Log in to your player account." : "Sign up to track your rank and tournament history."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex rounded-xl border border-border overflow-hidden mb-2">
          {(["login", "signup"] as const).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${mode === m ? "bg-primary text-white" : "bg-background text-muted-foreground hover:text-primary"}`}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider">Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider">Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider">Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {mode === "signup" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase tracking-wider">Confirm Password</Label>
              <Input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="••••••••" required />
            </div>
          )}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-600 flex items-center gap-2">
              <X className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
          <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest h-11">
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Leaderboard ─────────────────────────────────────────────────────────────
function Leaderboard() {
  const { player, logout } = useAuth();
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then(r => r.json())
      .then(d => setPlayers(d.players ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const groupedByRank = RANKS.map(rank => ({
    ...rank,
    players: players.filter(p => p.rank === rank.key),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-black uppercase tracking-tight text-primary">Leaderboards</h2>
          <p className="text-sm text-muted-foreground mt-1">Ranked by tournament performance</p>
        </div>
        {player ? (
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold text-primary">{player.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {player.rank === "unranked" ? "Unranked" : `${player.rank.toUpperCase()} Player`}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="gap-2">
              <LogOut className="h-3.5 w-3.5" /> Log out
            </Button>
          </div>
        ) : (
          <Button onClick={() => setAuthOpen(true)} className="bg-primary text-white font-bold uppercase tracking-widest gap-2">
            <LogIn className="h-4 w-4" /> Log In / Sign Up
          </Button>
        )}
      </div>

      {!player && (
        <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5 mb-8 text-sm text-muted-foreground flex items-start gap-3">
          <Trophy className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-foreground mb-1">Claim your spot on the board</p>
            <p>Create a free account to appear on the leaderboard, track your wins, and build your rank. Winning paid tournaments earns you S Player status.</p>
          </div>
        </div>
      )}

      {/* Rank legend */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-8">
        {RANKS.map(rank => {
          const Icon = rank.icon;
          return (
            <div key={rank.key} className={`rounded-xl border p-3 ${rank.bg}`}>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`h-3.5 w-3.5 ${rank.color}`} />
                <span className={`text-xs font-black uppercase tracking-wider ${rank.color}`}>{rank.label}</span>
              </div>
              <p className="text-xs text-muted-foreground leading-tight">{rank.description}</p>
            </div>
          );
        })}
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Loading leaderboard...</div>
      ) : players.length === 0 ? (
        <div className="py-16 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="font-bold text-primary mb-2">No players yet</p>
          <p className="text-sm text-muted-foreground">Be the first to create an account and claim your spot.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByRank.filter(g => g.players.length > 0).map(group => {
            const Icon = group.icon;
            return (
              <div key={group.key} className={`rounded-2xl border overflow-hidden ${group.bg}`}>
                <div className={`flex items-center gap-2 px-5 py-3 border-b ${group.bg}`}>
                  <Icon className={`h-4 w-4 ${group.color}`} />
                  <h3 className={`font-black uppercase tracking-wider text-sm ${group.color}`}>{group.label}</h3>
                  <span className="ml-auto text-xs text-muted-foreground">{group.players.length} player{group.players.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="divide-y divide-border/50">
                  {group.players.map((p, i) => (
                    <div key={p.id} className={`flex items-center gap-4 px-5 py-3 bg-background/60 ${p.id === player?.id ? "ring-1 ring-inset ring-accent/30" : ""}`}>
                      <span className="text-sm font-bold text-muted-foreground w-6 text-center">{i + 1}</span>
                      <div className="flex-grow">
                        <span className="font-bold text-primary text-sm">{p.name}</span>
                        {p.id === player?.id && <span className="ml-2 text-xs text-accent font-bold">(you)</span>}
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <span className="font-bold text-foreground">{p.wins}W</span> · <span>{p.losses}L</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function TournamentsPage() {
  const [registerTarget, setRegisterTarget] = useState<Tournament | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);

  const openRegister = (t: Tournament) => { setRegisterTarget(t); setRegisterOpen(true); };
  const closeRegister = () => setRegisterOpen(false);

  const upcomingTournaments = tournaments.filter(t => t.status === "upcoming");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-14 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-accent font-bold text-xs uppercase tracking-[0.3em] mb-2">Project Handball</p>
            <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tight mb-4">Tournaments</h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl">
              Compete, rank up, and rep the culture. All upcoming events are hosted by Project Handball. Sign up and show what you've got.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tabs */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-10 h-12 p-1 bg-muted rounded-xl">
            <TabsTrigger value="upcoming" className="h-10 px-8 font-bold uppercase tracking-wider text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              Upcoming Tournaments
            </TabsTrigger>
            <TabsTrigger value="leaderboards" className="h-10 px-8 font-bold uppercase tracking-wider text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              Leaderboards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {upcomingTournaments.length === 0 ? (
              <div className="py-20 text-center">
                <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-bold text-primary mb-2">No upcoming tournaments</p>
                <p className="text-sm text-muted-foreground">Check back soon — we host events regularly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                  {upcomingTournaments.map(t => (
                    <TournamentCard key={t.id} tournament={t} onRegister={openRegister} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="leaderboards">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </div>

      <RegisterModal tournament={registerTarget} open={registerOpen} onClose={closeRegister} />
    </div>
  );
}
