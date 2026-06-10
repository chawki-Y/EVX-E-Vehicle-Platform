const { sequelize, UserItemLike } = require('../models');

/**
 * Script to create the user_item_likes table
 * This table will store likes for both vehicles and accessories with item type tracking
 */

const createItemLikesTable = async () => {
  try {
    console.log('🔄 Creating user_item_likes table...');
    
    // Force sync to create the table
    await UserItemLike.sync({ force: true });
    
    console.log('✅ user_item_likes table created successfully!');
    console.log('📋 Table structure:');
    console.log('   - id: INTEGER (Primary Key, Auto Increment)');
    console.log('   - user_id: INTEGER (Foreign Key to users table)');
    console.log('   - item_id: STRING (ID of the liked item - supports both numbers and UUIDs)');
    console.log('   - item_type: ENUM(\'vehicle\', \'accessory\') (Type of the liked item)');
    console.log('   - liked_at: DATE (Timestamp when item was liked)');
    console.log('   - Unique constraint on (user_id, item_id, item_type)');
    
  } catch (error) {
    console.error('❌ Error creating user_item_likes table:', error);
    throw error;
  }
};

const migrateExistingLikes = async () => {
  try {
    console.log('🔄 Migrating existing vehicle likes to new table...');
    
    // Import the old UserVehicleLike model
    const { UserVehicleLike } = require('../models');
    
    // Get all existing vehicle likes
    const existingLikes = await UserVehicleLike.findAll();
    
    console.log(`📊 Found ${existingLikes.length} existing vehicle likes to migrate`);
    
    // Migrate each like to the new table
    for (const like of existingLikes) {
      await UserItemLike.create({
        userId: like.userId,
        itemId: like.vehicleId.toString(),
        itemType: 'vehicle',
        likedAt: like.likedAt || new Date()
      });
    }
    
    console.log('✅ Migration completed successfully!');
    console.log(`📈 Migrated ${existingLikes.length} vehicle likes to the new table`);
    
  } catch (error) {
    console.error('❌ Error migrating existing likes:', error);
    throw error;
  }
};

const main = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Create the new table
    await createItemLikesTable();
    
    // Migrate existing data
    await migrateExistingLikes();
    
    console.log('🎉 Item likes table setup completed successfully!');
    console.log('💡 You can now use the new /api/item-likes endpoints for both vehicles and accessories');
    
  } catch (error) {
    console.error('💥 Setup failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

// Run the script if called directly
if (require.main === module) {
  main();
}

module.exports = {
  createItemLikesTable,
  migrateExistingLikes
};