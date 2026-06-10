const { syncDatabase, testConnection } = require('../models');

const migrate = async () => {
  console.log('🚀 Starting database migration...');
  
  try {
    // Test connection first
    await testConnection();
    
    // Sync database (create tables)
    await syncDatabase(false); // Set to true to drop and recreate tables
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

migrate();