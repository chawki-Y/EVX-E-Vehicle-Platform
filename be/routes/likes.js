const express = require('express');
const { Vehicle, User, UserVehicleLike } = require('../models');
const router = express.Router();

// Get user's liked vehicles
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get liked vehicles with pagination
    const likedVehicles = await UserVehicleLike.findAll({
      where: { userId },
      include: [{
        model: Vehicle,
        as: 'vehicle'
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['likedAt', 'DESC']]
    });

    const totalLikes = await UserVehicleLike.count({ where: { userId } });

    // Transform the data to match expected format
    const vehicles = likedVehicles.map(like => ({
      ...like.vehicle.toJSON(),
      likedAt: like.likedAt
    }));

    res.json({
      vehicles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalLikes,
        pages: Math.ceil(totalLikes / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching liked vehicles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle like for a vehicle
router.post('/toggle', async (req, res) => {
  try {
    const { userId, vehicleId } = req.body;

    if (!userId || !vehicleId) {
      return res.status(400).json({ error: 'userId and vehicleId are required' });
    }

    // Check if user exists (create if not exists for simplicity)
    let user = await User.findByPk(userId);
    if (!user) {
      user = await User.create({ id: userId });
    }

    // Check if vehicle exists
    const vehicle = await Vehicle.findByPk(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check if like already exists
    const existingLike = await UserVehicleLike.findOne({
      where: { userId, vehicleId }
    });

    if (existingLike) {
      // Unlike - remove the like
      await existingLike.destroy();
      res.json({ success: true, isLiked: false, message: 'Vehicle unliked successfully' });
    } else {
      // Like - create new like
      await UserVehicleLike.create({ userId, vehicleId });
      res.json({ success: true, isLiked: true, message: 'Vehicle liked successfully' });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user likes a specific vehicle
router.get('/check/:userId/:vehicleId', async (req, res) => {
  try {
    const { userId, vehicleId } = req.params;

    const like = await UserVehicleLike.findOne({
      where: { userId, vehicleId }
    });

    res.json({ isLiked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get like status for multiple vehicles for a user
router.post('/check-multiple', async (req, res) => {
  try {
    const { userId, vehicleIds } = req.body;

    if (!userId || !Array.isArray(vehicleIds)) {
      return res.status(400).json({ error: 'userId and vehicleIds array are required' });
    }

    const likes = await UserVehicleLike.findAll({
      where: {
        userId,
        vehicleId: vehicleIds
      },
      attributes: ['vehicleId']
    });

    const likedVehicleIds = likes.map(like => like.vehicleId);
    const likeStatus = {};
    
    vehicleIds.forEach(id => {
      likeStatus[id] = likedVehicleIds.includes(id);
    });

    res.json(likeStatus);
  } catch (error) {
    console.error('Error checking multiple like statuses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;