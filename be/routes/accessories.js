const express = require('express');
const router = express.Router();
const { Accessory } = require('../models');
const { Op } = require('sequelize');
const { addItemLikeStatus } = require('../src/services/item-like-status');
const { parsePagination } = require('../src/utils/pagination');

// Helper function to build Sequelize where clause from filters
function buildWhereClause(filters) {
  const where = {};

  // Price filter
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    where.price = {};
    if (filters.priceMin !== undefined) where.price[Op.gte] = filters.priceMin;
    if (filters.priceMax !== undefined) where.price[Op.lte] = filters.priceMax;
  }

  // Category filter
  if (filters.categories && filters.categories.length > 0) {
    where.category = { [Op.in]: filters.categories };
  }

  // Brand filter
  if (filters.brands && filters.brands.length > 0) {
    where.brand = { [Op.in]: filters.brands };
  }

  // Dealer filter
  if (filters.dealers) {
    where[Op.and] = where[Op.and] || [];
    where[Op.and].push({
      [Op.or]: filters.dealers.map(dealer => ({
        dealer: {
          name: dealer
        }
      }))
    });
  }

  // Search query filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    where[Op.or] = [
      { name: { [Op.iLike]: `%${searchLower}%` } },
      { brand: { [Op.iLike]: `%${searchLower}%` } },
      { category: { [Op.iLike]: `%${searchLower}%` } }
    ];
  }

  return where;
}

// Helper function to build Sequelize order clause
function buildOrderClause(sortBy) {
  switch (sortBy) {
    case 'price_asc':
      return [['price', 'ASC']];
    case 'price_desc':
      return [['price', 'DESC']];
    case 'rating_desc':
      return [['rating', 'DESC']];
    case 'rating_asc':
      return [['rating', 'ASC']];
    case 'name_asc':
      return [['name', 'ASC']];
    case 'name_desc':
      return [['name', 'DESC']];
    case 'reviews_desc':
      return [['reviews', 'DESC']];
    default:
      return [['name', 'ASC']];
  }
}

