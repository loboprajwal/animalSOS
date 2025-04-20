import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertReportedAnimalSchema, insertAdoptableAnimalSchema } from "@shared/schema";
import path from "path";
import fs from "fs";
import multer from "multer";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({ storage: storage2 });

// Middleware to check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if user is an NGO
const isNGO = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user.role === "ngo") {
    return next();
  }
  return res.status(403).json({ message: "Forbidden: NGO access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // Serve uploaded files
  app.use('/uploads', express.static(uploadDir));

  // Reported animals routes
  app.get("/api/reported-animals", isAuthenticated, async (req, res) => {
    try {
      let animals;
      // If NGO, get all animals; if user, get only their own reported animals
      if (req.user.role === "ngo") {
        animals = await storage.getReportedAnimals();
      } else {
        animals = await storage.getReportedAnimalsByUser(req.user.id);
      }
      res.json(animals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reported animals" });
    }
  });

  app.get("/api/reported-animals/:id", isAuthenticated, async (req, res) => {
    try {
      const animal = await storage.getReportedAnimalById(parseInt(req.params.id));
      if (!animal) return res.status(404).json({ message: "Animal not found" });
      
      // Check if user has permission to view this animal
      if (req.user.role !== "ngo" && animal.reportedById !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(animal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch animal" });
    }
  });

  app.post("/api/reported-animals", isAuthenticated, upload.single('photo'), async (req, res) => {
    try {
      // Parse and validate the request body
      const validatedData = insertReportedAnimalSchema.parse({
        ...req.body,
        reportedById: req.user.id,
        photoUrl: req.file ? `/uploads/${req.file.filename}` : undefined
      });
      
      const reportedAnimal = await storage.createReportedAnimal(validatedData);
      res.status(201).json(reportedAnimal);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error: String(error) });
    }
  });

  app.patch("/api/reported-animals/:id/status", isNGO, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["pending", "in-progress", "resolved", "adoptable"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const animal = await storage.updateReportedAnimalStatus(
        parseInt(req.params.id),
        status,
        req.user.id
      );
      
      if (!animal) return res.status(404).json({ message: "Animal not found" });
      res.json(animal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  // Adoptable animals routes
  app.get("/api/adoptable-animals", async (req, res) => {
    try {
      const animals = await storage.getAdoptableAnimals();
      res.json(animals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch adoptable animals" });
    }
  });

  app.get("/api/adoptable-animals/:id", async (req, res) => {
    try {
      const animal = await storage.getAdoptableAnimalById(parseInt(req.params.id));
      if (!animal) return res.status(404).json({ message: "Animal not found" });
      res.json(animal);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch animal" });
    }
  });

  app.get("/api/ngo/adoptable-animals", isNGO, async (req, res) => {
    try {
      const animals = await storage.getAdoptableAnimalsByNgo(req.user.id);
      res.json(animals);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch adoptable animals" });
    }
  });

  app.post("/api/adoptable-animals", isNGO, upload.single('photo'), async (req, res) => {
    try {
      // Parse and validate the request body
      const validatedData = insertAdoptableAnimalSchema.parse({
        ...req.body,
        listedById: req.user.id,
        photoUrl: req.file ? `/uploads/${req.file.filename}` : undefined
      });
      
      const adoptableAnimal = await storage.createAdoptableAnimal(validatedData);
      res.status(201).json(adoptableAnimal);
    } catch (error) {
      res.status(400).json({ message: "Invalid data", error: String(error) });
    }
  });

  app.patch("/api/adoptable-animals/:id/status", isNGO, async (req, res) => {
    try {
      const { status } = req.body;
      if (!["available", "pending", "adopted"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const animal = await storage.getAdoptableAnimalById(parseInt(req.params.id));
      if (!animal) return res.status(404).json({ message: "Animal not found" });
      
      // Check if the NGO has permission to update this animal
      if (animal.listedById !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedAnimal = await storage.updateAdoptableAnimalStatus(parseInt(req.params.id), status);
      res.json(updatedAnimal);
    } catch (error) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.delete("/api/adoptable-animals/:id", isNGO, async (req, res) => {
    try {
      const animal = await storage.getAdoptableAnimalById(parseInt(req.params.id));
      if (!animal) return res.status(404).json({ message: "Animal not found" });
      
      // Check if the NGO has permission to delete this animal
      if (animal.listedById !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteAdoptableAnimal(parseInt(req.params.id));
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete animal" });
    }
  });

  // Veterinarians routes
  app.get("/api/veterinarians", isAuthenticated, async (req, res) => {
    try {
      const location = req.query.location as string || "";
      const limit = parseInt(req.query.limit as string || "10");
      
      const vets = location 
        ? await storage.getNearbyVeterinarians(location, limit)
        : await storage.getVeterinarians();
      
      res.json(vets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch veterinarians" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

import express from "express";
