const express = require('express');
const { Course } = require('../models');
const { Op } = require('sequelize');

const router = express.Router();
const SORT_FIELDS = new Set(['sortOrder', 'publishedAt', 'title', 'price', 'startDate', 'createdAt']);

// Get all courses
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      level,
      featured,
      published = 'true',
      active = 'true',
      search,
      sortBy = 'sortOrder',
      sortOrder = 'ASC'
    } = req.query;

    const safePage = Math.max(1, parseInt(page, 10) || 1);
    const safeLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const safeSortBy = SORT_FIELDS.has(sortBy) ? sortBy : 'sortOrder';
    const safeSortOrder = String(sortOrder).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    const offset = (safePage - 1) * safeLimit;
    const whereClause = {};

    // Filter by published status
    if (published !== undefined) {
      whereClause.isPublished = published === 'true';
    }

    // Filter by active status
    if (active !== undefined) {
      whereClause.isActive = active === 'true';
    }

    // Filter by category
    if (category) {
      whereClause.category = category;
    }

    // Filter by level
    if (level) {
      whereClause.level = level;
    }

    // Filter by featured status
    if (featured !== undefined) {
      whereClause.isFeatured = featured === 'true';
    }

    // Search functionality
    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Determine sort order
    let orderClause;
    if (safeSortBy === 'sortOrder') {
      orderClause = [['sortOrder', 'ASC'], ['publishedAt', 'DESC']];
    } else {
      orderClause = [[safeSortBy, safeSortOrder]];
    }

    const courses = await Course.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: safeLimit,
      offset,
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });

    res.json({
      success: true,
      data: courses.rows,
      pagination: {
        currentPage: safePage,
        totalPages: Math.ceil(courses.count / safeLimit),
        totalItems: courses.count,
        itemsPerPage: safeLimit
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get featured courses
router.get('/featured', async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const courses = await Course.findAll({
      where: {
        isPublished: true,
        isActive: true,
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
      data: courses
    });
  } catch (error) {
    console.error('Error fetching featured courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured courses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get courses for resources page
router.get('/workshops', async (req, res) => {
  try {
    const { limit = 4 } = req.query;

    const courses = await Course.findAll({
      where: {
        isPublished: true,
        isActive: true
      },
      order: [['sortOrder', 'ASC'], ['publishedAt', 'DESC']],
      limit: parseInt(limit),
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });

    res.json({
      success: true,
      data: courses
    });
  } catch (error) {
    console.error('Error fetching workshop courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching workshop courses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get course categories
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await Course.findAll({
      attributes: ['category'],
      where: {
        isPublished: true,
        isActive: true
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
    console.error('Error fetching course categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course categories',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get course levels
router.get('/meta/levels', async (req, res) => {
  try {
    const levels = await Course.findAll({
      attributes: ['level'],
      where: {
        isPublished: true,
        isActive: true
      },
      group: ['level'],
      raw: true
    });

    const levelList = levels.map(item => item.level);

    res.json({
      success: true,
      data: levelList
    });
  } catch (error) {
    console.error('Error fetching course levels:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course levels',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get single course by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findOne({
      where: {
        id: parseInt(id),
        isPublished: true
      },
      attributes: {
        exclude: ['createdAt', 'updatedAt']
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    res.json({
      success: true,
      data: course
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
