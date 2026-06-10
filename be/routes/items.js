const express = require('express');
const router = express.Router();
const { Vehicle, Accessory } = require('../models');
const { Op } = require('sequelize');

// Helper function to build Sequelize where clause from filters for vehicles
function buildVehicleWhereClause(filters) {
  const where = {};

  // Price filter
  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    where.price = {};
    if (filters.priceMin !== undefined) where.price[Op.gte] = filters.priceMin;
    if (filters.priceMax !== undefined) where.price[Op.lte] = filters.priceMax;
  }

  // Range filter (vehicles only)
  if (filters.rangeMin !== undefined || filters.rangeMax !== undefined) {
    where.range = {};
    if (filters.rangeMin !== undefined) where.range[Op.gte] = filters.rangeMin;
    if (filters.rangeMax !== undefined) where.range[Op.lte] = filters.rangeMax;
  }

  // Condition filter (vehicles only)
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

  // Year filter (vehicles only)
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

  return where;
}

// Helper function to build Sequelize where clause from filters for accessories
function buildAccessoryWhereClause(filters) {
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

// Helper function to sort combined results
function sortCombinedResults(items, sortBy) {
  return items.sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price_desc':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'rating_desc':
        return parseFloat(b.rating) - parseFloat(a.rating);
      case 'rating_asc':
        return parseFloat(a.rating) - parseFloat(b.rating);
      case 'name_asc':
        return a.name.localeCompare(b.name);
      case 'name_desc':
        return b.name.localeCompare(a.name);
      case 'reviews_desc':
        return b.reviews - a.reviews;
      case 'year_desc':
        // Only vehicles have year, accessories go to end
        if (a.year && b.year) return b.year - a.year;
        if (a.year && !b.year) return -1;
        if (!a.year && b.year) return 1;
        return 0;
      case 'range_desc':
        // Only vehicles have range, accessories go to end
        if (a.range && b.range) return b.range - a.range;
        if (a.range && !b.range) return -1;
        if (!a.range && b.range) return 1;
        return 0;
      default:
        return a.name.localeCompare(b.name);
    }
  });
}

// GET /api/items - Get combined vehicles and accessories with filtering, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      // Pagination
      page = 1,
      limit = 12,

      // User context
      userId,

      // Type filter
      types = '', // Default to both

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

    const selectedTypes = types.split(',');
    let allItems = [];

    // Fetch vehicles if requested
    if (selectedTypes.includes('vehicles')) {
      const vehicleWhere = buildVehicleWhereClause(filters);

      // Add electric filter for vehicles
      if (filters.isElectric !== undefined) {
        vehicleWhere.isElectric = filters.isElectric;
      }

      const vehicles = await Vehicle.findAll({
        where: vehicleWhere
      });

      const vehiclesWithType = vehicles.map(vehicle => ({
        ...vehicle.toJSON(),
        type: 'vehicle',
        isLiked: false // TODO: Implement likes
      }));

      allItems = allItems.concat(vehiclesWithType);
    }

    // Fetch accessories if requested
    if (selectedTypes.includes('accessories')) {
      const accessoryWhere = buildAccessoryWhereClause(filters);

      const accessories = await Accessory.findAll({
        where: accessoryWhere
      });

      const accessoriesWithType = accessories.map(accessory => ({
        ...accessory.toJSON(),
        type: 'accessory',
        isLiked: false // TODO: Implement likes
      }));

      allItems = allItems.concat(accessoriesWithType);
    }

    // Sort combined results
    const sortedItems = sortCombinedResults(allItems, sortBy);

    // Apply pagination
    const totalItems = sortedItems.length;
    const totalPages = Math.ceil(totalItems / parseInt(limit));
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedItems = sortedItems.slice(startIndex, endIndex);

    // Build pagination info
    const pagination = {
      currentPage: parseInt(page),
      totalPages,
      totalItems,
      itemsPerPage: parseInt(limit),
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1
    };

    // Get available filter options
    const availableFilters = await getAvailableFilters(selectedTypes);

    res.json({
      success: true,
      data: paginatedItems,
      pagination,
      filters: {
        applied: filters,
        available: availableFilters
      }
    });

  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch items',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Helper function to get available filter options
