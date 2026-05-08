export type TournamentType = "singles" | "doubles";

export type Tournament = {
  id: string;
  name: string;
  date: string;
  time: string;
  location: string;
  borough: string;
  type: TournamentType;
  isPaid: boolean;
  entryFee: number;
  description: string;
  maxParticipants: number;
  status: "upcoming" | "completed";
};

export const tournaments: Tournament[] = [
  {
    id: "summer-slam-singles-2026",
    name: "Summer Slam Singles",
    date: "2026-05-25",
    time: "10:00 AM",
    location: "Central Park Courts",
    borough: "Manhattan, NY",
    type: "singles",
    isPaid: false,
    entryFee: 0,
    description: "Kick off the summer with our first free singles tournament. Open to all skill levels — come out, compete, and rep the culture.",
    maxParticipants: 32,
    status: "upcoming",
  },
  {
    id: "ph-doubles-cup-2026",
    name: "Project Handball Doubles Cup",
    date: "2026-06-07",
    time: "9:00 AM",
    location: "Brighton Beach Courts",
    borough: "Brooklyn, NY",
    type: "doubles",
    isPaid: true,
    entryFee: 40,
    description: "Grab your partner and compete for the Doubles Cup title. $40 entry per pair collected at check-in. Winners earn S Player status.",
    maxParticipants: 16,
    status: "upcoming",
  },
  {
    id: "nyc-open-singles-2026",
    name: "NYC Open Singles Championship",
    date: "2026-06-21",
    time: "10:00 AM",
    location: "Crotona Park Courts",
    borough: "Bronx, NY",
    type: "singles",
    isPaid: true,
    entryFee: 20,
    description: "The NYC Open is back. Paid singles bracket with a full tournament draw. Winners earn S Player status. Serious competition only.",
    maxParticipants: 32,
    status: "upcoming",
  },
  {
    id: "community-doubles-2026",
    name: "Community Doubles Ladder",
    date: "2026-07-04",
    time: "11:00 AM",
    location: "East River Park Courts",
    borough: "Manhattan, NY",
    type: "doubles",
    isPaid: false,
    entryFee: 0,
    description: "Free doubles ladder-style tournament on July 4th. Bring a partner or get matched up on arrival. All are welcome.",
    maxParticipants: 20,
    status: "upcoming",
  },
];

export function getTournament(id: string): Tournament | undefined {
  return tournaments.find(t => t.id === id);
}
