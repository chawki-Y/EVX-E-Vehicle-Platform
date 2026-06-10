const fs = require('fs');
const path = require('path');

// Predefined dealer data
const dealers = [
  {
    name: 'EuroElectric Motors',
    location: 'Downtown Plaza',
    phone: '+1-555-0101',
    email: 'info@euroelectric.com',
    rating: 4.7,
    verified: true
  },
  {
    name: 'Future Auto Group',
    location: 'Tech District',
    phone: '+1-555-0202',
    email: 'sales@futureautog.com',
    rating: 4.9,
    verified: true
  },
  {
    name: 'Tesla Service Center',
    location: 'Innovation Hub',
    phone: '+1-555-0303',
    email: 'service@tesla.com',
    rating: 4.6,
    verified: true
  },
  {
    name: 'Luxury Motors Elite',
    location: 'Prestige Avenue',
    phone: '+1-555-0404',
    email: 'luxury@elitemotors.com',
    rating: 4.8,
    verified: true
  },
  {
    name: 'Green Drive Solutions',
    location: 'Eco Park',
    phone: '+1-555-0505',
    email: 'eco@greendrive.com',
    rating: 4.5,
    verified: true
  },
  {
    name: 'Premium Electric Auto',
    location: 'Business Center',
    phone: '+1-555-0606',
    email: 'premium@electricauto.com',
    rating: 4.7,
    verified: true
  },
  {
    name: 'City Electric Vehicles',
    location: 'Metro Station',
    phone: '+1-555-0707',
    email: 'city@electricvehicles.com',
    rating: 4.4,
    verified: true
  },
  {
    name: 'Elite EV Dealership',
    location: 'Uptown Square',
    phone: '+1-555-0808',
    email: 'elite@evdealership.com',
    rating: 4.6,
    verified: true
  }
];

const addDealersToVehicles = () => {
  try {
    // Read the vehicles file
    const vehiclesPath = path.join(__dirname, '../data/vehicles.js');
    let content = fs.readFileSync(vehiclesPath, 'utf8');
    
    // Find all vehicle objects that don't have dealer information
    const vehicleRegex = /({[\s\S]*?chargingTime: '[^']*'[\s\S]*?}),?/g;
    let match;
    let updatedContent = content;
    let dealerIndex = 0;
    
    while ((match = vehicleRegex.exec(content)) !== null) {
      const vehicleObj = match[1];
      
      // Check if this vehicle already has dealer info
      if (!vehicleObj.includes('dealer:')) {
        const dealer = dealers[dealerIndex % dealers.length];
        const dealerStr = `,\n    dealer: {\n      name: '${dealer.name}',\n      location: '${dealer.location}',\n      phone: '${dealer.phone}',\n      email: '${dealer.email}',\n      rating: ${dealer.rating},\n      verified: ${dealer.verified}\n    }`;
        
        // Replace the vehicle object with the updated one
        const updatedVehicleObj = vehicleObj.replace(
          /(chargingTime: '[^']*')/,
          `$1${dealerStr}`
        );
        
        updatedContent = updatedContent.replace(vehicleObj, updatedVehicleObj);
        dealerIndex++;
      }
    }
    
    // Write the updated content back to the file
    fs.writeFileSync(vehiclesPath, updatedContent);
    console.log('✅ Successfully added dealer information to all vehicles!');
    
  } catch (error) {
    console.error('❌ Error adding dealers to vehicles:', error);
  }
};

addDealersToVehicles();