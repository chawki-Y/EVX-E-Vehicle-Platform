const express = require('express');
const router = express.Router();
const { Vehicle, UserVehicleLike } = require('../models');
const { Op } = require('sequelize');

// Helper function to build Sequelize where clause from filters
function buildWhereClause(filters) {
  const where = {};

  // Price filter
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    where.price = {};
    if (filters.priceMin !== undefined) where.price[Op.gte] = filters.priceMin;
    if (filters.priceMax !== undefined) where.price[Op.lte] = filters.priceMax;
  }

  // Range filter
  if (filters.rangeMin !== undefined || filters.rangeMax !== undefined) {
    where.range = {};
    if (filters.rangeMin !== undefined) where.range[Op.gte] = filters.rangeMin;
    if (filters.rangeMax !== undefined) where.range[Op.lte] = filters.rangeMax;
  }

  // Condition filter
  if (filters.conditions && filters.conditions.length > 0) {
    where.condition = { [Op.in]: filters.conditions };
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

  // Year filter
  if (filters.yearMin !== undefined || filters.yearMax !== undefined) {
    where.year = {};
    if (filters.yearMin !== undefined) where.year[Op.gte] = filters.yearMin;
    if (filters.yearMax !== undefined) where.year[Op.lte] = filters.yearMax;
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

  // Electric filter
  if (filters.isElectric !== undefined) {
    where.isElectric = filters.isElectric;
  }

  return where;
}

// Helper function to add like status to vehicles
async function addLikeStatus(vehicles, userId) {
  if (!userId || !vehicles.length) {
    return vehicles.map(vehicle => ({
      ...vehicle.toJSON(),
      isLiked: false
    }));
  }

  const vehicleIds = vehicles.map(v => v.id);
  const likes = await UserVehicleLike.findAll({
    where: {
      userId,
      vehicleId: vehicleIds
    },
    attributes: ['vehicleId']
  });

  const likedVehicleIds = new Set(likes.map(like => like.vehicleId));

  return vehicles.map(vehicle => ({
    ...vehicle.toJSON(),
    isLiked: likedVehicleIds.has(vehicle.id)
  }));
}

// Helper function to build Sequelize order clause
function buildOrderClause(sortBy) {
  switch (sortBy) {
    case 'price_asc':
      return [['price', 'ASC']];
    case 'price_desc':
      return [['price', 'DESC']];
    case 'range_asc':
      return [['range', 'ASC']];
    case 'range_desc':
      return [['range', 'DESC']];
    case 'rating_desc':
      return [['rating', 'DESC']];
    case 'rating_asc':
      return [['rating', 'ASC']];
    case 'year_desc':
      return [['year', 'DESC']];
    case 'year_asc':
      return [['year', 'ASC']];
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

// GET /api/vehicles - Get all vehicles with filtering, sorting, and pagination
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
      rangeMin,
      rangeMax,
      conditions,
      categories,
      brands,
      yearMin,
      yearMax,
      search,
      isElectric,
      dealers,

      // Sorting
      sortBy = 'name_asc'
    } = req.query;

    // Parse filters
    const filters = {
      priceMin: priceMin ? parseFloat(priceMin) : undefined,
      priceMax: priceMax ? parseFloat(priceMax) : undefined,
      rangeMin: rangeMin ? parseInt(rangeMin) : undefined,
      rangeMax: rangeMax ? parseInt(rangeMax) : undefined,
      conditions: conditions ? conditions.split(',') : undefined,
      categories: categories ? categories.split(',') : undefined,
      brands: brands ? brands.split(',') : undefined,
      yearMin: yearMin ? parseInt(yearMin) : undefined,
      yearMax: yearMax ? parseInt(yearMax) : undefined,
      search: search || undefined,
      dealers: dealers ? dealers.split(',') : undefined,
      isElectric: isElectric !== undefined ? isElectric === 'true' : undefined
    };

    // Build query options
    const queryOptions = {
      where: buildWhereClause(filters),
      order: buildOrderClause(sortBy),
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    };

    // Execute query
    const { count, rows: vehicles } = await Vehicle.findAndCountAll(queryOptions);

    // Add like status to vehicles
    const vehiclesWithLikes = await addLikeStatus(vehicles, userId);

    // Build pagination info
    const totalPages = Math.ceil(count / parseInt(limit));
    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems: count,
      itemsPerPage: parseInt(limit),
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1
    };

    res.json({
      success: true,
      data: vehiclesWithLikes,
      pagination,
      filters,
      sortBy
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/vehicles/hero - Get latest arrival vehicles for hero section
router.get('/hero', async (req, res) => {
  try {
    const { userId } = req.query;

    // Get the latest arrivals - newest vehicles by year and creation date
    const heroVehicles = await Vehicle.findAll({
      where: {
        // Optionally filter for electric vehicles or specific conditions
        isElectric: true
      },
      order: [
        ['year', 'DESC'],        // Newest model year first
        ['createdAt', 'DESC'],   // Most recently added to database
        ['rating', 'DESC']       // Highest rated among same year
      ],
      limit: 5  // Show more latest arrivals in the slideshow
    });

    // Add like status to vehicles
    const heroVehiclesWithLikes = await addLikeStatus(heroVehicles, userId);

    res.json({
      success: true,
      data: heroVehiclesWithLikes
    });
  } catch (error) {
    console.error('Error fetching hero vehicles:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/vehicles/featured - Get featured vehicles
router.get('/featured', async (req, res) => {
  try {
    const { userId } = req.query;

    const featuredVehicles = await Vehicle.findAll({
      where: {
        badge: {
          [Op.ne]: null
        }
      },
      order: [['rating', 'DESC']],
      limit: 6
    });

    // Add like status to vehicles
    const featuredVehiclesWithLikes = await addLikeStatus(featuredVehicles, userId);

    res.json({
      success: true,
      data: featuredVehiclesWithLikes
    });
  } catch (error) {
    console.error('Error fetching featured vehicles:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/vehicles/search/suggestions - Get search suggestions
router.get('/search/suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }

    const searchLower = q.toLowerCase();

    // Get vehicle name suggestions
    const vehicles = await Vehicle.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchLower}%` } },
          { brand: { [Op.iLike]: `%${searchLower}%` } }
        ]
      },
      attributes: ['name', 'brand'],
      limit: 5
    });

    const suggestions = vehicles.map(v => ({
      type: 'vehicle',
      value: v.name,
      label: `${v.brand} ${v.name}`
    }));

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/vehicles/stats/summary - Get vehicle statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const totalVehicles = await Vehicle.count();
    const totalBrands = await Vehicle.count({
      distinct: true,
      col: 'brand'
    });
    const totalCategories = await Vehicle.count({
      distinct: true,
      col: 'category'
    });
    const averagePrice = await Vehicle.findOne({
      attributes: [
        [Vehicle.sequelize.fn('AVG', Vehicle.sequelize.col('price')), 'avgPrice']
      ]
    });

    res.json({
      success: true,
      data: {
        totalVehicles,
        totalBrands,
        totalCategories,
        averagePrice: Math.round(parseFloat(averagePrice.dataValues.avgPrice) || 0)
      }
    });
  } catch (error) {
    console.error('Error fetching vehicle statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/vehicles/:id - Get single vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query;

    const vehicle = await Vehicle.findByPk(id);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found',
        message: `Vehicle with ID ${id} does not exist`
      });
    }

    // Add like status to vehicle
    const [vehicleWithLike] = await addLikeStatus([vehicle], userId);

    res.json({
      success: true,
      data: vehicleWithLike
    });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
