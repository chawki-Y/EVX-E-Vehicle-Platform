const { Vehicle, testConnection, syncDatabase } = require('./models');

const testDatabase = async () => {
  console.log('🧪 Testing database connection and operations...');
  
  try {
    // Test connection
    console.log('1. Testing database connection...');
    await testConnection();
    
    // Sync database
    console.log('2. Synchronizing database...');
    await syncDatabase();
    
    // Test basic operations
    console.log('3. Testing basic database operations...');
    
    // Count vehicles
    const vehicleCount = await Vehicle.count();
    console.log(`   📊 Total vehicles in database: ${vehicleCount}`);
    
    // Get first vehicle
    const firstVehicle = await Vehicle.findOne();
    if (firstVehicle) {
      console.log(`   🚗 First vehicle: ${firstVehicle.brand} ${firstVehicle.name}`);
    } else {
      console.log('   ⚠️  No vehicles found. Run "npm run db:seed" to populate data.');
    }
    
    // Test filtering
    const teslaVehicles = await Vehicle.findAll({
      where: { brand: 'Tesla' },
      limit: 3
    });
    console.log(`   🔍 Tesla vehicles found: ${teslaVehicles.length}`);
    
    // Test categories
    const categories = await Vehicle.findAll({
      attributes: [
        [Vehicle.sequelize.fn('DISTINCT', Vehicle.sequelize.col('category')), 'category']
      ]
    });
    console.log(`   📂 Categories available: ${categories.length}`);
    
    console.log('✅ All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    process.exit(0);
  }
};

testDatabase();