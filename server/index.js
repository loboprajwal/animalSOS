import express from 'express';
import { registerRoutes } from './routes.js';
import { connectMongoDB } from './mongodb.js';
import { log, setupVite, serveStatic } from './vite.js';

async function main() {
  // Set up Express
  const app = express();
  app.use(express.json());
  
  // Connect to MongoDB
  await connectMongoDB();

  // Set up Vite for development or serve static files for production
  if (process.env.NODE_ENV === 'development') {
    const server = await registerRoutes(app);
    await setupVite(app, server);
    
    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      log(`serving on port ${port}`);
    });
  } else {
    serveStatic(app);
    const server = await registerRoutes(app);
    
    const port = process.env.PORT || 3000;
    server.listen(port, () => {
      log(`serving on port ${port}`);
    });
  }
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});