async function getAvailableFilters(selectedTypes) {
  const filters = {
    categories: [],
    brands: [],
    dealers: [],
    conditions: [],
    priceRange: { min: 0, max: 0 },
    rangeRange: { min: 0, max: 0 },
    yearRange: { min: 0, max: 0 }
  };

  if (selectedTypes.includes('vehicles')) {
    // Get vehicle filters
    const vehicleCategories = await Vehicle.findAll({
      attributes: [[Vehicle.sequelize.fn('DISTINCT', Vehicle.sequelize.col('category')), 'category']],
      order: [['category', 'ASC']]
    });

    const vehicleBrands = await Vehicle.findAll({
      attributes: [[Vehicle.sequelize.fn('DISTINCT', Vehicle.sequelize.col('brand')), 'brand']],
      order: [['brand', 'ASC']]
    });

    const vehicleConditions = await Vehicle.findAll({
      attributes: [[Vehicle.sequelize.fn('DISTINCT', Vehicle.sequelize.col('condition')), 'condition']]
    });

    const vehiclePriceRange = await Vehicle.findOne({
      attributes: [
        [Vehicle.sequelize.fn('MIN', Vehicle.sequelize.col('price')), 'minPrice'],
        [Vehicle.sequelize.fn('MAX', Vehicle.sequelize.col('price')), 'maxPrice']
      ]
    });

    const vehicleRangeRange = await Vehicle.findOne({
      attributes: [
        [Vehicle.sequelize.fn('MIN', Vehicle.sequelize.col('range')), 'minRange'],
        [Vehicle.sequelize.fn('MAX', Vehicle.sequelize.col('range')), 'maxRange']
      ]
    });

    const vehicleYearRange = await Vehicle.findOne({
      attributes: [
        [Vehicle.sequelize.fn('MIN', Vehicle.sequelize.col('year')), 'minYear'],
        [Vehicle.sequelize.fn('MAX', Vehicle.sequelize.col('year')), 'maxYear']
      ]
    });

    filters.categories = filters.categories.concat(vehicleCategories.map(c => c.category));
    filters.brands = filters.brands.concat(vehicleBrands.map(b => b.brand));
    filters.conditions = vehicleConditions.map(c => c.condition);

    if (vehiclePriceRange.dataValues.minPrice) {
      filters.priceRange.min = Math.min(filters.priceRange.min || Infinity, parseFloat(vehiclePriceRange.dataValues.minPrice));
      filters.priceRange.max = Math.max(filters.priceRange.max, parseFloat(vehiclePriceRange.dataValues.maxPrice));
    }

    if (vehicleRangeRange.dataValues.minRange) {
      filters.rangeRange.min = parseFloat(vehicleRangeRange.dataValues.minRange);
      filters.rangeRange.max = parseFloat(vehicleRangeRange.dataValues.maxRange);
    }

    if (vehicleYearRange.dataValues.minYear) {
      filters.yearRange.min = parseInt(vehicleYearRange.dataValues.minYear);
      filters.yearRange.max = parseInt(vehicleYearRange.dataValues.maxYear);
    }
  }

  if (selectedTypes.includes('accessories')) {
    // Get accessory filters
    const accessoryCategories = await Accessory.findAll({
      attributes: [[Accessory.sequelize.fn('DISTINCT', Accessory.sequelize.col('category')), 'category']],
      order: [['category', 'ASC']]
    });

    const accessoryBrands = await Accessory.findAll({
      attributes: [[Accessory.sequelize.fn('DISTINCT', Accessory.sequelize.col('brand')), 'brand']],
      order: [['brand', 'ASC']]
    });

    const accessoryPriceRange = await Accessory.findOne({
      attributes: [
        [Accessory.sequelize.fn('MIN', Accessory.sequelize.col('price')), 'minPrice'],
        [Accessory.sequelize.fn('MAX', Accessory.sequelize.col('price')), 'maxPrice']
      ]
    });

    filters.categories = filters.categories.concat(accessoryCategories.map(c => c.category));
    filters.brands = filters.brands.concat(accessoryBrands.map(b => b.brand));

    if (accessoryPriceRange.dataValues.minPrice) {
      filters.priceRange.min = Math.min(filters.priceRange.min || Infinity, parseFloat(accessoryPriceRange.dataValues.minPrice));
      filters.priceRange.max = Math.max(filters.priceRange.max, parseFloat(accessoryPriceRange.dataValues.maxPrice));
    }
  }

  // Remove duplicates and sort
  filters.categories = [...new Set(filters.categories)].sort();
  filters.brands = [...new Set(filters.brands)].sort();

  return filters;
}

module.exports = router;
