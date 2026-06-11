const { Op } = require('sequelize');
const { UserItemLike } = require('../../models');

async function addItemLikeStatus(items, userId, itemType) {
  const normalizedItems = items.map(item =>
    typeof item.toJSON === 'function' ? item.toJSON() : item
  );

  if (!userId || normalizedItems.length === 0) {
    return normalizedItems.map(item => ({ ...item, isLiked: false }));
  }

  const itemIds = normalizedItems.map(item => String(item.id));
  const likes = await UserItemLike.findAll({
    where: {
      userId,
      itemType,
      itemId: { [Op.in]: itemIds }
    },
    attributes: ['itemId']
  });
  const likedIds = new Set(likes.map(like => String(like.itemId)));

  return normalizedItems.map(item => ({
    ...item,
    isLiked: likedIds.has(String(item.id))
  }));
}

module.exports = { addItemLikeStatus };
