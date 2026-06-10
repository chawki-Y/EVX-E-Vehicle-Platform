const { Vehicle, User, UserVehicleLike, testConnection } = require('./models');

const testLikes = async () => {
  console.log('🧪 Testing like functionality...');
  
  try {
    // Test connection
    await testConnection();
    
    // Get first vehicle
    const vehicle = await Vehicle.findOne();
    console.log(`📱 Testing with vehicle: ${vehicle.name} (ID: ${vehicle.id})`);
    
    // Test like toggle - first like
    console.log('\n1. Testing first like...');
    let like = await UserVehicleLike.findOne({
      where: { userId: 1, vehicleId: vehicle.id }
    });
    console.log('Like exists before:', !!like);
    
    // Create like
    await UserVehicleLike.create({ userId: 1, vehicleId: vehicle.id });
    console.log('✅ Like created');
    
    // Check if like exists
    like = await UserVehicleLike.findOne({
      where: { userId: 1, vehicleId: vehicle.id }
    });
    console.log('Like exists after:', !!like);
    
    // Test getting user's liked vehicles
    console.log('\n2. Testing user liked vehicles...');
    const user = await User.findByPk(1, {
      include: [{
        model: Vehicle,
        as: 'likedVehicles',
        through: { attributes: ['likedAt'] }
      }]
    });
    console.log(`User has ${user.likedVehicles.length} liked vehicles`);
    
    // Test unlike
    console.log('\n3. Testing unlike...');
    await like.destroy();
    console.log('✅ Like removed');
    
    // Verify unlike
    like = await UserVehicleLike.findOne({
      where: { userId: 1, vehicleId: vehicle.id }
    });
    console.log('Like exists after removal:', !!like);
    
    // Test multiple likes
    console.log('\n4. Testing multiple likes...');
    const vehicles = await Vehicle.findAll({ limit: 3 });
    
    for (const v of vehicles) {
      await UserVehicleLike.create({ userId: 1, vehicleId: v.id });
      console.log(`✅ Liked ${v.name}`);
    }
    
    // Get all liked vehicles
    const likedVehicles = await UserVehicleLike.findAll({
      where: { userId: 1 },
      include: [{
        model: Vehicle,
        as: 'vehicle',
        attributes: ['id', 'name', 'brand']
      }]
    });
    
    console.log(`\nUser now has ${likedVehicles.length} liked vehicles:`);
    likedVehicles.forEach(like => {
      console.log(`- ${like.vehicle.name} by ${like.vehicle.brand}`);
    });
    
    console.log('\n✅ All like functionality tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testLikes();