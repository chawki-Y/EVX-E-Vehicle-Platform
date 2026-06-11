const express = require('express');
const { Op } = require('sequelize');
const { Vehicle, Accessory, User, UserItemLike, sequelize } = require('../models');

const router = express.Router();
const ITEM_TYPES = new Set(['vehicle', 'accessory']);

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function validUserId(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

async function findItem(itemType, itemId, transaction) {
  const model = itemType === 'vehicle' ? Vehicle : Accessory;
  return model.findByPk(itemId, { transaction });
}

router.get('/user/:userId', async (req, res, next) => {
  try {
    const userId = validUserId(req.params.userId);
    if (!userId) {
      return res.status(400).json({ success: false, error: 'A valid userId is required' });
    }

    const page = positiveInteger(req.query.page, 1);
    const limit = Math.min(positiveInteger(req.query.limit, 10), 100);
    const type = req.query.type;
    if (type && !ITEM_TYPES.has(type)) {
      return res.status(400).json({ success: false, error: 'Invalid item type' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.json({
        items: [],
        pagination: { page, limit, total: 0, pages: 0 }
      });
    }

    const where = { userId };
    if (type) {
      where.itemType = type;
    }

    const { count, rows: likes } = await UserItemLike.findAndCountAll({
      where,
      limit,
      offset: (page - 1) * limit,
      order: [['likedAt', 'DESC']]
    });

    const items = (await Promise.all(likes.map(async like => {
      const item = await findItem(like.itemType, like.itemId);
      return item
        ? { ...item.toJSON(), type: like.itemType, likedAt: like.likedAt }
        : null;
    }))).filter(Boolean);

    return res.json({
      items,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/toggle', async (req, res, next) => {
  const userId = validUserId(req.body.userId);
  const { itemId, itemType } = req.body;

  if (!userId || itemId === undefined || itemId === null || !ITEM_TYPES.has(itemType)) {
    return res.status(400).json({
      success: false,
      error: 'Valid userId, itemId, and itemType are required'
    });
  }

  let transaction;
  try {
    transaction = await sequelize.transaction();
    const item = await findItem(itemType, itemId, transaction);
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ success: false, error: `${itemType} not found` });
    }

    await User.findOrCreate({
      where: { id: userId },
      defaults: { id: userId },
      transaction
    });

    const where = { userId, itemId: String(itemId), itemType };
    const existingLike = await UserItemLike.findOne({ where, transaction, lock: transaction.LOCK.UPDATE });

    if (existingLike) {
      await existingLike.destroy({ transaction });
      await transaction.commit();
      return res.json({ success: true, isLiked: false, message: `${itemType} unliked successfully` });
    }

    await UserItemLike.create(where, { transaction });
    await transaction.commit();
    return res.json({ success: true, isLiked: true, message: `${itemType} liked successfully` });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    return next(error);
  }
});

router.get('/check/:userId/:itemType/:itemId', async (req, res, next) => {
  try {
    const userId = validUserId(req.params.userId);
    const { itemType, itemId } = req.params;
    if (!userId || !ITEM_TYPES.has(itemType)) {
      return res.status(400).json({ success: false, error: 'Invalid user or item type' });
    }

    const like = await UserItemLike.findOne({
      where: { userId, itemId: String(itemId), itemType }
    });
    return res.json({ isLiked: Boolean(like) });
  } catch (error) {
    return next(error);
  }
});

router.post('/check-multiple', async (req, res, next) => {
  try {
    const userId = validUserId(req.body.userId);
    const items = req.body.items;
    if (!userId || !Array.isArray(items) || items.length > 100) {
      return res.status(400).json({ success: false, error: 'Valid userId and up to 100 items are required' });
    }

    const validItems = items.every(item =>
      item &&
      item.id !== undefined &&
      item.id !== null &&
      ITEM_TYPES.has(item.type)
    );
    if (!validItems) {
      return res.status(400).json({ success: false, error: 'Each item requires a valid id and type' });
    }

    if (items.length === 0) {
      return res.json({});
    }

    const likes = await UserItemLike.findAll({
      where: {
        userId,
        [Op.or]: items.map(item => ({
          itemId: String(item.id),
          itemType: item.type
        }))
      },
      attributes: ['itemId', 'itemType']
    });
    const likedKeys = new Set(likes.map(like => `${like.itemType}_${like.itemId}`));

    const status = Object.fromEntries(
      items.map(item => {
        const key = `${item.type}_${item.id}`;
        return [key, likedKeys.has(key)];
      })
    );

    return res.json(status);
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
