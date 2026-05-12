export type ClinicAgeGroup = "youth" | "senior";

export type Clinic = {
  id: string;
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

export const YOUTH_MAX_AGE = 21;
export const SENIOR_MIN_AGE = 22;

export const clinics: Clinic[] = [
  {
    id: "youth-summer-clinic-2026",
    name: "Summer Youth Clinic",
    date: "2026-06-14",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    location: "Rucker Park Courts",
    borough: "Harlem, NY",
    ageGroup: "youth",
    description: "An intensive 2-hour fundamentals clinic for players 21 and under. Work on serves, wall play, and court positioning with Project Handball coaches. All skill levels welcome.",
    maxParticipants: 24,
    status: "upcoming",
  },
  {
    id: "youth-brooklyn-clinic-2026",
    name: "Brooklyn Youth Skills Clinic",
    date: "2026-07-12",
    startTime: "10:00 AM",
    endTime: "12:00 PM",
    location: "Pier 2 Handball Courts",
    borough: "Brooklyn, NY",
    ageGroup: "youth",
    description: "Skill-building clinic covering offensive and defensive strategies for youth players. Coaches will run drills, live play, and 1-on-1 feedback sessions.",
    maxParticipants: 20,
    status: "upcoming",
  },
  {
    id: "senior-advanced-clinic-2026",
    name: "Adult Advanced Clinic",
    date: "2026-06-21",
    startTime: "11:00 AM",
    endTime: "1:00 PM",
    location: "Crotona Park Courts",
    borough: "Bronx, NY",
    ageGroup: "senior",
    description: "For players 22 and older looking to sharpen their game. Focused on advanced techniques, conditioning, and match strategy. Intermediate to advanced skill level recommended.",
    maxParticipants: 20,
    status: "upcoming",
  },
  {
    id: "senior-fundamentals-clinic-2026",
    name: "Adult Fundamentals Clinic",
    date: "2026-07-19",
    startTime: "11:00 AM",
    endTime: "1:00 PM",
    location: "East River Park Courts",
    borough: "Manhattan, NY",
    ageGroup: "senior",
    description: "Open to all adults 22 and up. This clinic covers the core fundamentals of handball — perfect for beginners or players returning to the game after a break.",
    maxParticipants: 24,
    status: "upcoming",
  },
];

export function getClinic(id: string): Clinic | undefined {
  return clinics.find(c => c.id === id);
}

export function formatClinicDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
