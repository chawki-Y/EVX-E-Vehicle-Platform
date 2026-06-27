const {
  Accessory,
  User,
  UserItemLike,
  Vehicle,
  sequelize,
  testConnection
} = require('../models');
const { accessories } = require('../data/accessories');
const { vehicles } = require('../data/vehicles');

async function seedCatalog() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Catalog seeding is disabled in production.');
  }

  await testConnection();

  await sequelize.transaction(async transaction => {
    await UserItemLike.destroy({ where: {}, transaction });
    await Vehicle.destroy({ where: {}, transaction });
    await Accessory.destroy({ where: {}, transaction });
    await User.destroy({ where: {}, transaction });

    await User.create({
      id: 1,
      name: 'EVX Guest User',
      email: 'guest@evx.local'
    }, { transaction });

    const cleanVehicles = vehicles.map(({ isLiked, ...vehicle }) => vehicle);
    const cleanAccessories = accessories.map(({ isLiked, ...accessory }) => accessory);

    await Vehicle.bulkCreate(cleanVehicles, { validate: true, transaction });
    await Accessory.bulkCreate(cleanAccessories, { validate: true, transaction });
  });

  const [vehicleCount, accessoryCount] = await Promise.all([
    Vehicle.count(),
    Accessory.count()
  ]);

  console.log(`Seeded ${vehicleCount} vehicles, ${accessoryCount} accessories, and 1 guest user.`);
}

if (require.main === module) {
  seedCatalog()
    .then(() => sequelize.close())
    .catch(async error => {
      console.error('Catalog seeding failed:', error);
      await sequelize.close();
      process.exitCode = 1;
    });
}

module.exports = seedCatalog;
