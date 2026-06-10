const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Initialize Sequelize with SQLite database
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: console.log
});

async function addDescriptionFields() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Get query interface
    const queryInterface = sequelize.getQueryInterface();

    // Check if description column exists in vehicles table
    const vehiclesTableInfo = await queryInterface.describeTable('vehicles');
    if (!vehiclesTableInfo.description) {
      console.log('Adding description column to vehicles table...');
      await queryInterface.addColumn('vehicles', 'description', {
        type: DataTypes.TEXT,
        defaultValue: 'No description available.'
      });
      console.log('Description column added to vehicles table successfully.');
    } else {
      console.log('Description column already exists in vehicles table.');
    }

    // Check if description column exists in accessories table
    const accessoriesTableInfo = await queryInterface.describeTable('accessories');
    if (!accessoriesTableInfo.description) {
      console.log('Adding description column to accessories table...');
      await queryInterface.addColumn('accessories', 'description', {
        type: DataTypes.TEXT,
        defaultValue: 'No description available.'
      });
      console.log('Description column added to accessories table successfully.');
    } else {
      console.log('Description column already exists in accessories table.');
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the migration
addDescriptionFields();