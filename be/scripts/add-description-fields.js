const sequelize = require('../config/database');
const { QueryInterface, DataTypes } = require('sequelize');

async function addDescriptionFields() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('Adding description field to vehicles table...');

    // Check if description column exists in vehicles table
    const vehicleColumns = await queryInterface.describeTable('vehicles');
    if (!vehicleColumns.description) {
      await queryInterface.addColumn('vehicles', 'description', {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 'Experience the future of driving with this exceptional electric vehicle. Featuring cutting-edge technology, superior performance, and eco-friendly design.'
      });
      console.log('Description field added to vehicles table successfully!');
    } else {
      console.log('Description field already exists in vehicles table.');
    }

    console.log('Adding description field to accessories table...');

    // Check if description column exists in accessories table
    const accessoryColumns = await queryInterface.describeTable('accessories');
    if (!accessoryColumns.description) {
      await queryInterface.addColumn('accessories', 'description', {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: 'High-quality accessory designed to enhance your electric vehicle experience. Built with premium materials and engineered for optimal performance.'
      });
      console.log('Description field added to accessories table successfully!');
    } else {
      console.log('Description field already exists in accessories table.');
    }

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the migration
if (require.main === module) {
  addDescriptionFields()
    .then(() => {
      console.log('Migration script completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addDescriptionFields;