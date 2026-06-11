const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const environment = require('./config/environment');
const { errorHandler, notFoundHandler } = require('./middleware/errors');

const routes = {
  vehicles: require('../routes/vehicles'),
  accessories: require('../routes/accessories'),
  items: require('../routes/items'),
  categories: require('../routes/categories'),
  dealers: require('../routes/dealers'),
  itemLikes: require('../routes/item-likes'),
  news: require('../routes/news'),
  videos: require('../routes/videos'),
  courses: require('../routes/courses')
};

function createApp() {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({
    origin(origin, callback) {
      if (!origin || environment.corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(Object.assign(new Error('Origin is not allowed by CORS'), { status: 403 }));
    },
    credentials: true
  }));
  app.use(morgan(environment.nodeEnv === 'production' ? 'combined' : 'dev'));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));

  app.get('/api/health', (req, res) => {
    res.json({
      status: 'OK',
      message: 'EVX Backend API is running',
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    });
  });

  app.use('/api/vehicles', routes.vehicles);
  app.use('/api/accessories', routes.accessories);
  app.use('/api/items', routes.items);
  app.use('/api/categories', routes.categories);
  app.use('/api/dealers', routes.dealers);
  app.use('/api/item-likes', routes.itemLikes);
  app.use('/api/news', routes.news);
  app.use('/api/videos', routes.videos);
  app.use('/api/courses', routes.courses);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
