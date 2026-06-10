const express = require('express');
const { Vehicle, Accessory, User, UserItemLike } = require('../models');
const router = express.Router();

// Get user's liked items (both vehicles and accessories)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, type } = req.query;
    const offset = (page - 1) * limit;

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Build where clause
    const whereClause = { userId };
    if (type && ['vehicle', 'accessory'].includes(type)) {
      whereClause.itemType = type;
    }

    // Get liked items with pagination
    const likedItems = await UserItemLike.findAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['likedAt', 'DESC']]
    });

    const totalLikes = await UserItemLike.count({ where: whereClause });

    // Fetch actual item data
    const items = [];
    for (const like of likedItems) {
      let item = null;
      if (like.itemType === 'vehicle') {
        // Convert to number for vehicle lookup
        item = await Vehicle.findByPk(parseInt(like.itemId));
      } else if (like.itemType === 'accessory') {
        // Keep as string for accessory lookup
        item = await Accessory.findByPk(like.itemId);
      }
      
      if (item) {
        items.push({
          ...item.toJSON(),
          type: like.itemType,
          likedAt: like.likedAt
        });
      }
    }

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalLikes,
        pages: Math.ceil(totalLikes / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching liked items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle like for an item (vehicle or accessory)
router.post('/toggle', async (req, res) => {
  try {
    const { userId, itemId, itemType } = req.body;

    if (!userId || !itemId || !itemType) {
      return res.status(400).json({ error: 'userId, itemId, and itemType are required' });
    }

    if (!['vehicle', 'accessory'].includes(itemType)) {
      return res.status(400).json({ error: 'itemType must be either "vehicle" or "accessory"' });
    }

    // Check if user exists (create if not exists for simplicity)
    let user = await User.findByPk(userId);
    if (!user) {
      user = await User.create({ id: userId });
    }

    // Check if item exists
    let item = null;
    if (itemType === 'vehicle') {
      // Convert to number for vehicle lookup
      item = await Vehicle.findByPk(parseInt(itemId));
    } else if (itemType === 'accessory') {
      // Keep as string for accessory lookup
      item = await Accessory.findByPk(itemId.toString());
    }

    if (!item) {
      return res.status(404).json({ error: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} not found` });
    }

    // Check if like already exists
    const existingLike = await UserItemLike.findOne({
      where: { userId, itemId: itemId.toString(), itemType }
    });

    if (existingLike) {
      // Unlike - remove the like
      await existingLike.destroy();
      res.json({ success: true, isLiked: false, message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} unliked successfully` });
    } else {
      // Like - create new like
      await UserItemLike.create({ userId, itemId: itemId.toString(), itemType });
      res.json({ success: true, isLiked: true, message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} liked successfully` });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user likes a specific item
router.get('/check/:userId/:itemType/:itemId', async (req, res) => {
  try {
    const { userId, itemType, itemId } = req.params;

    if (!['vehicle', 'accessory'].includes(itemType)) {
      return res.status(400).json({ error: 'itemType must be either "vehicle" or "accessory"' });
    }

    const like = await UserItemLike.findOne({
      where: { userId, itemId: itemId.toString(), itemType }
    });

    res.json({ isLiked: !!like });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get like status for multiple items for a user
router.post('/check-multiple', async (req, res) => {
  try {
    const { userId, items } = req.body;

    if (!userId || !Array.isArray(items)) {
      return res.status(400).json({ error: 'userId and items array are required' });
    }

    // Validate items format: [{ id: string|number, type: 'vehicle'|'accessory' }]
    for (const item of items) {
      if (!item.id || !item.type || !['vehicle', 'accessory'].includes(item.type)) {
        return res.status(400).json({ error: 'Each item must have id and type (vehicle or accessory)' });
      }
    }

    const likes = await UserItemLike.findAll({
      where: {
        userId,
        [require('sequelize').Op.or]: items.map(item => ({
          itemId: item.id.toString(),
          itemType: item.type
        }))
      },
      attributes: ['itemId', 'itemType']
    });

    const likeStatus = {};
    
    items.forEach(item => {
      const key = `${item.type}_${item.id}`;
      likeStatus[key] = likes.some(like => 
        like.itemId === item.id.toString() && like.itemType === item.type
      );
    });

    res.json(likeStatus);
  } catch (error) {
    console.error('Error checking multiple like statuses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;