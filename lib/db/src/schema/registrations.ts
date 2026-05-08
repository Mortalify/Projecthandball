import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { playersTable } from "./players";

export const registrationsTable = pgTable("registrations", {
  id: serial("id").primaryKey(),
  tournamentId: text("tournament_id").notNull(),
  playerId: integer("player_id").references(() => playersTable.id),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  partnerName: text("partner_name"),
  isPaidTournament: boolean("is_paid_tournament").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRegistrationSchema = createInsertSchema(registrationsTable).omit({
  id: true,
  createdAt: true,
});

export const registerForTournamentSchema = z.object({
  tournamentId: z.string().min(1),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  partnerName: z.string().optional(),
  isPaidTournament: z.boolean(),
});

export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
export type Registration = typeof registrationsTable.$inferSelect;
