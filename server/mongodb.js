import mongoose from 'mongoose';

// Mock MongoDB storage for development
class InMemoryMongoDB {
  constructor() {
    this.collections = {
      users: [],
      reportedanimals: [],
      adoptableanimals: [],
      veterinarians: []
    };
    this.idCounter = { users: 1, reportedanimals: 1, adoptableanimals: 1, veterinarians: 1 };
  }

  // Helper method to get the next ID for a collection
  getNextId(collectionName) {
    return this.idCounter[collectionName.toLowerCase()]++;
  }

  // Helper method to find a document by ID
  findById(collectionName, id) {
    const collection = this.collections[collectionName.toLowerCase()];
    return collection.find(doc => doc._id.toString() === id.toString());
  }
}

// Global in-memory MongoDB instance
const inMemoryMongoDB = new InMemoryMongoDB();

const connectMongoDB = async () => {
  try {
    // Use the DATABASE_URL environment variable if it exists and is a valid MongoDB URI
    if (process.env.DATABASE_URL && 
       (process.env.DATABASE_URL.startsWith('mongodb://') || 
        process.env.DATABASE_URL.startsWith('mongodb+srv://'))) {
      try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to MongoDB database');
        return true;
      } catch (error) {
        console.error('MongoDB connection error:', error);
        console.log('Falling back to in-memory storage');
      }
    } else {
      console.log('No valid MongoDB URI found. Using in-memory storage for development');
    }
    
    // Set up global MongoDB reference for in-memory storage when no connection is available
    global.inMemoryMongoDB = inMemoryMongoDB;
    return true;
    
  } catch (error) {
    console.error('MongoDB setup error:', error);
    return false;
  }
};

export { connectMongoDB };