import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import express from 'express';

// Get current directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function log(message, source = "express") {
  console.log(`${new Date().toLocaleTimeString()} [${source}]`, message);
}

async function setupVite(app, server) {
  try {
    // Create Vite server in middleware mode
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          server,
        },
      },
      appType: 'spa',
    });

    // Use vite's connect instance as middleware
    app.use(vite.middlewares);

    log('Vite middleware set up successfully');
  } catch (err) {
    console.error('Error setting up Vite middleware:', err);
    throw err;
  }
}

function serveStatic(app) {
  const staticPath = path.join(__dirname, '../client/dist');
  app.use(express.static(staticPath));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
  
  log('Serving static files');
}

export { log, setupVite, serveStatic };