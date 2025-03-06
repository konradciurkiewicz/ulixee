const express = require('express');
require('dotenv').config(); // Load environment variables
const Hero = require('@ulixee/hero');
const { CloudNode } = require('@ulixee/cloud');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const CLOUD_PORT = process.env.CLOUD_PORT || 1818;
const API_KEY = process.env.API_KEY; // Get API key from environment variables

// Configure CloudNode options
const cloudNodeOptions = {
  port: CLOUD_PORT,
};

// If Docker environment with system Chrome, use it
if (process.env.ULIXEE_CHROME_EXECUTABLE_PATH) {
  console.log(`Using Chrome at: ${process.env.ULIXEE_CHROME_EXECUTABLE_PATH}`);
  cloudNodeOptions.coreServerOptions = {
    dataDir: '/home/ulixeeuser/Downloads',
  };
}

// Initialize CloudNode
const cloudNode = new CloudNode(cloudNodeOptions);

// Start CloudNode
(async () => {
  try {
    await cloudNode.listen();
    console.log(`CloudNode started on port ${await cloudNode.port}`);
  } catch (error) {
    console.error('ERROR starting Ulixee CloudNode', error);
    // Continue running the Express server even if CloudNode fails
  }
})();

// Enable CORS for all routes
app.use(cors());

// Middleware for parsing JSON
app.use(express.json());

// Add a health check endpoint for Docker
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Service is running',
    chromeExecutable: process.env.ULIXEE_CHROME_EXECUTABLE_PATH || 'Using npm package'
  });
});

// API Key validation middleware
const validateApiKey = (req, res, next) => {
  // Get API key from request header
  const apiKey = req.header('X-API-Key');
  
  // Check if API key is set in environment and matches the provided key
  if (!API_KEY) {
    console.warn('Warning: API_KEY is not set in environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized: Invalid API key' });
  }
  
  next();
};

// Ulixee Cloud endpoint with API key validation
app.post('/api/scrape', validateApiKey, async (req, res) => {
  try {
    console.time('start');
    // Get URL and server IP from request
    const { url, serverIp } = req.body;
    
    // Validate required parameters
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    console.timeEnd('start');
    
    console.time('new hero');

    // Initialize Hero with connection to Ulixee Cloud
    // Use the CloudNode port we established earlier
    const hero = new Hero({ 
      connectionToCore: `ws://localhost:${CLOUD_PORT}`
    });

    console.timeEnd('new hero');

    try {
      console.time('goto');

      // Navigate to the provided URL
      await hero.goto(url);
      console.timeEnd('goto');

      console.time('taking response');

      // Get page title and HTML content
      const title = await hero.document.title;
      const html = await hero.document.documentElement.innerHTML;
      
      // Close the hero session
      await hero.close();
      console.timeEnd('taking response');
      
      // Return the scraped data
      res.json({
        success: true,
        url,
        title,
        contentLength: html.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      // Close hero session if it was created
      try { 
        if (hero) await hero.close(); 
      } catch (e) {
        console.error('Error closing hero session:', e.message);
      }
      
      throw error;
    }
  } catch (error) {
    console.error('Scraping error:', error);
    
    // Provide more user-friendly error messages
    if (error.code === 'ECONNREFUSED') {
      res.status(503).json({
        success: false,
        error: 'Could not connect to Ulixee Cloud',
        details: 'Make sure the Ulixee CloudNode is running on the specified host and port',
        instructions: 'Check that the CloudNode was initialized and running correctly'
      });
    } else {
      res.status(500).json({
        success: false,
        error: error.message,
        errorType: error.constructor.name
      });
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API secured with API Key authentication`);
  console.log(`CloudNode should be available at ws://localhost:${CLOUD_PORT}`);
  if (process.env.ULIXEE_CHROME_EXECUTABLE_PATH) {
    console.log(`Using Chrome at: ${process.env.ULIXEE_CHROME_EXECUTABLE_PATH}`);
  }
});

// Graceful shutdown handling
process.on('SIGINT', async () => {
  console.log('Shutting down CloudNode and Express server...');
  try {
    await cloudNode.close();
    console.log('CloudNode shut down successfully');
  } catch (error) {
    console.error('Error shutting down CloudNode:', error);
  }
  process.exit(0);
});