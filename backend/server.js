import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/api.js';
import { seed } from './db/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
  origin: '*', // In production, replace with specific domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON request bodies
app.use(express.json());

// Main status route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Spartans Ayurvedic Diet Management Platform API is running.'
  });
});

// Register API routes
app.use('/api', apiRoutes);

// Database startup and Express listening
async function startServer() {
  try {
    // Run database migrations & seeding
    await seed();

    app.listen(PORT, () => {
      console.log(`==================================================`);
      console.log(`   SPARTANS AYURVEDIC BACKEND SERVER RUNNING`);
      console.log(`   URL: http://localhost:${PORT}`);
      console.log(`==================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
