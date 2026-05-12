import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const clinicEventsTable = pgTable("clinic_events", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  location: text("location").notNull(),
  borough: text("borough").notNull(),
  ageGroup: text("age_group").notNull().default("youth"),
  description: text("description").notNull().default(""),
  maxParticipants: integer("max_participants").notNull().default(24),
  status: text("status").notNull().default("upcoming"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ClinicEvent = typeof clinicEventsTable.$inferSelect;
