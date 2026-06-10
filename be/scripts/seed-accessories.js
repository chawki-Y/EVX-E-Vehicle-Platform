const { Accessory, sequelize } = require('../models');
const { accessories } = require('../data/accessories');

async function seedAccessories() {
  try {
    console.log('🔧 Starting accessories seeding...');
    
    // Ensure the database connection is established
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    // Sync the Accessory model (create table if it doesn't exist)
    await Accessory.sync({ force: false });
    console.log('✅ Accessory table synchronized.');
    
    // Check if accessories already exist
    const existingCount = await Accessory.count();
    
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing accessories. Clearing table...`);
      await Accessory.destroy({ where: {}, truncate: true });
    }
    
    // Insert accessories
    console.log(`📦 Inserting ${accessories.length} accessories...`);
    
    for (const accessoryData of accessories) {
      try {
        await Accessory.create(accessoryData);
        console.log(`✅ Created accessory: ${accessoryData.name}`);
      } catch (error) {
        console.error(`❌ Failed to create accessory ${accessoryData.name}:`, error.message);
      }
    }
    
    // Verify the seeding
    const finalCount = await Accessory.count();
    console.log(`🎉 Seeding completed! Total accessories in database: ${finalCount}`);
    
    // Display some statistics
    const categories = await Accessory.findAll({
      attributes: [[Accessory.sequelize.fn('DISTINCT', Accessory.sequelize.col('category')), 'category']]
    });
    
    const brands = await Accessory.findAll({
      attributes: [[Accessory.sequelize.fn('DISTINCT', Accessory.sequelize.col('brand')), 'brand']]
    });
    
    console.log(`📊 Statistics:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Brands: ${brands.length}`);
    console.log(`   - Total Accessories: ${finalCount}`);
    
  } catch (error) {
    console.error('❌ Error seeding accessories:', error);
    throw error;
  }
}

// Run the seeding if this script is executed directly
if (require.main === module) {
  seedAccessories()
    .then(() => {
      console.log('🏁 Accessories seeding completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Accessories seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedAccessories;