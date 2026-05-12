import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import {
  LogOut, Trophy, Calendar, ShoppingBag, ChevronRight, Star,
  ShieldCheck, Users, ClipboardList, Lock, Eye, EyeOff, KeyRound, CheckCircle2,
  Plus, Pencil, Trash2, Settings,
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

interface ResetRequest {
  id: number;
  email: string;
  name: string;
  status: "pending" | "resolved";
  created_at: string;
}

interface AdminData {
  users: AdminUser[];
  tournamentRegistrations: TournamentReg[];
  clinicRegistrations: ClinicReg[];
  resetRequests: ResetRequest[];
}

interface TournamentEvent {
  id: number;
  slug: string;
  name: string;
  date: string;
  time: string;
  location: string;
  borough: string;
  type: string;
  is_paid: boolean;
  entry_fee: number;
  description: string;
  max_participants: number;
  status: string;
}

interface ClinicEvent {
  id: number;
  slug: string;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  borough: string;
  age_group: string;
  description: string;
  max_participants: number;
  status: string;
}

const BLANK_TOURNAMENT: Omit<TournamentEvent, "id" | "slug"> = {
  name: "", date: "", time: "", location: "", borough: "",
  type: "singles", is_paid: false, entry_fee: 0, description: "",
  max_participants: 32, status: "upcoming",
};

const BLANK_CLINIC: Omit<ClinicEvent, "id" | "slug"> = {
  name: "", date: "", start_time: "", end_time: "", location: "", borough: "",
  age_group: "youth", description: "", max_participants: 24, status: "upcoming",
};

const ADMIN_ALLOWED_EMAILS = ["shianrdenton@gmail.com", "victoriousparks@gmail.com"];

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
  const [adminSubTab, setAdminSubTab] = useState<"users" | "tournaments" | "clinics" | "resets" | "manage-tournaments" | "manage-clinics">("users");

  // Event management state
  const [tournamentEvents, setTournamentEvents] = useState<TournamentEvent[]>([]);
  const [clinicEvents, setClinicEvents] = useState<ClinicEvent[]>([]);
  const [eventsFetching, setEventsFetching] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Partial<TournamentEvent> | null>(null);
  const [editingClinic, setEditingClinic] = useState<Partial<ClinicEvent> | null>(null);
  const [eventSaving, setEventSaving] = useState(false);
  const [eventError, setEventError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "tournament" | "clinic"; id: number; name: string } | null>(null);

  const [resetTarget, setResetTarget] = useState<ResetRequest | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<number | null>(null);

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
      fetch("/api/admin/reset-requests", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([u, r, rr]) => setAdminData({
        users: u.users ?? [],
        tournamentRegistrations: r.tournamentRegistrations ?? [],
        clinicRegistrations: r.clinicRegistrations ?? [],
        resetRequests: rr.requests ?? [],
      }))
      .catch(() => {})
      .finally(() => setAdminFetching(false));
  }, [tab, token, adminData]);

  const fetchEvents = async () => {
    if (!token) return;
    setEventsFetching(true);
    try {
      const [tr, cr] = await Promise.all([
        fetch("/api/admin/manage-tournaments", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch("/api/admin/manage-clinics", { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      setTournamentEvents(tr.tournaments ?? []);
      setClinicEvents(cr.clinics ?? []);
    } catch {}
    finally { setEventsFetching(false); }
  };

  useEffect(() => {
    if ((adminSubTab === "manage-tournaments" || adminSubTab === "manage-clinics") && token) {
      fetchEvents();
    }
  }, [adminSubTab, token]);

  const saveTournament = async () => {
    if (!token || !editingTournament) return;
    setEventSaving(true); setEventError(null);
    const isNew = !editingTournament.id;
    try {
      const res = await fetch("/api/admin/manage-tournaments", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...editingTournament,
          isPaid: editingTournament.is_paid,
          entryFee: editingTournament.entry_fee,
          maxParticipants: editingTournament.max_participants,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setEditingTournament(null);
      await fetchEvents();
    } catch (err: any) {
      setEventError(err.message ?? "Failed to save");
    } finally { setEventSaving(false); }
  };

  const deleteTournament = async (id: number) => {
    if (!token) return;
    setEventSaving(true); setEventError(null);
    try {
      const res = await fetch("/api/admin/manage-tournaments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteConfirm(null);
      await fetchEvents();
    } catch (err: any) {
      setEventError(err.message ?? "Failed to delete");
    } finally { setEventSaving(false); }
  };

  const saveClinic = async () => {
    if (!token || !editingClinic) return;
    setEventSaving(true); setEventError(null);
    const isNew = !editingClinic.id;
    try {
      const res = await fetch("/api/admin/manage-clinics", {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          ...editingClinic,
          startTime: editingClinic.start_time,
          endTime: editingClinic.end_time,
          ageGroup: editingClinic.age_group,
          maxParticipants: editingClinic.max_participants,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setEditingClinic(null);
      await fetchEvents();
    } catch (err: any) {
      setEventError(err.message ?? "Failed to save");
    } finally { setEventSaving(false); }
  };

  const deleteClinic = async (id: number) => {
    if (!token) return;
    setEventSaving(true); setEventError(null);
    try {
      const res = await fetch("/api/admin/manage-clinics", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      setDeleteConfirm(null);
      await fetchEvents();
    } catch (err: any) {
      setEventError(err.message ?? "Failed to delete");
    } finally { setEventSaving(false); }
  };

  const handleResetPassword = async () => {
    if (!resetTarget || !token) return;
    setResetLoading(true);
    setResetError(null);
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestId: resetTarget.id, email: resetTarget.email, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setResetSuccess(resetTarget.id);
      setAdminData(prev => prev ? {
        ...prev,
        resetRequests: prev.resetRequests.map(r => r.id === resetTarget.id ? { ...r, status: "resolved" as const } : r),
      } : prev);
      setResetTarget(null);
      setNewPassword("");
    } catch (err: any) {
      setResetError(err.message ?? "Failed to reset password");
    } finally {
      setResetLoading(false);
    }
  };

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
          <div className="flex gap-0 border-b border-white/10">
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

            {/* Admin unlock — only shown for the two authorised emails */}
            {!isAdmin && ADMIN_ALLOWED_EMAILS.includes(player.email?.toLowerCase() ?? "") && (
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

            {/* Admin header bar */}
            <div className="rounded-2xl bg-zinc-900 border border-zinc-700 px-6 py-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="h-4 w-4 text-zinc-300" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Control Panel</p>
                <p className="text-sm font-bold text-white">Project Handball Admin</p>
              </div>
            </div>

            {/* Sub-tab selector */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "users" as const, label: "Users", icon: <Users className="h-4 w-4" /> },
                { key: "tournaments" as const, label: "Tournament Regs", icon: <Trophy className="h-4 w-4" /> },
                { key: "clinics" as const, label: "Clinic Regs", icon: <ClipboardList className="h-4 w-4" /> },
                { key: "resets" as const, label: "Password Resets", icon: <KeyRound className="h-4 w-4" />, badge: (adminData?.resetRequests ?? []).filter(r => r.status === "pending").length },
                { key: "manage-tournaments" as const, label: "Manage Tournaments", icon: <Settings className="h-4 w-4" /> },
                { key: "manage-clinics" as const, label: "Manage Clinics", icon: <Settings className="h-4 w-4" /> },
              ].map(st => (
                <button
                  key={st.key}
                  onClick={() => setAdminSubTab(st.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all border ${adminSubTab === st.key ? "bg-zinc-900 text-white border-zinc-600 shadow-sm" : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900"}`}
                >
                  {st.icon} {st.label}
                  {"badge" in st && (st.badge ?? 0) > 0 && (
                    <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-black rounded-full bg-red-500 text-white">{st.badge}</span>
                  )}
                </button>
              ))}
            </div>

            {adminFetching ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-8 w-8 rounded-full border-4 border-zinc-300 border-t-zinc-900 animate-spin" />
              </div>
            ) : (
              <>
                {/* USERS */}
                {adminSubTab === "users" && (
                  <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                      <h3 className="font-display font-black text-base uppercase tracking-tight text-zinc-900">All Users</h3>
                      <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">{adminData?.users.length ?? 0} total</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-100">
                          <tr>
                            {["Name", "Email", "Rank", "W/L", "Phone", "Joined", ""].map(h => (
                              <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap">{h}</th>
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
                  <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                      <h3 className="font-display font-black text-base uppercase tracking-tight text-zinc-900">Tournament Registrations</h3>
                      <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">{adminData?.tournamentRegistrations.length ?? 0} total</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-100">
                          <tr>
                            {["Tournament", "Player", "Email", "Partner", "Paid", "Date"].map(h => (
                              <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(adminData?.tournamentRegistrations ?? []).map((r, i) => (
                            <tr key={r.id} className={`border-t border-zinc-100 ${i % 2 === 0 ? "" : "bg-zinc-50/60"}`}>
                              <td className="px-4 py-3 font-semibold text-zinc-900 whitespace-nowrap">{formatId(r.tournament_id)}</td>
                              <td className="px-4 py-3 text-zinc-700 whitespace-nowrap">{r.name}</td>
                              <td className="px-4 py-3 text-zinc-500">{r.email}</td>
                              <td className="px-4 py-3 text-zinc-500">{r.partner_name ?? "—"}</td>
                              <td className="px-4 py-3">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${r.is_paid_tournament ? "text-green-700 bg-green-50 border border-green-200" : "text-zinc-500 bg-zinc-100 border border-zinc-200"}`}>
                                  {r.is_paid_tournament ? "Paid" : "Free"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{formatDate(r.created_at)}</td>
                            </tr>
                          ))}
                          {(adminData?.tournamentRegistrations.length ?? 0) === 0 && (
                            <tr><td colSpan={6} className="px-4 py-10 text-center text-zinc-400 text-sm">No registrations yet</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* CLINIC REGISTRATIONS */}
                {adminSubTab === "clinics" && (
                  <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                    <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50 flex items-center justify-between">
                      <h3 className="font-display font-black text-base uppercase tracking-tight text-zinc-900">Clinic Registrations</h3>
                      <span className="text-xs font-bold text-zinc-400 bg-zinc-100 px-2.5 py-1 rounded-full">{adminData?.clinicRegistrations.length ?? 0} total</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-100">
                          <tr>
                            {["Clinic", "Name", "Email", "Age", "Date"].map(h => (
                              <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(adminData?.clinicRegistrations ?? []).map((r, i) => (
                            <tr key={r.id} className={`border-t border-zinc-100 ${i % 2 === 0 ? "" : "bg-zinc-50/60"}`}>
                              <td className="px-4 py-3 font-semibold text-zinc-900 whitespace-nowrap">{formatId(r.clinic_id)}</td>
                              <td className="px-4 py-3 text-zinc-700 whitespace-nowrap">{r.name}</td>
                              <td className="px-4 py-3 text-zinc-500">{r.email}</td>
                              <td className="px-4 py-3 text-zinc-500">{r.age}</td>
                              <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{formatDate(r.created_at)}</td>
                            </tr>
                          ))}
                          {(adminData?.clinicRegistrations.length ?? 0) === 0 && (
                            <tr><td colSpan={5} className="px-4 py-10 text-center text-zinc-400 text-sm">No registrations yet</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* PASSWORD RESET REQUESTS */}
                {adminSubTab === "resets" && (
                  <div className="flex flex-col gap-3">
                    {(adminData?.resetRequests.length ?? 0) === 0 ? (
                      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
                        <KeyRound className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
                        <p className="font-bold text-zinc-900">No reset requests</p>
                        <p className="text-sm text-zinc-400 mt-1">Password reset requests from users will appear here</p>
                      </div>
                    ) : (
                      (adminData?.resetRequests ?? []).map(r => (
                        <div key={r.id} className={`rounded-2xl border p-5 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4 ${r.status === "pending" ? "border-orange-200 bg-orange-50/40" : "border-zinc-200 bg-white"}`}>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-bold text-sm text-zinc-900">{r.name}</p>
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${r.status === "pending" ? "bg-orange-100 text-orange-700 border border-orange-200" : "bg-green-100 text-green-700 border border-green-200"}`}>
                                {r.status === "pending" ? "Pending" : "Resolved"}
                              </span>
                              {resetSuccess === r.id && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600">
                                  <CheckCircle2 className="h-3 w-3" /> Done
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-zinc-500">{r.email}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">Requested {formatDate(r.created_at)}</p>
                          </div>
                          {r.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => { setResetTarget(r); setNewPassword(""); setResetError(null); }}
                              className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold shrink-0"
                            >
                              Reset Password
                            </Button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* MANAGE TOURNAMENTS */}
                {adminSubTab === "manage-tournaments" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-black text-lg uppercase tracking-tight text-zinc-900">Manage Tournaments</h3>
                        <p className="text-sm text-zinc-500 mt-0.5">{tournamentEvents.length} event{tournamentEvents.length !== 1 ? "s" : ""}</p>
                      </div>
                      <Button
                        onClick={() => { setEventError(null); setEditingTournament({ ...BLANK_TOURNAMENT }); }}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold gap-2"
                      >
                        <Plus className="h-4 w-4" /> Add Tournament
                      </Button>
                    </div>

                    {eventsFetching ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 rounded-full border-4 border-zinc-300 border-t-zinc-900 animate-spin" />
                      </div>
                    ) : tournamentEvents.length === 0 ? (
                      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
                        <Trophy className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
                        <p className="font-bold text-zinc-900">No tournaments yet</p>
                        <p className="text-sm text-zinc-400 mt-1">Click "Add Tournament" to create the first one.</p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-zinc-50 border-b border-zinc-100">
                              <tr>
                                {["Name", "Date", "Type", "Entry", "Location", "Status", ""].map(h => (
                                  <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tournamentEvents.map((t, i) => (
                                <tr key={t.id} className={`border-t border-zinc-100 ${i % 2 === 0 ? "" : "bg-zinc-50/60"}`}>
                                  <td className="px-4 py-3 font-semibold text-zinc-900 whitespace-nowrap">{t.name}</td>
                                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{t.date}</td>
                                  <td className="px-4 py-3 text-zinc-500 capitalize">{t.type}</td>
                                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">
                                    {t.is_paid ? `$${t.entry_fee}` : "Free"}
                                  </td>
                                  <td className="px-4 py-3 text-zinc-500">{t.location}</td>
                                  <td className="px-4 py-3">
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${t.status === "upcoming" ? "bg-green-100 text-green-700 border border-green-200" : "bg-zinc-100 text-zinc-500 border border-zinc-200"}`}>
                                      {t.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => { setEventError(null); setEditingTournament({ ...t }); }}
                                        className="text-zinc-400 hover:text-zinc-900 transition-colors"
                                        title="Edit"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm({ type: "tournament", id: t.id, name: t.name })}
                                        className="text-zinc-400 hover:text-red-500 transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Tournament edit form */}
                    {editingTournament && (
                      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 py-8 overflow-y-auto">
                        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl p-8 w-full max-w-lg my-auto">
                          <h2 className="font-display font-black text-xl uppercase tracking-tight text-zinc-900 mb-6">
                            {editingTournament.id ? "Edit Tournament" : "New Tournament"}
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { label: "Name", field: "name", type: "text", colSpan: 2 },
                              { label: "Date", field: "date", type: "date" },
                              { label: "Time (e.g. 10:00 AM)", field: "time", type: "text" },
                              { label: "Location", field: "location", type: "text" },
                              { label: "Borough", field: "borough", type: "text" },
                              { label: "Max Participants", field: "max_participants", type: "number" },
                              { label: "Entry Fee ($)", field: "entry_fee", type: "number" },
                            ].map(({ label, field, type, colSpan }) => (
                              <div key={field} className={colSpan === 2 ? "sm:col-span-2" : ""}>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">{label}</label>
                                <input
                                  type={type}
                                  value={(editingTournament as any)[field] ?? ""}
                                  onChange={e => setEditingTournament(prev => ({ ...prev!, [field]: type === "number" ? Number(e.target.value) : e.target.value }))}
                                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-colors"
                                />
                              </div>
                            ))}
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">Type</label>
                              <select
                                value={editingTournament.type ?? "singles"}
                                onChange={e => setEditingTournament(prev => ({ ...prev!, type: e.target.value }))}
                                className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                              >
                                <option value="singles">Singles</option>
                                <option value="doubles">Doubles</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">Status</label>
                              <select
                                value={editingTournament.status ?? "upcoming"}
                                onChange={e => setEditingTournament(prev => ({ ...prev!, status: e.target.value }))}
                                className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                              >
                                <option value="upcoming">Upcoming</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2 flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="t-is-paid"
                                checked={!!editingTournament.is_paid}
                                onChange={e => setEditingTournament(prev => ({ ...prev!, is_paid: e.target.checked }))}
                                className="h-4 w-4 accent-zinc-900"
                              />
                              <label htmlFor="t-is-paid" className="text-sm font-semibold text-zinc-700">Paid tournament</label>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">Description</label>
                              <textarea
                                rows={3}
                                value={editingTournament.description ?? ""}
                                onChange={e => setEditingTournament(prev => ({ ...prev!, description: e.target.value }))}
                                className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-colors resize-none"
                              />
                            </div>
                          </div>
                          {eventError && <p className="text-sm text-red-600 mt-3 font-medium">{eventError}</p>}
                          <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1 border-zinc-200 text-zinc-700 hover:bg-zinc-50" onClick={() => { setEditingTournament(null); setEventError(null); }}>Cancel</Button>
                            <Button disabled={eventSaving} onClick={saveTournament} className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold">
                              {eventSaving ? "Saving..." : "Save Tournament"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* MANAGE CLINICS */}
                {adminSubTab === "manage-clinics" && (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display font-black text-lg uppercase tracking-tight text-zinc-900">Manage Clinics</h3>
                        <p className="text-sm text-zinc-500 mt-0.5">{clinicEvents.length} event{clinicEvents.length !== 1 ? "s" : ""}</p>
                      </div>
                      <Button
                        onClick={() => { setEventError(null); setEditingClinic({ ...BLANK_CLINIC }); }}
                        className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold gap-2"
                      >
                        <Plus className="h-4 w-4" /> Add Clinic
                      </Button>
                    </div>

                    {eventsFetching ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="h-8 w-8 rounded-full border-4 border-zinc-300 border-t-zinc-900 animate-spin" />
                      </div>
                    ) : clinicEvents.length === 0 ? (
                      <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
                        <Calendar className="h-8 w-8 text-zinc-300 mx-auto mb-3" />
                        <p className="font-bold text-zinc-900">No clinics yet</p>
                        <p className="text-sm text-zinc-400 mt-1">Click "Add Clinic" to create the first one.</p>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-zinc-50 border-b border-zinc-100">
                              <tr>
                                {["Name", "Date", "Time", "Group", "Location", "Status", ""].map(h => (
                                  <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {clinicEvents.map((c, i) => (
                                <tr key={c.id} className={`border-t border-zinc-100 ${i % 2 === 0 ? "" : "bg-zinc-50/60"}`}>
                                  <td className="px-4 py-3 font-semibold text-zinc-900 whitespace-nowrap">{c.name}</td>
                                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{c.date}</td>
                                  <td className="px-4 py-3 text-zinc-500 whitespace-nowrap">{c.start_time}–{c.end_time}</td>
                                  <td className="px-4 py-3 text-zinc-500 capitalize">{c.age_group}</td>
                                  <td className="px-4 py-3 text-zinc-500">{c.location}</td>
                                  <td className="px-4 py-3">
                                    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${c.status === "upcoming" ? "bg-green-100 text-green-700 border border-green-200" : "bg-zinc-100 text-zinc-500 border border-zinc-200"}`}>
                                      {c.status}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => { setEventError(null); setEditingClinic({ ...c }); }}
                                        className="text-zinc-400 hover:text-zinc-900 transition-colors"
                                        title="Edit"
                                      >
                                        <Pencil className="h-4 w-4" />
                                      </button>
                                      <button
                                        onClick={() => setDeleteConfirm({ type: "clinic", id: c.id, name: c.name })}
                                        className="text-zinc-400 hover:text-red-500 transition-colors"
                                        title="Delete"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Clinic edit form */}
                    {editingClinic && (
                      <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 px-4 py-8 overflow-y-auto">
                        <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl p-8 w-full max-w-lg my-auto">
                          <h2 className="font-display font-black text-xl uppercase tracking-tight text-zinc-900 mb-6">
                            {editingClinic.id ? "Edit Clinic" : "New Clinic"}
                          </h2>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              { label: "Name", field: "name", type: "text", colSpan: 2 },
                              { label: "Date", field: "date", type: "date" },
                              { label: "Start Time (e.g. 10:00 AM)", field: "start_time", type: "text" },
                              { label: "End Time (e.g. 12:00 PM)", field: "end_time", type: "text" },
                              { label: "Location", field: "location", type: "text" },
                              { label: "Borough", field: "borough", type: "text" },
                              { label: "Max Participants", field: "max_participants", type: "number" },
                            ].map(({ label, field, type, colSpan }) => (
                              <div key={field} className={colSpan === 2 ? "sm:col-span-2" : ""}>
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">{label}</label>
                                <input
                                  type={type}
                                  value={(editingClinic as any)[field] ?? ""}
                                  onChange={e => setEditingClinic(prev => ({ ...prev!, [field]: type === "number" ? Number(e.target.value) : e.target.value }))}
                                  className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-colors"
                                />
                              </div>
                            ))}
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">Age Group</label>
                              <select
                                value={editingClinic.age_group ?? "youth"}
                                onChange={e => setEditingClinic(prev => ({ ...prev!, age_group: e.target.value }))}
                                className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                              >
                                <option value="youth">Youth (21 & under)</option>
                                <option value="senior">Senior (22+)</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">Status</label>
                              <select
                                value={editingClinic.status ?? "upcoming"}
                                onChange={e => setEditingClinic(prev => ({ ...prev!, status: e.target.value }))}
                                className="w-full h-10 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                              >
                                <option value="upcoming">Upcoming</option>
                                <option value="completed">Completed</option>
                              </select>
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">Description</label>
                              <textarea
                                rows={3}
                                value={editingClinic.description ?? ""}
                                onChange={e => setEditingClinic(prev => ({ ...prev!, description: e.target.value }))}
                                className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-colors resize-none"
                              />
                            </div>
                          </div>
                          {eventError && <p className="text-sm text-red-600 mt-3 font-medium">{eventError}</p>}
                          <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1 border-zinc-200 text-zinc-700 hover:bg-zinc-50" onClick={() => { setEditingClinic(null); setEventError(null); }}>Cancel</Button>
                            <Button disabled={eventSaving} onClick={saveClinic} className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold">
                              {eventSaving ? "Saving..." : "Save Clinic"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-zinc-200 shadow-2xl p-8 w-full max-w-sm"
            >
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center mb-4">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="font-display font-black text-lg uppercase tracking-tight text-zinc-900 mb-1">Delete {deleteConfirm.type === "tournament" ? "Tournament" : "Clinic"}?</h2>
              <p className="text-sm text-zinc-500 mb-6">
                <strong className="text-zinc-900">{deleteConfirm.name}</strong> will be permanently removed. This cannot be undone.
              </p>
              {eventError && <p className="text-sm text-red-600 mb-4 font-medium">{eventError}</p>}
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 border-zinc-200 text-zinc-700 hover:bg-zinc-50" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                <Button
                  disabled={eventSaving}
                  onClick={() => deleteConfirm.type === "tournament" ? deleteTournament(deleteConfirm.id) : deleteClinic(deleteConfirm.id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold"
                >
                  {eventSaving ? "Deleting..." : "Yes, Delete"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset password modal */}
      <AnimatePresence>
        {resetTarget && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
            onClick={e => { if (e.target === e.currentTarget) { setResetTarget(null); setNewPassword(""); setResetError(null); } }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl border border-zinc-200 shadow-2xl p-8 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <KeyRound className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="font-display font-black text-lg uppercase tracking-tight text-zinc-900">Reset Password</h2>
                  <p className="text-xs text-zinc-500">For {resetTarget.name}</p>
                </div>
              </div>
              <p className="text-sm text-zinc-500 mb-5 mt-1">{resetTarget.email}</p>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">New Password</label>
                  <div className="relative">
                    <input
                      type={newPasswordVisible ? "text" : "password"}
                      value={newPassword}
                      onChange={e => { setNewPassword(e.target.value); setResetError(null); }}
                      placeholder="Min. 6 characters"
                      className="w-full h-11 px-4 pr-10 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-colors"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setNewPasswordVisible(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                    >
                      {newPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {resetError && <p className="text-sm text-red-600 font-medium">{resetError}</p>}

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1 border-zinc-200 text-zinc-700 hover:bg-zinc-50" onClick={() => { setResetTarget(null); setNewPassword(""); setResetError(null); }}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
                    onClick={handleResetPassword}
                    disabled={resetLoading || newPassword.length < 6}
                  >
                    {resetLoading ? "Saving…" : "Set Password"}
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-white rounded-2xl border border-zinc-200 shadow-2xl p-8 w-full max-w-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display font-black text-lg uppercase tracking-tight text-zinc-900">Admin Access</h2>
                  <p className="text-xs text-zinc-500">Enter your admin passcode</p>
                </div>
              </div>

              <div className="relative mb-4">
                <input
                  type={passcodeVisible ? "text" : "password"}
                  value={passcode}
                  onChange={e => { setPasscode(e.target.value); setPasscodeError(null); }}
                  onKeyDown={e => e.key === "Enter" && handleBecomeAdmin()}
                  placeholder="Passcode"
                  className="w-full h-11 px-4 pr-10 rounded-xl border border-zinc-200 bg-zinc-50 text-sm text-zinc-900 font-medium focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-colors"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setPasscodeVisible(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors"
                >
                  {passcodeVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {passcodeError && (
                <p className="text-red-600 text-sm font-medium mb-4">{passcodeError}</p>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-zinc-200 text-zinc-700 hover:bg-zinc-50"
                  onClick={() => { setShowPasscode(false); setPasscode(""); setPasscodeError(null); }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold"
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
