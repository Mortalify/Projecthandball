import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { playersTable } from "./players";

export const userWaiversTable = pgTable("user_waivers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => playersTable.id),
  waiverType: text("waiver_type").notNull(),
  parentName: text("parent_name"),
  parentEmail: text("parent_email"),
  accepted: boolean("accepted").notNull().default(true),
  signedAt: timestamp("signed_at").defaultNow(),
});

export type UserWaiver = typeof userWaiversTable.$inferSelect;
export type InsertUserWaiver = typeof userWaiversTable.$inferInsert;
