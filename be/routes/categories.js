const express = require('express');
const router = express.Router();
const { Vehicle } = require('../models');
const { Op } = require('sequelize');

// GET /api/categories - Get all available categories
router.get('/', async (req, res) => {
  try {
    const categories = await Vehicle.findAll({
      attributes: [
        [Vehicle.sequelize.fn('DISTINCT', Vehicle.sequelize.col('category')), 'category']
      ],
      order: [['category', 'ASC']]
    });

    const categoryList = categories.map(item => item.category);

    res.json({
      success: true,
      data: categoryList
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/categories/brands - Get all available brands
router.get('/brands', async (req, res) => {
  try {
    const brands = await Vehicle.findAll({
      attributes: [
        [Vehicle.sequelize.fn('DISTINCT', Vehicle.sequelize.col('brand')), 'brand']
      ],
      order: [['brand', 'ASC']]
    });

    const brandList = brands.map(item => item.brand);

    res.json({
      success: true,
      data: brandList
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/categories/filters - Get all filter options
router.get('/filters', async (req, res) => {
  try {
    // Get categories from database
    const categoriesResult = await Vehicle.findAll({
      attributes: [
        [Vehicle.sequelize.fn('DISTINCT', Vehicle.sequelize.col('category')), 'category']
      ],
      order: [['category', 'ASC']]
    });
    const categories = categoriesResult.map(item => item.category);

    // Get brands from database
    const brandsResult = await Vehicle.findAll({
      attributes: [
        [Vehicle.sequelize.fn('DISTINCT', Vehicle.sequelize.col('brand')), 'brand']
      ],
      order: [['brand', 'ASC']]
    });
    const brands = brandsResult.map(item => item.brand);

    // Get dealers from database using raw SQL
    const dealersResult = await Vehicle.sequelize.query(
      "SELECT DISTINCT(dealer->>'name') AS dealerName FROM vehicles ORDER BY dealer->>'name' ASC",
      { type: Vehicle.sequelize.QueryTypes.SELECT }
    );
    const dealers = dealersResult.map(item => item.dealername).filter(dealer => dealer);

    const filterOptions = {
      categories: categories,
      brands: brands,
      dealers: dealers,
      conditions: ['new', 'used'],
      sortOptions: [
        { value: 'name_asc', label: 'Name (A-Z)' },
        { value: 'name_desc', label: 'Name (Z-A)' },
        { value: 'price_asc', label: 'Price (Low to High)' },
        { value: 'price_desc', label: 'Price (High to Low)' },
        { value: 'range_asc', label: 'Range (Low to High)' },
        { value: 'range_desc', label: 'Range (High to Low)' },
        { value: 'rating_desc', label: 'Rating (High to Low)' },
        { value: 'rating_asc', label: 'Rating (Low to High)' },
        { value: 'year_desc', label: 'Year (Newest First)' },
        { value: 'year_asc', label: 'Year (Oldest First)' },
        { value: 'reviews_desc', label: 'Most Reviewed' }
      ]
    };
    
    res.json({
      success: true,
      data: filterOptions
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;