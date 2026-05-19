const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Startup Check
if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
  console.error("❌ CRITICAL ERROR: MONGO_URI or JWT_SECRET is missing in .env file!");
  process.exit(1);
}

// Initialize Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Test Route
app.get('/api/test', (req, res) => {
  res.status(200).json({ 
    message: "LinguaAI Server is running ✅", 
    timestamp: new Date() 
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/translate', require('./routes/translationRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

const PORT = process.env.PORT || 9000;

app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
