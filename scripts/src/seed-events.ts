import { Client } from "pg";

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  await client.query(`
    CREATE TABLE IF NOT EXISTS tournament_events (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT NOT NULL,
      borough TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'singles',
      is_paid BOOLEAN NOT NULL DEFAULT false,
      entry_fee INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      max_participants INTEGER NOT NULL DEFAULT 32,
      status TEXT NOT NULL DEFAULT 'upcoming',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await client.query(`
    CREATE TABLE IF NOT EXISTS clinic_events (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      date TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      location TEXT NOT NULL,
      borough TEXT NOT NULL,
      age_group TEXT NOT NULL DEFAULT 'youth',
      description TEXT NOT NULL DEFAULT '',
      max_participants INTEGER NOT NULL DEFAULT 24,
      status TEXT NOT NULL DEFAULT 'upcoming',
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  console.log("Tables created");

  const tournaments = [
    { slug: "summer-slam-singles-2026", name: "Summer Slam Singles", date: "2026-05-25", time: "10:00 AM", location: "Central Park Courts", borough: "Manhattan, NY", type: "singles", isPaid: false, entryFee: 0, description: "Kick off the summer with our first free singles tournament. Open to all skill levels — come out, compete, and rep the culture.", maxParticipants: 32, status: "upcoming" },
    { slug: "ph-doubles-cup-2026", name: "Project Handball Doubles Cup", date: "2026-06-07", time: "9:00 AM", location: "Brighton Beach Courts", borough: "Brooklyn, NY", type: "doubles", isPaid: true, entryFee: 40, description: "Grab your partner and compete for the Doubles Cup title. $40 entry per pair collected at check-in. Winners earn S Player status.", maxParticipants: 16, status: "upcoming" },
    { slug: "nyc-open-singles-2026", name: "NYC Open Singles Championship", date: "2026-06-21", time: "10:00 AM", location: "Crotona Park Courts", borough: "Bronx, NY", type: "singles", isPaid: true, entryFee: 20, description: "The NYC Open is back. Paid singles bracket with a full tournament draw. Winners earn S Player status. Serious competition only.", maxParticipants: 32, status: "upcoming" },
    { slug: "community-doubles-2026", name: "Community Doubles Ladder", date: "2026-07-04", time: "11:00 AM", location: "East River Park Courts", borough: "Manhattan, NY", type: "doubles", isPaid: false, entryFee: 0, description: "Free doubles ladder-style tournament on July 4th. Bring a partner or get matched up on arrival. All are welcome.", maxParticipants: 20, status: "upcoming" },
  ];

  for (const t of tournaments) {
    await client.query(
      `INSERT INTO tournament_events (slug, name, date, time, location, borough, type, is_paid, entry_fee, description, max_participants, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT (slug) DO NOTHING`,
      [t.slug, t.name, t.date, t.time, t.location, t.borough, t.type, t.isPaid, t.entryFee, t.description, t.maxParticipants, t.status]
    );
  }

  const clinics = [
    { slug: "youth-summer-clinic-2026", name: "Summer Youth Clinic", date: "2026-06-14", startTime: "10:00 AM", endTime: "12:00 PM", location: "Rucker Park Courts", borough: "Harlem, NY", ageGroup: "youth", description: "An intensive 2-hour fundamentals clinic for players 21 and under. Work on serves, wall play, and court positioning with Project Handball coaches. All skill levels welcome.", maxParticipants: 24, status: "upcoming" },
    { slug: "youth-brooklyn-clinic-2026", name: "Brooklyn Youth Skills Clinic", date: "2026-07-12", startTime: "10:00 AM", endTime: "12:00 PM", location: "Pier 2 Handball Courts", borough: "Brooklyn, NY", ageGroup: "youth", description: "Skill-building clinic covering offensive and defensive strategies for youth players. Coaches will run drills, live play, and 1-on-1 feedback sessions.", maxParticipants: 20, status: "upcoming" },
    { slug: "senior-advanced-clinic-2026", name: "Adult Advanced Clinic", date: "2026-06-21", startTime: "11:00 AM", endTime: "1:00 PM", location: "Crotona Park Courts", borough: "Bronx, NY", ageGroup: "senior", description: "For players 22 and older looking to sharpen their game. Focused on advanced techniques, conditioning, and match strategy. Intermediate to advanced skill level recommended.", maxParticipants: 20, status: "upcoming" },
    { slug: "senior-fundamentals-clinic-2026", name: "Adult Fundamentals Clinic", date: "2026-07-19", startTime: "11:00 AM", endTime: "1:00 PM", location: "East River Park Courts", borough: "Manhattan, NY", ageGroup: "senior", description: "Open to all adults 22 and up. This clinic covers the core fundamentals of handball — perfect for beginners or players returning to the game after a break.", maxParticipants: 24, status: "upcoming" },
  ];

  for (const c of clinics) {
    await client.query(
      `INSERT INTO clinic_events (slug, name, date, start_time, end_time, location, borough, age_group, description, max_participants, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT (slug) DO NOTHING`,
      [c.slug, c.name, c.date, c.startTime, c.endTime, c.location, c.borough, c.ageGroup, c.description, c.maxParticipants, c.status]
    );
  }

  console.log("Seeded 4 tournaments and 4 clinics");
  await client.end();
}

main().catch(e => { console.error(e); process.exit(1); });
