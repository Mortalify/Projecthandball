import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  LogOut, Trophy, Calendar, ShoppingBag, ChevronRight, Star,
  ShieldCheck, Users, ClipboardList, Lock, Eye, EyeOff,
} from "lucide-react";

interface TournamentReg {
  id: number;
  tournament_id: string;
  name: string;
  email: string;
  partner_name: string | null;
  is_paid_tournament: boolean;
  created_at: string;
}

interface ClinicReg {
  id: number;
  clinic_id: string;
  name: string;
  email: string;
  age: number;
  created_at: string;
}

interface AccountData {
  player: {
    id: number;
    name: string;
    email: string;
    rank: string;
    phone: string | null;
    dateOfBirth: string | null;
    wins: number;
    losses: number;
    memberSince: string;
  };
  tournamentRegistrations: TournamentReg[];
  clinicRegistrations: ClinicReg[];
}

interface AdminUser {
  id: number;
  name: string;
  email: string;
  rank: string;
  wins: number;
  losses: number;
  phone: string | null;
  is_admin: boolean;
  created_at: string;
}

interface AdminData {
  users: AdminUser[];
  tournamentRegistrations: TournamentReg[];
  clinicRegistrations: ClinicReg[];
}

const RANK_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  s:        { label: "S Rank", color: "text-purple-700", bg: "bg-purple-100", border: "border-purple-300" },
  a:        { label: "A Rank", color: "text-yellow-700", bg: "bg-yellow-100", border: "border-yellow-300" },
  b:        { label: "B Rank", color: "text-sky-700",    bg: "bg-sky-100",    border: "border-sky-300" },
  c:        { label: "C Rank", color: "text-orange-700", bg: "bg-orange-100", border: "border-orange-300" },
  unranked: { label: "Unranked", color: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatId(id: string) {
  return id.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

export default function Account() {
  const { player, token, logout, becomeAdmin, isLoading } = useAuth();
  const [, navigate] = useLocation();
  const [data, setData] = useState<AccountData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [tab, setTab] = useState<"overview" | "events" | "shop" | "admin">("overview");

  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [adminFetching, setAdminFetching] = useState(false);
  const [adminSubTab, setAdminSubTab] = useState<"users" | "tournaments" | "clinics">("users");

  const [showPasscode, setShowPasscode] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [passcodeVisible, setPasscodeVisible] = useState(false);
  const [passcodeLoading, setPasscodeLoading] = useState(false);
  const [passcodeError, setPasscodeError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !player) navigate("/login");
  }, [player, isLoading, navigate]);

  useEffect(() => {
    if (!token) return;
    fetch("/api/account/data", { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [token]);

  useEffect(() => {
    if (tab !== "admin" || !token || adminData) return;
    setAdminFetching(true);
    Promise.all([
      fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch("/api/admin/registrations", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([u, r]) => setAdminData({ users: u.users ?? [], tournamentRegistrations: r.tournamentRegistrations ?? [], clinicRegistrations: r.clinicRegistrations ?? [] }))
      .catch(() => {})
      .finally(() => setAdminFetching(false));
  }, [tab, token, adminData]);

  const handleBecomeAdmin = async () => {
    setPasscodeLoading(true);
    setPasscodeError(null);
    try {
      await becomeAdmin(passcode);
      setShowPasscode(false);
      setPasscode("");
      setTab("admin");
    } catch (err: any) {
      setPasscodeError(err.message ?? "Incorrect passcode");
    } finally {
      setPasscodeLoading(false);
    }
  };

  if (isLoading || fetching || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-accent border-t-transparent animate-spin" />
      </div>
    );
  }

  const rank = data?.player.rank ?? player.rank ?? "unranked";
  const meta = RANK_META[rank] ?? RANK_META.unranked;
  const isSRank = rank === "s";
  const isLowRank = rank === "unranked" || rank === "c";
  const isAdmin = player.isAdmin === true;

  const allEvents = [
    ...(data?.tournamentRegistrations ?? []).map(r => ({ type: "tournament" as const, id: r.id, eventId: r.tournament_id, date: r.created_at, detail: r.partner_name ? `w/ ${r.partner_name}` : "Solo", paid: r.is_paid_tournament })),
    ...(data?.clinicRegistrations ?? []).map(r => ({ type: "clinic" as const, id: r.id, eventId: r.clinic_id, date: r.created_at, detail: `Age ${r.age}`, paid: false })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "events", label: "My Events" },
    { key: "shop", label: "Shop Orders" },
    ...(isAdmin ? [{ key: "admin", label: "Admin Dashboard" }] : []),
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-white">
        <div className="container mx-auto px-4 py-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center shrink-0 shadow-lg">
              <span className="text-white text-2xl font-black">{player.name[0]?.toUpperCase()}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display text-3xl font-black uppercase tracking-tight">{player.name}</h1>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/20 text-accent border border-accent/30">
                    <ShieldCheck className="h-3 w-3" /> Admin
                  </span>
                )}
              </div>
              <p className="text-white/60 text-sm mt-0.5">{player.email}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full border ${meta.bg} ${meta.color} ${meta.border}`}>
                  <Trophy className="h-3 w-3" />
                  {meta.label}
                </span>
                {data?.player.wins !== undefined && (
                  <span className="text-xs text-white/50">{data.player.wins}W — {data.player.losses}L</span>
                )}
              </div>
            </div>
            <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="container mx-auto px-4">
          <div className="flex gap-0 border-b border-white/10 overflow-x-auto">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as typeof tab)}
                className={`px-5 py-3 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 -mb-px whitespace-nowrap ${tab === t.key ? "text-accent border-accent" : "text-white/50 border-transparent hover:text-white/80"}`}
              >
                {t.key === "admin" ? (
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t.label}
                  </span>
                ) : t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">

        {/* OVERVIEW TAB */}
        {tab === "overview" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            {isSRank && (
              <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Star className="h-5 w-5 fill-white text-white" />
                  <p className="font-black text-lg uppercase tracking-wide">S Rank Perk — 20% Off Everything</p>
                </div>
                <p className="text-white/80 text-sm">Your discount is automatically applied at checkout on all shop items and tournament entry fees. No code needed.</p>
              </div>
            )}

            {isLowRank && (
              <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                <p className="text-accent font-bold text-xs uppercase tracking-[0.25em] mb-3">Level Up Your Game</p>
                <h2 className="font-display text-xl font-black uppercase tracking-tight text-primary mb-1">Recommended Next Steps</h2>
                <p className="text-muted-foreground text-sm mb-5">
                  {rank === "unranked"
                    ? "You haven't played a ranked match yet. Start with a clinic to sharpen your skills or enter a tournament to get your first rank."
                    : "C rank players who invest in coaching and clinics move up fast. Here's what we recommend:"}
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/clinics" className="flex-1">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors cursor-pointer">
                      <div>
                        <p className="font-bold text-sm text-primary">Book a Clinic</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Youth & Senior sessions available</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-accent shrink-0" />
                    </div>
                  </Link>
                  <Link href="/tournaments" className="flex-1">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer">
                      <div>
                        <p className="font-bold text-sm text-primary">Enter a Tournament</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Get ranked and climb the ladder</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                  </Link>
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground mb-4">Rank Ladder</p>
              <div className="flex gap-2 items-center">
                {["unranked", "c", "b", "a", "s"].map((r, i) => {
                  const m = RANK_META[r];
                  const isCurrentOrPast = ["unranked", "c", "b", "a", "s"].indexOf(rank) >= i;
                  return (
                    <div key={r} className="flex items-center gap-2 flex-1">
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${rank === r ? `${m.bg} ${m.color} ${m.border} scale-110 shadow` : isCurrentOrPast ? `${m.bg} ${m.color} ${m.border} opacity-60` : "bg-muted text-muted-foreground border-border opacity-40"}`}>
                          {r === "unranked" ? "?" : r.toUpperCase()}
                        </div>
                        <span className={`text-[9px] font-bold uppercase ${rank === r ? m.color : "text-muted-foreground"}`}>
                          {r === "unranked" ? "New" : r.toUpperCase()}
                        </span>
                      </div>
                      {i < 4 && <div className="w-4 h-px bg-border shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Tournaments", value: data?.tournamentRegistrations.length ?? 0, icon: <Trophy className="h-4 w-4" /> },
                { label: "Clinics", value: data?.clinicRegistrations.length ?? 0, icon: <Calendar className="h-4 w-4" /> },
                { label: "Wins", value: data?.player.wins ?? 0, icon: <Star className="h-4 w-4" /> },
              ].map((stat, i) => (
                <div key={i} className="rounded-2xl border border-border/60 bg-card p-5 text-center shadow-sm">
                  <div className="flex justify-center mb-2 text-accent">{stat.icon}</div>
                  <p className="font-display text-2xl font-black text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Admin unlock — only shown for non-admins */}
            {!isAdmin && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => setShowPasscode(true)}
                  className="text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors flex items-center gap-1"
                >
                  <Lock className="h-3 w-3" /> Admin access
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* EVENTS TAB */}
        {tab === "events" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            {allEvents.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-bold text-primary">No events yet</p>
                <p className="text-sm text-muted-foreground mt-1 mb-6">Sign up for a tournament or clinic to get started</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/tournaments"><Button variant="outline" size="sm">Tournaments</Button></Link>
                  <Link href="/clinics"><Button size="sm" className="bg-accent hover:bg-accent/90 text-white">Clinics</Button></Link>
                </div>
              </div>
            ) : (
              allEvents.map((event, i) => (
                <motion.div
                  key={`${event.type}-${event.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-5 rounded-2xl border border-border/60 bg-card shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${event.type === "tournament" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                    {event.type === "tournament" ? <Trophy className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-primary truncate">{formatId(event.eventId)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{event.detail} · Registered {formatDate(event.date)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${event.type === "tournament" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"}`}>
                      {event.type === "tournament" ? "Tournament" : "Clinic"}
                    </span>
                    {event.paid && (
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">Paid</span>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}

        {/* SHOP ORDERS TAB */}
        {tab === "shop" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center py-16">
            <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-bold text-primary">Order history coming soon</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">We're building this — check back after your next purchase</p>
            {isSRank && (
              <div className="inline-flex items-center gap-2 text-sm font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-xl px-4 py-2 mb-6">
                <Star className="h-4 w-4 fill-purple-500 text-purple-500" />
                Your 20% S Rank discount is active on all purchases
              </div>
            )}
            <div><Link href="/shop"><Button className="bg-accent hover:bg-accent/90 text-white font-bold">Shop Now</Button></Link></div>
          </motion.div>
        )}

        {/* ADMIN DASHBOARD TAB */}
        {tab === "admin" && isAdmin && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">

            {/* Sub-tab selector */}
            <div className="flex gap-2 flex-wrap">
              {([
                { key: "users", label: "Users", icon: <Users className="h-4 w-4" /> },
                { key: "tournaments", label: "Tournament Registrations", icon: <Trophy className="h-4 w-4" /> },
                { key: "clinics", label: "Clinic Registrations", icon: <ClipboardList className="h-4 w-4" /> },
              ] as const).map(st => (
                <button
                  key={st.key}
                  onClick={() => setAdminSubTab(st.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${adminSubTab === st.key ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {st.icon} {st.label}
                </button>
              ))}
            </div>

            {adminFetching ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 rounded-full border-4 border-accent border-t-transparent animate-spin" />
              </div>
            ) : (
              <>
                {/* USERS */}
                {adminSubTab === "users" && (
                  <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-border/60 flex items-center justify-between">
                      <h3 className="font-display font-black text-lg uppercase tracking-tight text-primary">All Users</h3>
                      <span className="text-sm font-bold text-muted-foreground">{adminData?.users.length ?? 0} total</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            {["Name", "Email", "Rank", "W/L", "Phone", "Joined", ""].map(h => (
                              <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(adminData?.users ?? []).map((u, i) => {
                            const m = RANK_META[u.rank] ?? RANK_META.unranked;
                            return (
                              <tr key={u.id} className={`border-t border-border/40 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                                <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">{u.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                                <td className="px-4 py-3">
                                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${m.bg} ${m.color} ${m.border}`}>
                                    {m.label}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{u.wins}W — {u.losses}L</td>
                                <td className="px-4 py-3 text-muted-foreground">{u.phone ?? "—"}</td>
                                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(u.created_at)}</td>
                                <td className="px-4 py-3">
                                  {u.is_admin && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                                      <ShieldCheck className="h-2.5 w-2.5" /> Admin
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                          {(adminData?.users.length ?? 0) === 0 && (
                            <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">No users yet</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TOURNAMENT REGISTRATIONS */}
                {adminSubTab === "tournaments" && (
                  <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-border/60 flex items-center justify-between">
                      <h3 className="font-display font-black text-lg uppercase tracking-tight text-primary">Tournament Registrations</h3>
                      <span className="text-sm font-bold text-muted-foreground">{adminData?.tournamentRegistrations.length ?? 0} total</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            {["Tournament", "Player", "Email", "Partner", "Paid", "Date"].map(h => (
                              <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(adminData?.tournamentRegistrations ?? []).map((r, i) => (
                            <tr key={r.id} className={`border-t border-border/40 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                              <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">{formatId(r.tournament_id)}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{r.name}</td>
                              <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                              <td className="px-4 py-3 text-muted-foreground">{r.partner_name ?? "—"}</td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.is_paid_tournament ? "text-green-700 bg-green-50 border border-green-200" : "text-muted-foreground bg-muted border border-border"}`}>
                                  {r.is_paid_tournament ? "Paid" : "Free"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(r.created_at)}</td>
                            </tr>
                          ))}
                          {(adminData?.tournamentRegistrations.length ?? 0) === 0 && (
                            <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">No registrations yet</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* CLINIC REGISTRATIONS */}
                {adminSubTab === "clinics" && (
                  <div className="rounded-2xl border border-border/60 bg-card overflow-hidden shadow-sm">
                    <div className="p-5 border-b border-border/60 flex items-center justify-between">
                      <h3 className="font-display font-black text-lg uppercase tracking-tight text-primary">Clinic Registrations</h3>
                      <span className="text-sm font-bold text-muted-foreground">{adminData?.clinicRegistrations.length ?? 0} total</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            {["Clinic", "Name", "Email", "Age", "Date"].map(h => (
                              <th key={h} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(adminData?.clinicRegistrations ?? []).map((r, i) => (
                            <tr key={r.id} className={`border-t border-border/40 ${i % 2 === 0 ? "" : "bg-muted/20"}`}>
                              <td className="px-4 py-3 font-semibold text-primary whitespace-nowrap">{formatId(r.clinic_id)}</td>
                              <td className="px-4 py-3 whitespace-nowrap">{r.name}</td>
                              <td className="px-4 py-3 text-muted-foreground">{r.email}</td>
                              <td className="px-4 py-3 text-muted-foreground">{r.age}</td>
                              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(r.created_at)}</td>
                            </tr>
                          ))}
                          {(adminData?.clinicRegistrations.length ?? 0) === 0 && (
                            <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-sm">No registrations yet</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Admin passcode modal */}
      <AnimatePresence>
        {showPasscode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={e => { if (e.target === e.currentTarget) { setShowPasscode(false); setPasscode(""); setPasscodeError(null); } }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card rounded-2xl border border-border shadow-xl p-8 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-black text-lg uppercase tracking-tight text-primary">Admin Access</h2>
                  <p className="text-xs text-muted-foreground">Enter your admin passcode</p>
                </div>
              </div>

              <div className="relative mb-4">
                <input
                  type={passcodeVisible ? "text" : "password"}
                  value={passcode}
                  onChange={e => { setPasscode(e.target.value); setPasscodeError(null); }}
                  onKeyDown={e => e.key === "Enter" && handleBecomeAdmin()}
                  placeholder="Passcode"
                  className="w-full h-11 px-4 pr-10 rounded-xl border border-border bg-background text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setPasscodeVisible(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {passcodeVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {passcodeError && (
                <p className="text-destructive text-sm font-medium mb-4">{passcodeError}</p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setShowPasscode(false); setPasscode(""); setPasscodeError(null); }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  onClick={handleBecomeAdmin}
                  disabled={passcodeLoading || !passcode}
                >
                  {passcodeLoading ? "Verifying…" : "Unlock"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
