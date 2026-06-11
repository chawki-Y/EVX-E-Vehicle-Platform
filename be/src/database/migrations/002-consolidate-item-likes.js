module.exports = {
  name: '002-consolidate-item-likes',

  async up({ queryInterface, sequelize, transaction }) {
    const tables = (await queryInterface.showAllTables({ transaction }))
      .map(table => typeof table === 'string' ? table : table.tableName);

    if (!tables.includes('user_vehicle_likes') || !tables.includes('user_item_likes')) {
      return;
    }

    await sequelize.query(
      `INSERT INTO user_item_likes (user_id, item_id, item_type, liked_at)
       SELECT user_id, vehicle_id::text, 'vehicle', liked_at
       FROM user_vehicle_likes
       ON CONFLICT (user_id, item_id, item_type) DO NOTHING`,
      { transaction }
    );
  }
};
