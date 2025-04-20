import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["user", "ngo"] }).notNull().default("user"),
  contactPhone: text("contact_phone"),
  // NGO specific fields
  ngoName: text("ngo_name"),
  ngoRegistration: text("ngo_registration"),
  location: text("location"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true
});

// Reported Animals table schema
export const reportedAnimals = pgTable("reported_animals", {
  id: serial("id").primaryKey(),
  animalType: text("animal_type").notNull(),
  urgency: text("urgency", { enum: ["urgent", "non-urgent"] }).notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(),
  photoUrl: text("photo_url"),
  status: text("status", { enum: ["pending", "in-progress", "resolved", "adoptable"] }).notNull().default("pending"),
  reportedAt: timestamp("reported_at").notNull().defaultNow(),
  reportedById: integer("reported_by_id").notNull().references(() => users.id),
  assignedToId: integer("assigned_to_id").references(() => users.id), // NGO id that is handling this case
});

export const insertReportedAnimalSchema = createInsertSchema(reportedAnimals)
  .omit({ id: true, reportedAt: true, status: true, assignedToId: true });

// Adoptable Animals table schema
export const adoptableAnimals = pgTable("adoptable_animals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  animalType: text("animal_type").notNull(),
  gender: text("gender", { enum: ["male", "female", "unknown"] }).notNull(),
  age: text("age").notNull(),
  vaccinated: text("vaccinated", { enum: ["yes", "no", "partial"] }).notNull(),
  description: text("description").notNull(),
  photoUrl: text("photo_url"),
  status: text("status", { enum: ["available", "pending", "adopted"] }).notNull().default("available"),
  listedAt: timestamp("listed_at").notNull().defaultNow(),
  listedById: integer("listed_by_id").notNull().references(() => users.id), // NGO id that listed this animal
});

export const insertAdoptableAnimalSchema = createInsertSchema(adoptableAnimals)
  .omit({ id: true, listedAt: true, status: true });

// Veterinarians table schema
export const veterinarians = pgTable("veterinarians", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  location: text("location").notNull(), // For searching by proximity
  latitude: text("latitude"),
  longitude: text("longitude"),
});

export const insertVeterinarianSchema = createInsertSchema(veterinarians)
  .omit({ id: true });

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ReportedAnimal = typeof reportedAnimals.$inferSelect;
export type InsertReportedAnimal = z.infer<typeof insertReportedAnimalSchema>;

export type AdoptableAnimal = typeof adoptableAnimals.$inferSelect;
export type InsertAdoptableAnimal = z.infer<typeof insertAdoptableAnimalSchema>;

export type Veterinarian = typeof veterinarians.$inferSelect;
export type InsertVeterinarian = z.infer<typeof insertVeterinarianSchema>;
