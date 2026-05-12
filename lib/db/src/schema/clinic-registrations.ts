import { pgTable, serial, text, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const clinicRegistrationsTable = pgTable("clinic_registrations", {
  id: serial("id").primaryKey(),
  clinicId: text("clinic_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  age: integer("age").notNull(),
  guardianName: text("guardian_name"),
  waiverAccepted: boolean("waiver_accepted").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const registerForClinicSchema = z.object({
  clinicId: z.string().min(1),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  age: z.number().int().min(1).max(120),
  guardianName: z.string().optional(),
  waiverAccepted: z.boolean(),
});

export type InsertClinicRegistration = typeof clinicRegistrationsTable.$inferInsert;
export type ClinicRegistration = typeof clinicRegistrationsTable.$inferSelect;
