const { Vehicle, Accessory, User, testConnection } = require('../models');
const { vehicles } = require('../data/vehicles');
const { accessories } = require('../data/accessories');

const seed = async () => {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Test connection first
    await testConnection();
    
    // Clear existing data
    await Vehicle.destroy({ where: {} });
    await Accessory.destroy({ where: {} });
    await User.destroy({ where: {} });
    console.log('🗑️  Cleared existing data');
    
    // Create default user
    await User.create({
      id: 1,
      name: 'Default User',
      email: 'user@example.com'
    });
    console.log('👤 Created default user with ID 1');
    
    // Clean vehicle data (remove isLiked field)
    const cleanVehicles = vehicles.map(vehicle => {
      const { isLiked, ...cleanVehicle } = vehicle;
      return cleanVehicle;
    });
    
    // Insert vehicle data
    await Vehicle.bulkCreate(cleanVehicles, {
      validate: true,
      ignoreDuplicates: false
    });
    
    // Clean accessory data (remove isLiked field)
    const cleanAccessories = accessories.map(accessory => {
      const { isLiked, ...cleanAccessory } = accessory;
      return cleanAccessory;
    });
    
    // Insert accessory data
    await Accessory.bulkCreate(cleanAccessories, {
      validate: true,
      ignoreDuplicates: false
    });
    
    const vehicleCount = await Vehicle.count();
    const accessoryCount = await Accessory.count();
    const userCount = await User.count();
    console.log(`✅ Successfully seeded ${vehicleCount} vehicles, ${accessoryCount} accessories, and ${userCount} user into the database!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();