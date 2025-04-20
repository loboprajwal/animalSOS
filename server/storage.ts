import { 
  users, type User, type InsertUser,
  reportedAnimals, type ReportedAnimal, type InsertReportedAnimal,
  adoptableAnimals, type AdoptableAnimal, type InsertAdoptableAnimal,
  veterinarians, type Veterinarian, type InsertVeterinarian
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, and, or } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Reported animals methods
  getReportedAnimals(): Promise<ReportedAnimal[]>;
  getReportedAnimalById(id: number): Promise<ReportedAnimal | undefined>;
  getReportedAnimalsByUser(userId: number): Promise<ReportedAnimal[]>;
  getReportedAnimalsByStatus(status: string): Promise<ReportedAnimal[]>;
  createReportedAnimal(animal: InsertReportedAnimal): Promise<ReportedAnimal>;
  updateReportedAnimalStatus(id: number, status: string, assignedToId?: number): Promise<ReportedAnimal | undefined>;
  
  // Adoptable animals methods
  getAdoptableAnimals(): Promise<AdoptableAnimal[]>;
  getAdoptableAnimalById(id: number): Promise<AdoptableAnimal | undefined>;
  getAdoptableAnimalsByNgo(ngoId: number): Promise<AdoptableAnimal[]>;
  createAdoptableAnimal(animal: InsertAdoptableAnimal): Promise<AdoptableAnimal>;
  updateAdoptableAnimalStatus(id: number, status: string): Promise<AdoptableAnimal | undefined>;
  deleteAdoptableAnimal(id: number): Promise<boolean>;
  
  // Veterinarian methods
  getVeterinarians(): Promise<Veterinarian[]>;
  getVeterinarianById(id: number): Promise<Veterinarian | undefined>;
  getNearbyVeterinarians(location: string, limit?: number): Promise<Veterinarian[]>;
  createVeterinarian(vet: InsertVeterinarian): Promise<Veterinarian>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;
  
  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Reported animals methods
  async getReportedAnimals(): Promise<ReportedAnimal[]> {
    return await db.select().from(reportedAnimals).orderBy(desc(reportedAnimals.createdAt));
  }

  async getReportedAnimalById(id: number): Promise<ReportedAnimal | undefined> {
    const [animal] = await db.select().from(reportedAnimals).where(eq(reportedAnimals.id, id));
    return animal || undefined;
  }

  async getReportedAnimalsByUser(userId: number): Promise<ReportedAnimal[]> {
    return await db
      .select()
      .from(reportedAnimals)
      .where(eq(reportedAnimals.reportedBy, userId))
      .orderBy(desc(reportedAnimals.createdAt));
  }

  async getReportedAnimalsByStatus(status: string): Promise<ReportedAnimal[]> {
    return await db
      .select()
      .from(reportedAnimals)
      .where(eq(reportedAnimals.status, status))
      .orderBy(desc(reportedAnimals.createdAt));
  }

  async createReportedAnimal(animal: InsertReportedAnimal): Promise<ReportedAnimal> {
    const [reportedAnimal] = await db
      .insert(reportedAnimals)
      .values(animal)
      .returning();
    return reportedAnimal;
  }

  async updateReportedAnimalStatus(id: number, status: string, assignedToId?: number): Promise<ReportedAnimal | undefined> {
    const [updatedAnimal] = await db
      .update(reportedAnimals)
      .set({ 
        status, 
        ...(assignedToId ? { assignedTo: assignedToId } : {}) 
      })
      .where(eq(reportedAnimals.id, id))
      .returning();
    return updatedAnimal || undefined;
  }

  // Adoptable animals methods
  async getAdoptableAnimals(): Promise<AdoptableAnimal[]> {
    return await db
      .select()
      .from(adoptableAnimals)
      .where(eq(adoptableAnimals.status, "available"))
      .orderBy(desc(adoptableAnimals.createdAt));
  }

  async getAdoptableAnimalById(id: number): Promise<AdoptableAnimal | undefined> {
    const [animal] = await db
      .select()
      .from(adoptableAnimals)
      .where(eq(adoptableAnimals.id, id));
    return animal || undefined;
  }

  async getAdoptableAnimalsByNgo(ngoId: number): Promise<AdoptableAnimal[]> {
    return await db
      .select()
      .from(adoptableAnimals)
      .where(eq(adoptableAnimals.listedBy, ngoId))
      .orderBy(desc(adoptableAnimals.createdAt));
  }

  async createAdoptableAnimal(animal: InsertAdoptableAnimal): Promise<AdoptableAnimal> {
    const [adoptableAnimal] = await db
      .insert(adoptableAnimals)
      .values(animal)
      .returning();
    return adoptableAnimal;
  }

  async updateAdoptableAnimalStatus(id: number, status: string): Promise<AdoptableAnimal | undefined> {
    const [updatedAnimal] = await db
      .update(adoptableAnimals)
      .set({ status })
      .where(eq(adoptableAnimals.id, id))
      .returning();
    return updatedAnimal || undefined;
  }

  async deleteAdoptableAnimal(id: number): Promise<boolean> {
    const result = await db
      .delete(adoptableAnimals)
      .where(eq(adoptableAnimals.id, id));
    return true; // In Drizzle ORM, if operation completes without errors, it's successful
  }

  // Veterinarian methods
  async getVeterinarians(): Promise<Veterinarian[]> {
    return await db.select().from(veterinarians);
  }

  async getVeterinarianById(id: number): Promise<Veterinarian | undefined> {
    const [vet] = await db
      .select()
      .from(veterinarians)
      .where(eq(veterinarians.id, id));
    return vet || undefined;
  }

  // Basic location-based filtering by looking for vets in the same city/area
  async getNearbyVeterinarians(location: string, limit: number = 10): Promise<Veterinarian[]> {
    return await db
      .select()
      .from(veterinarians)
      .where(or(
        like(veterinarians.address, `%${location}%`),
        like(veterinarians.city, `%${location}%`),
      ))
      .limit(limit);
  }

  async createVeterinarian(vet: InsertVeterinarian): Promise<Veterinarian> {
    const [veterinarian] = await db
      .insert(veterinarians)
      .values(vet)
      .returning();
    return veterinarian;
  }
}

export const storage = new DatabaseStorage();