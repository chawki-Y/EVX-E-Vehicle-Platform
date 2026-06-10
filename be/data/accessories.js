const accessories = [
  {
    id: 1,
    name: 'Tesla Wall Connector',
    brand: 'Tesla',
    price: 425.00,
    originalPrice: 500.00,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?q=80&w=2070&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617469165786-8007eda4c00b?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=2070&auto=format&fit=crop'
    ],
    category: 'Charging',
    rating: 4.8,
    reviews: 342,
    isLiked: false,
    isCompared: false,
    badge: 'BEST SELLER',
    features: ['Wi-Fi Enabled', 'Weather Resistant', 'Up to 48A'],
    compatibility: ['Tesla Model S', 'Tesla Model 3', 'Tesla Model X', 'Tesla Model Y'],
    description: 'The Tesla Wall Connector is the most convenient way to charge your Tesla at home. This sleek, weather-resistant charging solution delivers up to 48 amps of power and can be controlled remotely via Wi-Fi. With its compact design and easy installation, you can enjoy fast, reliable charging in your garage or driveway. Compatible with all Tesla vehicles and designed to integrate seamlessly with your home.',
    dealer: {
      name: 'Tesla Accessories',
      location: 'Innovation Hub',
      phone: '+1-555-0303',
      email: 'accessories@tesla.com',
      rating: 4.6,
      verified: true
    },
    type: 'accessory'
  },
  {
    id: 2,
    name: 'Universal Type 2 Charging Cable',
    brand: 'ChargePoint',
    price: 189.99,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?q=80&w=2070&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1617469165786-8007eda4c00b?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=2070&auto=format&fit=crop'
    ],
    category: 'Charging',
    rating: 4.5,
    reviews: 156,
    isLiked: false,
    isCompared: false,
    features: ['Type 2 Connector', '32A Rating', '5m Length'],
    compatibility: ['BMW i3', 'BMW iX', 'Audi e-tron', 'Mercedes EQS', 'Volkswagen ID.4'],
    description: 'This high-quality Universal Type 2 charging cable is essential for European EV owners. With a 32A rating and 5-meter length, it provides flexibility and fast charging capabilities for most European electric vehicles. The durable construction ensures reliable performance in all weather conditions, while the ergonomic design makes it easy to handle during daily use.',
    dealer: {
      name: 'EV Accessories Pro',
      location: 'Tech District',
      phone: '+1-555-0901',
      email: 'sales@evaccessoriespro.com',
      rating: 4.7,
      verified: true
    },
    type: 'accessory'
  },
  {
    id: 3,
    name: 'Wireless Phone Mount',
    brand: 'iOttie',
    price: 79.95,
    image: 'https://images.unsplash.com/photo-1512499617640-c74ae3a79d37?q=80&w=2070&auto=format&fit=crop',
    category: 'Interior',
    rating: 4.6,
    reviews: 289,
    isLiked: true,
    isCompared: false,
    badge: 'POPULAR',
    features: ['Wireless Charging', 'Auto-Clamping', 'Adjustable Viewing'],
    compatibility: ['Universal - All EVs'],
    description: 'Transform your driving experience with this premium wireless phone mount that combines convenience and safety. The auto-clamping mechanism securely holds your phone while providing fast wireless charging. With 360-degree rotation and adjustable viewing angles, you can position your phone perfectly for navigation or hands-free calls. Compatible with all smartphones and EV models.',
    dealer: {
      name: 'Auto Tech Solutions',
      location: 'Downtown Plaza',
      phone: '+1-555-0902',
      email: 'info@autotechsolutions.com',
      rating: 4.5,
      verified: true
    },
    type: 'accessory'
  },
  {
    id: 4,
    name: 'All-Weather Floor Mats',
    brand: 'WeatherTech',
    price: 159.95,
    originalPrice: 179.95,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070&auto=format&fit=crop',
    category: 'Interior',
    rating: 4.9,
    reviews: 567,
    isLiked: false,
    isCompared: false,
    badge: 'TOP RATED',
    features: ['Custom Fit', 'All-Weather Protection', 'Easy Clean'],
    compatibility: ['Tesla Model 3', 'Tesla Model Y'],
    description: 'Protect your vehicle\'s interior with these premium all-weather floor mats from WeatherTech. Precision-engineered for a perfect fit, these mats provide superior protection against dirt, mud, snow, and spills. The advanced material is easy to clean and maintains its shape over time, ensuring your EV\'s interior stays pristine. Custom-designed channels direct liquids away from your feet and carpet.',
    dealer: {
      name: 'Premium Auto Parts',
      location: 'Business Center',
      phone: '+1-555-0903',
      email: 'premium@autoparts.com',
      rating: 4.8,
      verified: true
    },
    type: 'accessory'
  },
  {
    id: 5,
    name: 'Portable EV Charger',
    brand: 'JuiceBox',
    price: 649.00,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?q=80&w=2070&auto=format&fit=crop',
    category: 'Charging',
    rating: 4.7,
    reviews: 198,
    isLiked: false,
    isCompared: false,
    features: ['Level 2 Charging', 'Smart Connectivity', 'Compact Design'],
    compatibility: ['All EVs with J1772', 'Tesla with Adapter'],
    description: 'Take fast charging anywhere with this intelligent portable EV charger. Featuring Level 2 charging capabilities and smart connectivity, you can monitor and control your charging sessions remotely via smartphone app. The compact, weather-resistant design makes it perfect for travel, while the universal J1772 connector ensures compatibility with virtually all electric vehicles.',
    dealer: {
      name: 'Green Energy Solutions',
      location: 'Eco Park',
      phone: '+1-555-0904',
      email: 'green@energysolutions.com',
      rating: 4.6,
      verified: true
    },
    type: 'accessory'
  },
  {
    id: 6,
    name: 'Roof Cargo Box',
    brand: 'Thule',
    price: 399.95,
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop',
    category: 'Exterior',
    rating: 4.4,
    reviews: 134,
    isLiked: false,
    isCompared: false,
    features: ['Aerodynamic Design', '16 cu ft Capacity', 'Dual-Side Opening'],
    compatibility: ['Tesla Model S', 'Tesla Model X', 'BMW iX', 'Audi e-tron'],
    dealer: {
      name: 'Outdoor Gear Plus',
      location: 'Adventure District',
      phone: '+1-555-0905',
      email: 'outdoor@gearplus.com',
      rating: 4.3,
      verified: true
    },
    type: 'accessory'
  },
  {
    id: 7,
    name: 'Dashboard Camera',
    brand: 'BlackVue',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=2070&auto=format&fit=crop',
    category: 'Safety',
    rating: 4.6,
    reviews: 245,
    isLiked: false,
    isCompared: false,
    badge: 'SAFETY FIRST',
    features: ['4K Recording', 'Cloud Connectivity', 'Parking Mode'],
    compatibility: ['Universal - All EVs'],
    dealer: {
      name: 'Security Systems Pro',
      location: 'Safety Center',
      phone: '+1-555-0906',
      email: 'security@systemspro.com',
      rating: 4.7,
      verified: true
    },
    type: 'accessory'
  },
  {
    id: 8,
    name: 'Tire Pressure Monitoring System',
    brand: 'FOBO',
    price: 129.99,
    originalPrice: 149.99,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=2070&auto=format&fit=crop',
    category: 'Safety',
    rating: 4.3,
    reviews: 89,
    isLiked: false,
    isCompared: false,
    features: ['Real-time Monitoring', 'Smartphone App', 'Easy Installation'],
    compatibility: ['Universal - All EVs'],
    dealer: {
      name: 'Smart Car Tech',
      location: 'Innovation Hub',
      phone: '+1-555-0907',
      email: 'smart@cartech.com',
      rating: 4.4,
      verified: true
    },
    type: 'accessory'
  },
  {
    id: 9,
    name: 'Sunshade Windshield Cover',
    brand: 'Tesla',
    price: 65.00,
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?q=80&w=2070&auto=format&fit=crop',
    category: 'Interior',
    rating: 4.2,
    reviews: 178,
    isLiked: false,
    isCompared: false,
    features: ['Custom Fit', 'UV Protection', 'Easy Storage'],
    compatibility: ['Tesla Model 3', 'Tesla Model Y'],
    dealer: {
      name: 'Tesla Accessories',
      location: 'Innovation Hub',
      phone: '+1-555-0303',
      email: 'accessories@tesla.com',
      rating: 4.6,
      verified: true
    },
    type: 'accessory'
  },
  {
    id: 10,
    name: 'LED Light Bar',
    brand: 'Rigid Industries',
    price: 249.99,
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=2070&auto=format&fit=crop',
    category: 'Exterior',
    rating: 4.7,
    reviews: 156,
    isLiked: false,
    isCompared: false,
    badge: 'OFF-ROAD READY',
    features: ['High Output LEDs', 'Weather Resistant', 'Multiple Beam Patterns'],
    compatibility: ['Rivian R1T', 'Ford Lightning', 'Cybertruck'],
    dealer: {
      name: 'Off-Road Specialists',
      location: 'Adventure District',
      phone: '+1-555-0908',
      email: 'offroad@specialists.com',
      rating: 4.5,
      verified: true
    },
    type: 'accessory'
  }
];

const accessoryCategories = ['Charging', 'Interior', 'Exterior', 'Safety', 'Performance', 'Maintenance'];
const accessoryBrands = ['Tesla', 'ChargePoint', 'iOttie', 'WeatherTech', 'JuiceBox', 'Thule', 'BlackVue', 'FOBO', 'Rigid Industries'];

module.exports = {
  accessories,
  accessoryCategories,
  accessoryBrands
};