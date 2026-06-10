const express = require('express');
const router = express.Router();
const { Vehicle, Accessory } = require('../models');

// GET /api/dealers - Get all dealers from both vehicles and accessories
router.get('/', async (req, res) => {
  try {
    // Get dealers from vehicles using raw SQL
    const vehicleDealersResult = await Vehicle.sequelize.query(
      "SELECT DISTINCT(dealer->>'name') AS dealerName FROM vehicles WHERE dealer->>'name' IS NOT NULL ORDER BY dealer->>'name' ASC",
      { type: Vehicle.sequelize.QueryTypes.SELECT }
    );
    const vehicleDealers = vehicleDealersResult.map(item => item.dealername).filter(dealer => dealer);

    // Get dealers from accessories
    const accessories = await Accessory.findAll({
      attributes: ['dealer']
    });
    const accessoryDealers = new Set();
    accessories.forEach(accessory => {
      if (accessory.dealer && accessory.dealer.name) {
        accessoryDealers.add(accessory.dealer.name);
      }
    });
    const accessoryDealersList = Array.from(accessoryDealers);

    // Combine and deduplicate dealers
    const allDealers = [...new Set([...vehicleDealers, ...accessoryDealersList])].sort();

    res.json({
      success: true,
      data: allDealers,
      meta: {
        totalDealers: allDealers.length,
        vehicleDealers: vehicleDealers.length,
        accessoryDealers: accessoryDealersList.length
      }
    });
  } catch (error) {
    console.error('Error fetching dealers:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/dealers/vehicles - Get dealers from vehicles only
router.get('/vehicles', async (req, res) => {
  try {
    const dealersResult = await Vehicle.sequelize.query(
      "SELECT DISTINCT(dealer->>'name') AS dealerName FROM vehicles WHERE dealer->>'name' IS NOT NULL ORDER BY dealer->>'name' ASC",
      { type: Vehicle.sequelize.QueryTypes.SELECT }
    );
    const dealers = dealersResult.map(item => item.dealername).filter(dealer => dealer);

    res.json({
      success: true,
      data: dealers,
      meta: {
        totalDealers: dealers.length
      }
    });
  } catch (error) {
    console.error('Error fetching vehicle dealers:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /api/dealers/accessories - Get dealers from accessories only
router.get('/accessories', async (req, res) => {
  try {
    const accessories = await Accessory.findAll({
      attributes: ['dealer']
    });
    const dealers = new Set();
    accessories.forEach(accessory => {
      if (accessory.dealer && accessory.dealer.name) {
        dealers.add(accessory.dealer.name);
      }
    });
    const dealersList = Array.from(dealers).sort();

    res.json({
      success: true,
      data: dealersList,
      meta: {
        totalDealers: dealersList.length
      }
    });
  } catch (error) {
    console.error('Error fetching accessory dealers:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;