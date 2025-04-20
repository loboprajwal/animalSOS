import mongoose from 'mongoose';
const { Schema } = mongoose;

// Schema definitions
// User Schema
const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'ngo', 'admin'], default: 'user' },
  location: String,
  phone: String,
  createdAt: { type: Date, default: Date.now }
});

// Reported Animal Schema
const reportedAnimalSchema = new Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  reportedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'investigating', 'rescued', 'closed'], default: 'pending' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  images: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Adoptable Animal Schema
const adoptableAnimalSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  breed: String,
  age: Number,
  gender: { type: String, enum: ['male', 'female', 'unknown'] },
  description: { type: String, required: true },
  healthStatus: String,
  ngoId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['available', 'adopted', 'pending', 'unavailable'], default: 'available' },
  images: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Veterinarian Schema
const veterinarianSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  phone: String,
  email: String,
  services: [String],
  hours: String,
  createdAt: { type: Date, default: Date.now }
});

// Create models or use in-memory storage if mongoose connection isn't available
let User, ReportedAnimal, AdoptableAnimal, Veterinarian;

try {
  // Try to create Mongoose models
  User = mongoose.model('User', userSchema);
  ReportedAnimal = mongoose.model('ReportedAnimal', reportedAnimalSchema);
  AdoptableAnimal = mongoose.model('AdoptableAnimal', adoptableAnimalSchema);
  Veterinarian = mongoose.model('Veterinarian', veterinarianSchema);
  
  console.log('MongoDB models created successfully');
} catch (error) {
  console.log('Using in-memory model fallbacks');
  
  // Create model-compatible objects for in-memory storage
  class InMemoryModel {
    constructor(name, schema) {
      this.name = name.toLowerCase();
      this.schema = schema;
    }
    
    static findById(id) {
      if (!global.inMemoryMongoDB) return null;
      return global.inMemoryMongoDB.findById(this.name, id);
    }
    
    static findOne(query) {
      if (!global.inMemoryMongoDB) return null;
      const collection = global.inMemoryMongoDB.collections[this.name];
      
      // Simple implementation to match objects based on query properties
      return collection.find(doc => {
        for (const key in query) {
          if (doc[key] !== query[key]) return false;
        }
        return true;
      });
    }
    
    static find(query = {}) {
      if (!global.inMemoryMongoDB) return [];
      const collection = global.inMemoryMongoDB.collections[this.name];
      
      if (Object.keys(query).length === 0) {
        return collection;
      }
      
      // Simple implementation to match objects based on query properties
      return collection.filter(doc => {
        for (const key in query) {
          if (doc[key] !== query[key]) return false;
        }
        return true;
      });
    }
    
    // Add placeholder lean and populate methods
    static lean() { return this; }
    static populate() { return this; }
  }
  
  // Create in-memory models
  User = new InMemoryModel('users', userSchema);
  ReportedAnimal = new InMemoryModel('reportedanimals', reportedAnimalSchema);
  AdoptableAnimal = new InMemoryModel('adoptableanimals', adoptableAnimalSchema);
  Veterinarian = new InMemoryModel('veterinarians', veterinarianSchema);
}

export {
  User,
  ReportedAnimal,
  AdoptableAnimal,
  Veterinarian
};