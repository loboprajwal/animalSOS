import { createServer } from 'http';
import { setupAuth } from './auth.js';
import { storage } from './storage.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer for file uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage_config });

// Middleware to check authentication
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
};

// Middleware to check if user is NGO
const isNGO = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'ngo') {
    return next();
  }
  res.status(403).json({ error: 'Unauthorized, NGO role required' });
};

async function registerRoutes(app) {
  // Set up authentication routes
  setupAuth(app);
  
  // Reported Animals Routes
  app.get('/api/reported-animals', isAuthenticated, async (req, res) => {
    try {
      const animals = await storage.getReportedAnimals();
      res.json(animals);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/reported-animals/user', isAuthenticated, async (req, res) => {
    try {
      const animals = await storage.getReportedAnimalsByUser(req.user._id);
      res.json(animals);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/reported-animals/status/:status', isAuthenticated, async (req, res) => {
    try {
      const animals = await storage.getReportedAnimalsByStatus(req.params.status);
      res.json(animals);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/reported-animals/:id', isAuthenticated, async (req, res) => {
    try {
      const animal = await storage.getReportedAnimalById(req.params.id);
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found' });
      }
      res.json(animal);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/reported-animals', isAuthenticated, upload.array('images', 5), async (req, res) => {
    try {
      // Process uploaded files
      const imageFiles = req.files || [];
      const imagePaths = imageFiles.map(file => `/uploads/${file.filename}`);
      
      const animalData = {
        ...req.body,
        reportedBy: req.user._id,
        images: imagePaths,
        coordinates: {
          latitude: parseFloat(req.body.latitude),
          longitude: parseFloat(req.body.longitude)
        }
      };
      
      const animal = await storage.createReportedAnimal(animalData);
      res.status(201).json(animal);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/reported-animals/:id/status', isAuthenticated, async (req, res) => {
    try {
      const { status } = req.body;
      const assignedToId = req.body.assignedToId || null;
      
      const animal = await storage.updateReportedAnimalStatus(req.params.id, status, assignedToId);
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found' });
      }
      res.json(animal);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Adoptable Animals Routes
  app.get('/api/adoptable-animals', async (req, res) => {
    try {
      const animals = await storage.getAdoptableAnimals();
      res.json(animals);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/adoptable-animals/ngo', isNGO, async (req, res) => {
    try {
      const animals = await storage.getAdoptableAnimalsByNgo(req.user._id);
      res.json(animals);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/adoptable-animals/:id', async (req, res) => {
    try {
      const animal = await storage.getAdoptableAnimalById(req.params.id);
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found' });
      }
      res.json(animal);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/adoptable-animals', isNGO, upload.array('images', 5), async (req, res) => {
    try {
      // Process uploaded files
      const imageFiles = req.files || [];
      const imagePaths = imageFiles.map(file => `/uploads/${file.filename}`);
      
      const animalData = {
        ...req.body,
        ngoId: req.user._id,
        images: imagePaths,
        age: parseInt(req.body.age) || null
      };
      
      const animal = await storage.createAdoptableAnimal(animalData);
      res.status(201).json(animal);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/adoptable-animals/:id/status', isNGO, async (req, res) => {
    try {
      const { status } = req.body;
      
      const animal = await storage.updateAdoptableAnimalStatus(req.params.id, status);
      if (!animal) {
        return res.status(404).json({ error: 'Animal not found' });
      }
      res.json(animal);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/adoptable-animals/:id', isNGO, async (req, res) => {
    try {
      const success = await storage.deleteAdoptableAnimal(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Animal not found' });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Veterinarian Routes
  app.get('/api/veterinarians', async (req, res) => {
    try {
      const vets = await storage.getVeterinarians();
      res.json(vets);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/veterinarians/nearby', async (req, res) => {
    try {
      const { location, limit } = req.query;
      const vets = await storage.getNearbyVeterinarians(location, parseInt(limit) || 10);
      res.json(vets);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/veterinarians/:id', async (req, res) => {
    try {
      const vet = await storage.getVeterinarianById(req.params.id);
      if (!vet) {
        return res.status(404).json({ error: 'Veterinarian not found' });
      }
      res.json(vet);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/veterinarians', isAuthenticated, async (req, res) => {
    try {
      const vetData = {
        ...req.body,
        coordinates: {
          latitude: parseFloat(req.body.latitude),
          longitude: parseFloat(req.body.longitude)
        },
        services: req.body.services ? req.body.services.split(',').map(s => s.trim()) : []
      };
      
      const vet = await storage.createVeterinarian(vetData);
      res.status(201).json(vet);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Return HTTP server
  const httpServer = createServer(app);
  return httpServer;
}

export { registerRoutes };