import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { MapPin, Calendar, Users, Clock, Check, X, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";

export type ClinicAgeGroup = "youth" | "senior";

export type Clinic = {
  id: string;
  slug?: string;
  name: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  borough: string;
  ageGroup: ClinicAgeGroup;
  description: string;
  maxParticipants: number;
  status: "upcoming" | "completed";
};

function rowToClinic(row: any): Clinic {
  return {
    id: row.slug ?? row.id,
    slug: row.slug,
    name: row.name,
    date: row.date,
    startTime: row.start_time,
    endTime: row.end_time,
    location: row.location,
    borough: row.borough,
    ageGroup: row.age_group as ClinicAgeGroup,
    description: row.description,
    maxParticipants: row.max_participants,
    status: row.status as "upcoming" | "completed",
  };
}

export const YOUTH_MAX_AGE = 21;
export const SENIOR_MIN_AGE = 22;

export function formatClinicDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

// ─── Spot Count Hook ──────────────────────────────────────────────────────────
function useClinicSpots(clinicId: string) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    fetch(`/api/clinic-registrations?clinicId=${clinicId}`)
      .then(r => r.json())
      .then(d => setCount(d.count ?? 0))
      .catch(() => setCount(null));
  }, [clinicId]);
  return count;
}

// ─── Clinic Card ─────────────────────────────────────────────────────────────
function ClinicCard({ clinic, onRegister }: { clinic: Clinic; onRegister: (c: Clinic) => void }) {
  const count = useClinicSpots(clinic.id);
  const spotsLeft = count !== null ? clinic.maxParticipants - count : null;
  const isFull = spotsLeft !== null && spotsLeft <= 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/50 bg-card p-6 flex flex-col gap-4"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-accent/10 text-accent border border-accent/30">
          Free
        </span>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isFull ? "bg-red-500/10 text-red-500" : "bg-green-500/10 text-green-600"}`}>
          {isFull ? "Full" : spotsLeft !== null ? `${spotsLeft} spots left` : `${clinic.maxParticipants} max`}
        </span>
      </div>

      <div>
        <h3 className="font-display text-xl font-black uppercase tracking-tight text-primary mb-1">{clinic.name}</h3>
        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
          <span className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5 shrink-0" />{formatClinicDate(clinic.date)}</span>
          <span className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 shrink-0" />{clinic.startTime} – {clinic.endTime}</span>
          <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 shrink-0" />{clinic.location}, {clinic.borough}</span>
          <span className="flex items-center gap-2"><Users className="h-3.5 w-3.5 shrink-0" />{spotsLeft !== null ? `${spotsLeft} of ${clinic.maxParticipants} spots remaining` : `${clinic.maxParticipants} max`}</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground leading-relaxed">{clinic.description}</p>

      <Button
        onClick={() => onRegister(clinic)}
        disabled={isFull}
        className="w-full bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-widest h-11 mt-auto"
      >
        {isFull ? "Clinic Full" : "Register — Free"}
      </Button>
    </motion.div>
  );
}

// ─── Waiver Step ─────────────────────────────────────────────────────────────
const WAIVER_ITEMS = [
  "I understand that handball is a physically demanding sport and that participation carries inherent risk of injury. Project Handball and its organizers are not liable for any injuries sustained during clinic activities.",
  "I acknowledge that Project Handball may provide food or refreshments at this event and that the organization is not liable for any allergic reactions, dietary restrictions, or food-related incidents.",
  "I confirm that I am the legal parent or guardian of the above-named participant and have the authority to grant permission for their participation.",
  "I release Project Handball, its coaches, volunteers, and affiliates from any and all claims arising from the participant's involvement in this clinic.",
];

function WaiverStep({ name, guardianName, setGuardianName, checks, setChecks }: {
  name: string; guardianName: string; setGuardianName: (v: string) => void;
  checks: boolean[]; setChecks: (v: boolean[]) => void;
}) {
  const toggle = (i: number) => { const next = [...checks]; next[i] = !next[i]; setChecks(next); };
  return (
    <div className="space-y-4">
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-yellow-800 mb-1">Parental / Guardian Waiver Required</p>
          <p className="text-xs text-yellow-700 leading-relaxed">Because <strong>{name}</strong> is under 18, a parent or legal guardian must review and accept the liability waiver below.</p>
        </div>
      </div>
      <div className="bg-muted/50 rounded-xl p-4 max-h-48 overflow-y-auto space-y-3 text-xs text-muted-foreground leading-relaxed border border-border/50">
        <p className="font-bold text-foreground text-sm uppercase tracking-wider">Participant Waiver & Release of Liability</p>
        {WAIVER_ITEMS.map((item, i) => <p key={i}><strong>{i + 1}.</strong> {item}</p>)}
      </div>
      <div className="space-y-2">
        {WAIVER_ITEMS.map((item, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <button type="button" onClick={() => toggle(i)} className={`mt-0.5 w-4 h-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${checks[i] ? "bg-accent border-accent" : "border-border group-hover:border-accent/50"}`}>
              {checks[i] && <Check className="h-2.5 w-2.5 text-white" />}
            </button>
            <span className="text-xs text-muted-foreground leading-relaxed">{item}</span>
          </label>
        ))}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="guardian-name" className="text-xs font-bold uppercase tracking-wider">Parent / Guardian Full Name <span className="text-red-500">*</span></Label>
        <Input id="guardian-name" value={guardianName} onChange={e => setGuardianName(e.target.value)} placeholder="Print full legal name" required />
      </div>
    </div>
  );
}

// ─── Register Modal ───────────────────────────────────────────────────────────
type ModalStep = "form" | "age-redirect" | "waiver" | "success";

function RegisterModal({ clinic, open, onClose, onRedirect }: {
  clinic: Clinic | null; open: boolean; onClose: () => void; onRedirect: (ageGroup: ClinicAgeGroup) => void;
}) {
  const [step, setStep] = useState<ModalStep>("form");
  const [name, setName] = useState(""); const [email, setEmail] = useState(""); const [phone, setPhone] = useState("");
  const [ageInput, setAgeInput] = useState(""); const [guardianName, setGuardianName] = useState("");
  const [waiverChecks, setWaiverChecks] = useState<boolean[]>(WAIVER_ITEMS.map(() => false));
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const [redirectTarget, setRedirectTarget] = useState<ClinicAgeGroup | null>(null);

  useEffect(() => {
    if (open) {
      setStep("form"); setName(""); setEmail(""); setPhone(""); setAgeInput("");
      setGuardianName(""); setWaiverChecks(WAIVER_ITEMS.map(() => false));
      setLoading(false); setError(""); setRedirectTarget(null);
    }
  }, [open]);

  if (!clinic) return null;

  const age = parseInt(ageInput, 10);
  const ageValid = !isNaN(age) && age >= 1 && age <= 120;
  const isUnder18 = ageValid && age < 18;
  const waiverComplete = waiverChecks.every(Boolean) && guardianName.trim().length >= 2;

  const checkAgeRedirect = (): ClinicAgeGroup | null => {
    if (!ageValid) return null;
    if (clinic.ageGroup === "senior" && age <= YOUTH_MAX_AGE) return "youth";
    if (clinic.ageGroup === "youth" && age >= SENIOR_MIN_AGE) return "senior";
    return null;
  };

  const handleFormNext = (e: React.FormEvent) => {
    e.preventDefault(); setError("");
    if (!ageValid) { setError("Please enter a valid age"); return; }
    const redirect = checkAgeRedirect();
    if (redirect) { setRedirectTarget(redirect); setStep("age-redirect"); return; }
    if (isUnder18) { setStep("waiver"); return; }
    submitRegistration();
  };

  const submitRegistration = async (guardianNameOverride?: string, waiverAccepted?: boolean) => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/clinic-registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clinicId: clinic.id, name, email, phone, age, guardianName: guardianNameOverride ?? undefined, waiverAccepted: waiverAccepted ?? false }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed"); if (isUnder18) setStep("waiver"); else setStep("form"); }
      else { setStep("success"); }
    } catch {
      setError("Network error — please try again");
      setStep(isUnder18 ? "waiver" : "form");
    } finally { setLoading(false); }
  };

  const redirectLabel = redirectTarget === "youth" ? "Youth (21 & Under)" : "Senior (22+)";
  const ageGroupLabel = clinic.ageGroup === "youth" ? "21 & Under" : "22 & Older";

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-black uppercase tracking-tight text-primary">
            {step === "success" ? "You're Registered!" : `Register — ${clinic.name}`}
          </DialogTitle>
          {step === "form" && <DialogDescription>Free clinic · {ageGroupLabel} · {clinic.startTime}–{clinic.endTime}</DialogDescription>}
          {step === "waiver" && <DialogDescription>Step 2 of 2 — Parental waiver required for participants under 18</DialogDescription>}
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === "success" && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-6 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-500" />
              </div>
              <p className="font-bold text-primary text-lg mb-1">See you on the court!</p>
              <p className="text-sm text-muted-foreground mb-2">You're confirmed for <strong>{clinic.name}</strong>.</p>
              <p className="text-sm text-muted-foreground mb-6">{formatClinicDate(clinic.date)} · {clinic.startTime}–{clinic.endTime}<br />{clinic.location}, {clinic.borough}</p>
              <Button onClick={onClose} className="bg-primary text-white font-bold uppercase tracking-widest">Done</Button>
            </motion.div>
          )}

          {step === "age-redirect" && (
            <motion.div key="redirect" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-2 space-y-4">
              <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-primary mb-1">
                    {redirectTarget === "youth" ? "You qualify for the Youth Clinic (21 & under)" : "You qualify for the Senior Clinic (22+)"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {redirectTarget === "youth"
                      ? `You entered age ${age}, which is ${YOUTH_MAX_AGE} or younger. This clinic is for players ${SENIOR_MIN_AGE} and older.`
                      : `You entered age ${age}, which is ${SENIOR_MIN_AGE} or older. This clinic is for players ${YOUTH_MAX_AGE} and younger.`}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Would you like us to take you to the <strong>{redirectLabel} Clinic</strong> registration?</p>
              <div className="flex gap-3">
                <Button onClick={() => { if (redirectTarget) { onClose(); onRedirect(redirectTarget); } }} className="flex-1 bg-accent hover:bg-accent/90 text-white font-bold uppercase tracking-wider gap-2">
                  Yes, take me there <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => setStep("form")} className="flex-1 font-bold uppercase tracking-wider">Go back</Button>
              </div>
            </motion.div>
          )}

          {step === "form" && (
            <motion.form key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleFormNext} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="cl-name" className="text-xs font-bold uppercase tracking-wider">Full Name</Label>
                <Input id="cl-name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cl-email" className="text-xs font-bold uppercase tracking-wider">Email</Label>
                <Input id="cl-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cl-phone" className="text-xs font-bold uppercase tracking-wider">Phone Number</Label>
                <Input id="cl-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 555-5555" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cl-age" className="text-xs font-bold uppercase tracking-wider">Age <span className="text-red-500">*</span></Label>
                <p className="text-xs text-muted-foreground">Used to ensure you're in the right clinic group ({clinic.ageGroup === "youth" ? "21 & under" : "22+"})</p>
                <Input id="cl-age" type="number" min={1} max={120} value={ageInput} onChange={e => setAgeInput(e.target.value)} placeholder="Your age" required />
              </div>
              {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-600 flex items-center gap-2"><X className="h-4 w-4 shrink-0" /> {error}</div>}
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest h-11">
                {isUnder18 && ageValid ? "Next — Sign Waiver" : "Register Free"}
              </Button>
            </motion.form>
          )}

          {step === "waiver" && (
            <motion.form key="waiver" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} onSubmit={e => { e.preventDefault(); if (!waiverComplete) { setError("Please check all boxes and enter guardian name"); return; } submitRegistration(guardianName, true); }} className="space-y-4 pt-2">
              <WaiverStep name={name} guardianName={guardianName} setGuardianName={setGuardianName} checks={waiverChecks} setChecks={setWaiverChecks} />
              {error && <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-600 flex items-center gap-2"><X className="h-4 w-4 shrink-0" /> {error}</div>}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => { setStep("form"); setError(""); }} className="h-11 px-5 font-bold uppercase tracking-wider">Back</Button>
                <Button type="submit" disabled={loading || !waiverComplete} className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold uppercase tracking-widest h-11">
                  {loading ? "Registering..." : "Accept & Register"}
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ClinicsPage() {
  const [clinicList, setClinicList] = useState<Clinic[]>([]);
  const [loadingClinics, setLoadingClinics] = useState(true);
  const [registerTarget, setRegisterTarget] = useState<Clinic | null>(null);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ClinicAgeGroup>("youth");

  useEffect(() => {
    fetch("/api/clinics")
      .then(r => r.json())
      .then(d => setClinicList((d.clinics ?? []).map(rowToClinic)))
      .catch(() => {})
      .finally(() => setLoadingClinics(false));
  }, []);

  const openRegister = (c: Clinic) => { setRegisterTarget(c); setRegisterOpen(true); };
  const closeRegister = () => setRegisterOpen(false);
  const handleRedirect = (ageGroup: ClinicAgeGroup) => setActiveTab(ageGroup);

  const youthClinics = clinicList.filter(c => c.ageGroup === "youth" && c.status === "upcoming");
  const seniorClinics = clinicList.filter(c => c.ageGroup === "senior" && c.status === "upcoming");

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground py-14 md:py-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <p className="text-accent font-bold text-xs uppercase tracking-[0.3em] mb-2">Project Handball</p>
            <h1 className="font-display text-5xl md:text-6xl font-black uppercase tracking-tight mb-4">Clinics</h1>
            <p className="text-primary-foreground/70 text-lg max-w-2xl">
              Free 2-hour coaching clinics for all ages. Learn from experienced players, improve your game, and become part of the Project Handball community.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-primary-foreground/60">
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> Always free to attend</span>
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> Expert coaching</span>
              <span className="flex items-center gap-2"><Check className="h-4 w-4 text-accent" /> All skill levels welcome</span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as ClinicAgeGroup)}>
          <TabsList className="mb-10 h-12 p-1 bg-muted rounded-xl">
            <TabsTrigger value="youth" className="h-10 px-8 font-bold uppercase tracking-wider text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              Youth Clinics <span className="ml-2 text-[9px] font-black uppercase tracking-wider bg-white/20 text-current px-1.5 py-0.5 rounded-full leading-none">21 & Under</span>
            </TabsTrigger>
            <TabsTrigger value="senior" className="h-10 px-8 font-bold uppercase tracking-wider text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white">
              Senior Clinics <span className="ml-2 text-[9px] font-black uppercase tracking-wider bg-white/20 text-current px-1.5 py-0.5 rounded-full leading-none">22+</span>
            </TabsTrigger>
          </TabsList>

          {loadingClinics ? (
            <div className="flex items-center justify-center py-20">
              <div className="h-8 w-8 rounded-full border-4 border-accent border-t-transparent animate-spin" />
            </div>
          ) : (
            <>
              <TabsContent value="youth">
                {youthClinics.length === 0 ? (
                  <div className="py-20 text-center"><p className="font-bold text-primary">No upcoming youth clinics</p><p className="text-sm text-muted-foreground mt-1">Check back soon.</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {youthClinics.map(c => <ClinicCard key={c.id} clinic={c} onRegister={openRegister} />)}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="senior">
                {seniorClinics.length === 0 ? (
                  <div className="py-20 text-center"><p className="font-bold text-primary">No upcoming senior clinics</p><p className="text-sm text-muted-foreground mt-1">Check back soon.</p></div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {seniorClinics.map(c => <ClinicCard key={c.id} clinic={c} onRegister={openRegister} />)}
                  </div>
                )}
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      <RegisterModal clinic={registerTarget} open={registerOpen} onClose={closeRegister} onRedirect={handleRedirect} />
    </div>
  );
}
