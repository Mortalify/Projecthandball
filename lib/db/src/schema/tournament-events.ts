import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const tournamentEventsTable = pgTable("tournament_events", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  borough: text("borough").notNull(),
  type: text("type").notNull().default("singles"),
  isPaid: boolean("is_paid").notNull().default(false),
  entryFee: integer("entry_fee").notNull().default(0),
  description: text("description").notNull().default(""),
  maxParticipants: integer("max_participants").notNull().default(32),
  status: text("status").notNull().default("upcoming"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type TournamentEvent = typeof tournamentEventsTable.$inferSelect;
