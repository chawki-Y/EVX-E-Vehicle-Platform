const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const vehicleRoutes = require('./routes/vehicles');
const accessoryRoutes = require('./routes/accessories');
const itemsRoutes = require('./routes/items');
const categoryRoutes = require('./routes/categories');
const dealersRoutes = require('./routes/dealers');
const likesRoutes = require('./routes/likes');
const itemLikesRoutes = require('./routes/item-likes');
const newsRoutes = require('./routes/news');
const videosRoutes = require('./routes/videos');
const coursesRoutes = require('./routes/courses');
const { testConnection, syncDatabase } = require('./models');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000', 'http://168.231.106.100:4200'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/accessories', accessoryRoutes);
app.use('/api/items', itemsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/dealers', dealersRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/item-likes', itemLikesRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/courses', coursesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'EVX Backend API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} does not exist`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Initialize database and start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Sync database (create tables if they don't exist)
    await syncDatabase();

    // Start server
    app.listen(PORT, () => {
      console.log(`🚗 EVX Backend API is running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔗 Vehicles API: http://localhost:${PORT}/api/vehicles`);
      console.log(`🔧 Accessories API: http://localhost:${PORT}/api/accessories`);
      console.log(`📦 Combined Items API: http://localhost:${PORT}/api/items`);
      console.log(`🏪 Dealers API: http://localhost:${PORT}/api/dealers`);
      console.log(`❤️  Item Likes API: http://localhost:${PORT}/api/item-likes`);
      console.log(`📰 News API: http://localhost:${PORT}/api/news`);
      console.log(`🎥 Videos API: http://localhost:${PORT}/api/videos`);
      console.log(`🎓 Courses API: http://localhost:${PORT}/api/courses`);
      console.log(`🗄️  Database: Connected and synchronized`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
