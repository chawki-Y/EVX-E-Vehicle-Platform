const sequelize = require('../config/database');
const { QueryInterface, DataTypes } = require('sequelize');

async function addImagesFields() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('Adding images field to vehicles table...');

    // Check if images column exists in vehicles table
    const vehicleColumns = await queryInterface.describeTable('vehicles');
    if (!vehicleColumns.images) {
      await queryInterface.addColumn('vehicles', 'images', {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
        comment: 'Array of image URLs for the vehicle'
      });
      console.log('Images field added to vehicles table successfully!');
    } else {
      console.log('Images field already exists in vehicles table.');
    }

    console.log('Adding images field to accessories table...');

    // Check if images column exists in accessories table
    const accessoryColumns = await queryInterface.describeTable('accessories');
    if (!accessoryColumns.images) {
      await queryInterface.addColumn('accessories', 'images', {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
        comment: 'Array of image URLs for the accessory'
      });
      console.log('Images field added to accessories table successfully!');
    } else {
      console.log('Images field already exists in accessories table.');
    }

    console.log('Images migration completed successfully!');

  } catch (error) {
    console.error('Error during images migration:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the migration
if (require.main === module) {
  addImagesFields()
    .then(() => {
      console.log('Images migration script completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Images migration failed:', error);
      process.exit(1);
    });
}

module.exports = addImagesFields;