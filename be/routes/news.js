const express = require('express');
const { News } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();
const SORT_FIELDS = new Set(['publishedAt', 'title', 'category', 'viewCount', 'createdAt']);

// Get all news articles
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      featured,
      published = true,
      search,
      sortBy = 'publishedAt',
      sortOrder = 'DESC',
      exclude
    } = req.query;

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const safeSortBy = SORT_FIELDS.has(sortBy) ? sortBy : 'publishedAt';
    const safeSortOrder = String(sortOrder).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (safePage - 1) * safeLimit;
    const whereClause = {};

    // Filter by published status
    if (published !== undefined) {
      whereClause.isPublished = published === 'true';
    }

    // Filter by category
    if (category) {
      whereClause.category = category;
    }

    // Filter by featured status
    if (featured !== undefined) {
      whereClause.isFeatured = featured === 'true';
    }

    // Exclude specific article (for related news)
    if (exclude) {
      whereClause.id = { [Op.ne]: parseInt(exclude) };
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } }
      ];
    }

    const news = await News.findAndCountAll({
      where: whereClause,
      order: [[safeSortBy, safeSortOrder]],
      limit: safeLimit,
      offset,
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });

    res.json({
      success: true,
      data: news.rows,
      pagination: {
        currentPage: safePage,
        totalPages: Math.ceil(news.count / safeLimit),
        totalItems: news.count,
        itemsPerPage: safeLimit
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching news articles',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get latest news (for homepage/resources)
router.get('/latest', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const news = await News.findAll({
      where: {
        isPublished: true
      },
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit),
      attributes: {
        exclude: ['content', 'createdAt', 'updatedAt']
      }
    });

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching latest news:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest news',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get featured news
router.get('/featured', async (req, res) => {
  try {
    const { limit = 3 } = req.query;

    const news = await News.findAll({
      where: {
        isPublished: true,
        isFeatured: true
      },
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit),
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching featured news:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured news',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get news categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await News.findAll({
      attributes: ['category'],
      where: {
        isPublished: true
      },
      group: ['category'],
      raw: true
    });

    const categoryList = categories.map(item => item.category);

    res.json({
      success: true,
      data: categoryList
    });
  } catch (error) {
    console.error('Error fetching news categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching news categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single news article by ID or slug
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let whereClause;

    // Check if identifier is numeric (ID) or string (slug)
    if (/^\d+$/.test(identifier)) {
      whereClause = { id: parseInt(identifier) };
    } else {
      whereClause = { slug: identifier };
    }

    // Only show published articles
    whereClause.isPublished = true;

    const news = await News.findOne({
      where: whereClause,
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });

    if (!news) {
      return res.status(404).json({
        success: false,
        message: 'News article not found'
      });
    }

    // Increment view count
    await news.increment('viewCount');

    res.json({
      success: true,
      data: news
    });
  } catch (error) {
    console.error('Error fetching news article:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching news article',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
