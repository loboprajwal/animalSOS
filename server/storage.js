import { User, ReportedAnimal, AdoptableAnimal, Veterinarian } from '../shared/models.js';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import mongoose from 'mongoose';
import crypto from 'crypto';

const MemoryStore = createMemoryStore(session);

// Generate a random ID in a similar format to MongoDB's ObjectId
function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

// Check if we're using actual MongoDB or the in-memory fallback
const isRealMongo = mongoose.connection.readyState === 1;

class MongoDBStorage {
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize collections for in-memory version if needed
    if (!isRealMongo && global.inMemoryMongoDB) {
      console.log('Using in-memory storage collections for MongoDB');
    }
  }

  // User related methods
  async getUser(id) {
    try {
      if (isRealMongo) {
        return await User.findById(id).lean();
      } else if (global.inMemoryMongoDB) {
        return global.inMemoryMongoDB.findById('users', id);
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return undefined;
    }
  }

  async getUserByUsername(username) {
    try {
      if (isRealMongo) {
        return await User.findOne({ username }).lean();
      } else if (global.inMemoryMongoDB) {
        const collection = global.inMemoryMongoDB.collections.users;
        return collection.find(user => user.username === username);
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async createUser(userData) {
    try {
      if (isRealMongo) {
        const user = new User(userData);
        await user.save();
        return user.toObject();
      } else if (global.inMemoryMongoDB) {
        const collection = global.inMemoryMongoDB.collections.users;
        const user = {
          _id: generateId(),
          ...userData,
          createdAt: new Date()
        };
        collection.push(user);
        return user;
      }
      throw new Error('Storage not available');
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  // Reported animals methods
  async getReportedAnimals() {
    try {
      if (isRealMongo) {
        return await ReportedAnimal.find().populate('reportedBy', 'username name').lean();
      } else if (global.inMemoryMongoDB) {
        return global.inMemoryMongoDB.collections.reportedanimals;
      }
      return [];
    } catch (error) {
      console.error('Error fetching reported animals:', error);
      return [];
    }
  }

  async getReportedAnimalById(id) {
    try {
      if (isRealMongo) {
        return await ReportedAnimal.findById(id)
          .populate('reportedBy', 'username name')
          .populate('assignedTo', 'username name')
          .lean();
      } else if (global.inMemoryMongoDB) {
        return global.inMemoryMongoDB.findById('reportedanimals', id);
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching reported animal by ID:', error);
      return undefined;
    }
  }

  async getReportedAnimalsByUser(userId) {
    try {
      if (isRealMongo) {
        return await ReportedAnimal.find({ reportedBy: userId })
          .populate('assignedTo', 'username name')
          .lean();
      } else if (global.inMemoryMongoDB) {
        const collection = global.inMemoryMongoDB.collections.reportedanimals;
        return collection.filter(animal => animal.reportedBy.toString() === userId.toString());
      }
      return [];
    } catch (error) {
      console.error('Error fetching reported animals by user:', error);
      return [];
    }
  }

  async getReportedAnimalsByStatus(status) {
    try {
      if (isRealMongo) {
        return await ReportedAnimal.find({ status })
          .populate('reportedBy', 'username name')
          .populate('assignedTo', 'username name')
          .lean();
      } else if (global.inMemoryMongoDB) {
        const collection = global.inMemoryMongoDB.collections.reportedanimals;
        return collection.filter(animal => animal.status === status);
      }
      return [];
    } catch (error) {
      console.error('Error fetching reported animals by status:', error);
      return [];
    }
  }

  async createReportedAnimal(animalData) {
    try {
      if (isRealMongo) {
        const animal = new ReportedAnimal(animalData);
        await animal.save();
        return animal.toObject();
      } else if (global.inMemoryMongoDB) {
        const collection = global.inMemoryMongoDB.collections.reportedanimals;
        const animal = {
          _id: generateId(),
          ...animalData,
          status: animalData.status || 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        collection.push(animal);
        return animal;
      }
      throw new Error('Storage not available');
    } catch (error) {
      console.error('Error creating reported animal:', error);
      throw error;
    }
  }

  async updateReportedAnimalStatus(id, status, assignedToId) {
    try {
      const updateData = { 
        status, 
        updatedAt: new Date() 
      };
      
      if (assignedToId) {
        updateData.assignedTo = assignedToId;
      }
      
      if (isRealMongo) {
        const animal = await ReportedAnimal.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
        ).populate('reportedBy', 'username name')
         .populate('assignedTo', 'username name');
        
        return animal ? animal.toObject() : undefined;
      } else if (global.inMemoryMongoDB) {
        const collection = global.inMemoryMongoDB.collections.reportedanimals;
        const animalIndex = collection.findIndex(a => a._id.toString() === id.toString());
        
        if (animalIndex === -1) return undefined;
        
        collection[animalIndex] = {
          ...collection[animalIndex],
          ...updateData
        };
        
        return collection[animalIndex];
      }
      
      return undefined;
    } catch (error) {
      console.error('Error updating reported animal status:', error);
      return undefined;
    }
  }

  // Adoptable animals methods
  async getAdoptableAnimals() {
    try {
      if (isRealMongo) {
        return await AdoptableAnimal.find().populate('ngoId', 'username name').lean();
      } else if (global.inMemoryMongoDB) {
        return global.inMemoryMongoDB.collections.adoptableanimals;
      }
      return [];
    } catch (error) {
      console.error('Error fetching adoptable animals:', error);
      return [];
    }
  }

  async getAdoptableAnimalById(id) {
    try {
      if (isRealMongo) {
        return await AdoptableAnimal.findById(id).populate('ngoId', 'username name').lean();
      } else if (global.inMemoryMongoDB) {
        return global.inMemoryMongoDB.findById('adoptableanimals', id);
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching adoptable animal by ID:', error);
      return undefined;
    }
  }

  async getAdoptableAnimalsByNgo(ngoId) {
    try {
      if (isRealMongo) {
        return await AdoptableAnimal.find({ ngoId }).lean();
      } else if (global.inMemoryMongoDB) {
        const collection = global.inMemoryMongoDB.collections.adoptableanimals;
        return collection.filter(animal => animal.ngoId.toString() === ngoId.toString());
      }
      return [];
    } catch (error) {
      console.error('Error fetching adoptable animals by NGO:', error);
      return [];
    }
  }

  async createAdoptableAnimal(animalData) {
    try {
      if (isRealMongo) {
        const animal = new AdoptableAnimal(animalData);
        await animal.save();
        return animal.toObject();
      } else if (global.inMemoryMongoDB) {
        const collection = global.inMemoryMongoDB.collections.adoptableanimals;
        const animal = {
          _id: generateId(),
          ...animalData,
          status: animalData.status || 'available',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        collection.push(animal);
        return animal;
      }
      throw new Error('Storage not available');
    } catch (error) {
      console.error('Error creating adoptable animal:', error);
      throw error;
    }
  }

  async updateAdoptableAnimalStatus(id, status) {
    try {
      if (isRealMongo) {
        const animal = await AdoptableAnimal.findByIdAndUpdate(
          id,
          { status, updatedAt: new Date() },
          { new: true }
        ).populate('ngoId', 'username name');
        
        return animal ? animal.toObject() : undefined;
      } else if (global.inMemoryMongoDB) {
        const collection = global.inMemoryMongoDB.collections.adoptableanimals;
        const animalIndex = collection.findIndex(a => a._id.toString() === id.toString());
        
        if (animalIndex === -1) return undefined;
        
        collection[animalIndex] = {
          ...collection[animalIndex],
          status,
          updatedAt: new Date()
        };
        
        return collection[animalIndex];
      }
      
      return undefined;
    } catch (error) {
      console.error('Error updating adoptable animal status:', error);
      return undefined;
    }
  }

  async deleteAdoptableAnimal(id) {
    try {
      if (isRealMongo) {
        const result = await AdoptableAnimal.deleteOne({ _id: id });
        return result.deletedCount > 0;
      } else if (global.inMemoryMongoDB) {
        const collection = global.inMemoryMongoDB.collections.adoptableanimals;
        const initialLength = collection.length;
        global.inMemoryMongoDB.collections.adoptableanimals = collection.filter(
          a => a._id.toString() !== id.toString()
        );
        return initialLength > global.inMemoryMongoDB.collections.adoptableanimals.length;
      }
      return false;
    } catch (error) {
      console.error('Error deleting adoptable animal:', error);
      return false;
    }
  }

  // Veterinarian methods
  async getVeterinarians() {
    try {
      if (isRealMongo) {
        return await Veterinarian.find().lean();
      } else if (global.inMemoryMongoDB) {
        return global.inMemoryMongoDB.collections.veterinarians;
      }
      return [];
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
      return [];
    }
  }

  async getVeterinarianById(id) {
    try {
      if (isRealMongo) {
        return await Veterinarian.findById(id).lean();
      } else if (global.inMemoryMongoDB) {
        return global.inMemoryMongoDB.findById('veterinarians', id);
      }
      return undefined;
    } catch (error) {
      console.error('Error fetching veterinarian by ID:', error);
      return undefined;
    }
  }

  async getNearbyVeterinarians(location, limit = 10) {
    try {
      if (isRealMongo) {
        // This is a simplified implementation
        // In a real app, you'd use geospatial queries
        return await Veterinarian.find().limit(limit).lean();
      } else if (global.inMemoryMongoDB) {
        const collection = global.inMemoryMongoDB.collections.veterinarians;
        return collection.slice(0, limit);
      }
      return [];
    } catch (error) {
      console.error('Error fetching nearby veterinarians:', error);
      return [];
    }
  }

  async createVeterinarian(vetData) {
    try {
      if (isRealMongo) {
        const vet = new Veterinarian(vetData);
        await vet.save();
        return vet.toObject();
      } else if (global.inMemoryMongoDB) {
        const collection = global.inMemoryMongoDB.collections.veterinarians;
        const vet = {
          _id: generateId(),
          ...vetData,
          createdAt: new Date()
        };
        collection.push(vet);
        return vet;
      }
      throw new Error('Storage not available');
    } catch (error) {
      console.error('Error creating veterinarian:', error);
      throw error;
    }
  }
}

const storage = new MongoDBStorage();

export { storage };