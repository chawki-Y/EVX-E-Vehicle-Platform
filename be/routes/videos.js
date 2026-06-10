const express = require('express');
const { Video } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();

// Get all videos
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      featured,
      published = true,
      search,
      sortBy = 'sortOrder',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
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

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Determine sort order
    let orderClause;
    if (sortBy === 'sortOrder') {
      orderClause = [['sortOrder', 'ASC'], ['publishedAt', 'DESC']];
    } else {
      orderClause = [[sortBy, sortOrder.toUpperCase()]];
    }

    const videos = await Video.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });

    res.json({
      success: true,
      data: videos.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(videos.count / limit),
        totalItems: videos.count,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching videos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get featured videos
router.get('/featured', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const videos = await Video.findAll({
      where: {
        isPublished: true,
        isFeatured: true
      },
      order: [['sortOrder', 'ASC'], ['publishedAt', 'DESC']],
      limit: parseInt(limit),
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching featured videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured videos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get videos for tutorials/resources page
router.get('/tutorials', async (req, res) => {
  try {
    const { limit = 6 } = req.query;

    const videos = await Video.findAll({
      where: {
        isPublished: true
      },
      order: [['sortOrder', 'ASC'], ['publishedAt', 'DESC']],
      limit: parseInt(limit),
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });

    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching tutorial videos:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tutorial videos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get video categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Video.findAll({
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
    console.error('Error fetching video categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching video categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single video by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const video = await Video.findOne({
      where: {
        id: parseInt(id),
        isPublished: true
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    // Increment view count
    await video.increment('viewCount');

    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching video',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;