const sequelize = require('../config/database');
const Vehicle = require('../models/Vehicle');
const Accessory = require('../models/Accessory');

async function populateImagesData() {
  try {
    console.log('Starting images data population...');

    // Vehicle images data
    const vehicleImagesData = {
      1: [
        'https://car-images.bauersecure.com/wp-images/2697/best-electric-cars-2025-renault-scenic-white-front-driving.jpg',
        'https://images.unsplash.com/photo-1617469165786-8007eda4c00b?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1607853554439-0069ec0f29b6?q=80&w=2427&auto=format&fit=crop'
      ],
      2: [
        'https://www.hyundai.co.kr/image/upload/asset_library/MDA00000000000014444/d9c85fa05f364f4a9203fec17c77a814.jpg',
        'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?q=80&w=2071&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1617886903355-9b8348c3e2ca?q=80&w=2070&auto=format&fit=crop'
      ],
      3: [
        'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Model-Y-Main-Hero-Desktop-LHD.jpg',
        'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2071&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1571068316344-75bc76f77890?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=2071&auto=format&fit=crop'
      ]
    };

    // Accessory images data
    const accessoryImagesData = {
      1: [
        'https://digitalassets.tesla.com/tesla-contents/image/upload/f_auto,q_auto/Wall-Connector-Desktop.jpg',
        'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?q=80&w=2072&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1617469165786-8007eda4c00b?q=80&w=2070&auto=format&fit=crop'
      ],
      2: [
        'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1617469165786-8007eda4c00b?q=80&w=2070&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=2070&auto=format&fit=crop'
      ]
    };

    // Update vehicles with images
    console.log('Updating vehicles with images data...');
    for (const [vehicleId, images] of Object.entries(vehicleImagesData)) {
      const vehicle = await Vehicle.findByPk(parseInt(vehicleId));
      if (vehicle) {
        await vehicle.update({ images });
        console.log(`Updated vehicle ${vehicleId} with ${images.length} images`);
      } else {
        console.log(`Vehicle ${vehicleId} not found`);
      }
    }

    // Update accessories with images
    console.log('Updating accessories with images data...');
    for (const [accessoryId, images] of Object.entries(accessoryImagesData)) {
      const accessory = await Accessory.findByPk(parseInt(accessoryId));
      if (accessory) {
        await accessory.update({ images });
        console.log(`Updated accessory ${accessoryId} with ${images.length} images`);
      } else {
        console.log(`Accessory ${accessoryId} not found`);
      }
    }

    console.log('Images data population completed successfully!');

  } catch (error) {
    console.error('Error during images data population:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run the data population
if (require.main === module) {
  populateImagesData()
    .then(() => {
      console.log('Images data population script completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Images data population failed:', error);
      process.exit(1);
    });
}

module.exports = populateImagesData;