// GET /api/accessories - Get all accessories with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      // Pagination
      page = 1,
      limit = 12,

      // User context
      userId,

      // Filters
      priceMin,
      priceMax,
      categories,
      brands,
      search,
      dealers,

      // Sorting
      sortBy = 'name_asc'
    } = req.query;

    // Parse filters
    const filters = {
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      categories: categories ? categories.split(',') : undefined,
      brands: brands ? brands.split(',') : undefined,
      search: search || undefined,
      dealers: dealers ? dealers.split(',') : undefined
    };
    const paginationInput = parsePagination(page, limit);

    // Build query options
    const queryOptions = {
      where: buildWhereClause(filters),
      order: buildOrderClause(sortBy),
      limit: paginationInput.limit,
      offset: paginationInput.offset
    };

    // Execute query
    const { count, rows: accessories } = await Accessory.findAndCountAll(queryOptions);

    // Add isLiked property (accessories don't have likes yet, but keeping consistent structure)
    const accessoriesWithLikes = await addItemLikeStatus(accessories, userId, 'accessory');

    // Build pagination info
    const totalPages = Math.ceil(count / paginationInput.limit);
    const pagination = {
      currentPage: paginationInput.page,
      totalPages,
      totalItems: count,
      itemsPerPage: paginationInput.limit,
      hasNextPage: paginationInput.page < totalPages,
      hasPrevPage: paginationInput.page > 1
    };

    res.json({
      success: true,
      data: accessoriesWithLikes,
      pagination,
      filters: {
        applied: filters,
        available: {
          categories: await getAvailableCategories(),
          brands: await getAvailableBrands(),
          dealers: await getAvailableDealers(),
          priceRange: await getPriceRange()
        }
      },
      sortBy
    });

  } catch (error) {
    console.error('Error fetching accessories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accessories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/accessories/featured - Get featured accessories
router.get('/featured', async (req, res) => {
  try {
    const { userId } = req.query;
    const featuredAccessories = await Accessory.findAll({
      where: {
        badge: {
          [Op.in]: ['BEST SELLER', 'TOP RATED', 'POPULAR']
        }
      },
      order: [['rating', 'DESC']],
      limit: 6
    });

    const accessoriesWithLikes = await addItemLikeStatus(featuredAccessories, userId, 'accessory');

    res.json({
      success: true,
      data: accessoriesWithLikes
    });

  } catch (error) {
    console.error('Error fetching featured accessories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured accessories',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/accessories/search/suggestions - Get search suggestions
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchTerm = q.toLowerCase();
    
    // Get unique suggestions from name, brand, and category
    const accessories = await Accessory.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { brand: { [Op.iLike]: `%${searchTerm}%` } },
          { category: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      attributes: ['name', 'brand', 'category'],
      limit: 20
    });

    const suggestions = new Set();
    
    accessories.forEach(accessory => {
      const { name, brand, category } = accessory;
      
      if (name.toLowerCase().includes(searchTerm)) {
        suggestions.add(name);
      }
      if (brand.toLowerCase().includes(searchTerm)) {
        suggestions.add(brand);
      }
      if (category.toLowerCase().includes(searchTerm)) {
        suggestions.add(category);
      }
    });

    res.json({
      success: true,
      data: Array.from(suggestions).slice(0, 10)
    });

  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch search suggestions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/accessories/stats/summary - Get accessories statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalAccessories = await Accessory.count();
    const avgPrice = await Accessory.findOne({
      attributes: [[Accessory.sequelize.fn('AVG', Accessory.sequelize.col('price')), 'avgPrice']]
    });
    const avgRating = await Accessory.findOne({
      attributes: [[Accessory.sequelize.fn('AVG', Accessory.sequelize.col('rating')), 'avgRating']]
    });
    const totalCategories = await Accessory.count({
      distinct: true,
      col: 'category'
    });

    res.json({
      success: true,
      data: {
        totalAccessories,
        averagePrice: parseFloat(avgPrice.dataValues.avgPrice || 0).toFixed(2),
        averageRating: parseFloat(avgRating.dataValues.avgRating || 0).toFixed(1),
        totalCategories
      }
    });

  } catch (error) {
    console.error('Error fetching accessories stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accessories statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// GET /api/accessories/:id - Get accessory by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const accessory = await Accessory.findByPk(id);

    if (!accessory) {
      return res.status(404).json({
        success: false,
        message: 'Accessory not found'
      });
    }

    const [accessoryWithLikes] = await addItemLikeStatus([accessory], userId, 'accessory');

    res.json({
      success: true,
      data: accessoryWithLikes
    });

  } catch (error) {
    console.error('Error fetching accessory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch accessory',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper functions
async function getAvailableCategories() {
  const categories = await Accessory.findAll({
    attributes: [[Accessory.sequelize.fn('DISTINCT', Accessory.sequelize.col('category')), 'category']],
    order: [['category', 'ASC']]
  });
  return categories.map(c => c.category);
}

async function getAvailableBrands() {
  const brands = await Accessory.findAll({
    attributes: [[Accessory.sequelize.fn('DISTINCT', Accessory.sequelize.col('brand')), 'brand']],
    order: [['brand', 'ASC']]
  });
  return brands.map(b => b.brand);
}

async function getAvailableDealers() {
  const accessories = await Accessory.findAll({
    attributes: ['dealer']
  });
  const dealers = new Set();
  accessories.forEach(accessory => {
    if (accessory.dealer && accessory.dealer.name) {
      dealers.add(accessory.dealer.name);
    }
  });
  return Array.from(dealers).sort();
}

async function getPriceRange() {
  const result = await Accessory.findOne({
    attributes: [
      [Accessory.sequelize.fn('MIN', Accessory.sequelize.col('price')), 'minPrice'],
      [Accessory.sequelize.fn('MAX', Accessory.sequelize.col('price')), 'maxPrice']
    ]
  });
  return {
    min: parseFloat(result.dataValues.minPrice || 0),
    max: parseFloat(result.dataValues.maxPrice || 0)
  };
}

module.exports = router;
