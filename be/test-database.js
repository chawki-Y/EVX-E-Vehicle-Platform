const { Vehicle, sequelize, testConnection } = require('./models');

async function testDatabase() {
  try {
    await testConnection();
    console.log('Database connection succeeded');

    const vehicleCount = await Vehicle.count();
    console.log(`Vehicles: ${vehicleCount}`);

    const firstVehicle = await Vehicle.findOne();
    if (firstVehicle) {
      console.log(`First vehicle: ${firstVehicle.brand} ${firstVehicle.name}`);
    }

    const categories = await Vehicle.findAll({
      attributes: [
        [Vehicle.sequelize.fn('DISTINCT', Vehicle.sequelize.col('category')), 'category']
      ]
    });
    console.log(`Categories: ${categories.length}`);
  } catch (error) {
    console.error('Database test failed:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
}

testDatabase();
