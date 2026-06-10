const { Video } = require('../models');

// Sample YouTube videos for EV tutorials and content
const sampleVideos = [
  {
    title: 'How to Charge Your Electric Vehicle - Complete Guide',
    description: 'Learn everything about charging your EV, from home charging to public stations.',
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
    duration: '12:45',
    category: 'Tutorial',
    tags: ['charging', 'tutorial', 'beginner'],
    isFeatured: true,
    sortOrder: 1
  },
  {
    title: 'Tesla Model 3 vs Model Y - Which Should You Buy?',
    description: 'Comprehensive comparison between Tesla Model 3 and Model Y to help you decide.',
    youtubeUrl: 'https://www.youtube.com/watch?v=oHg5SJYRHA0',
    youtubeId: 'oHg5SJYRHA0',
    thumbnail: 'https://img.youtube.com/vi/oHg5SJYRHA0/maxresdefault.jpg',
    duration: '15:30',
    category: 'Review',
    tags: ['tesla', 'comparison', 'review'],
    isFeatured: true,
    sortOrder: 2
  },
  {
    title: 'EV Battery Maintenance Tips for Longevity',
    description: 'Essential tips to maintain your electric vehicle battery and extend its lifespan.',
    youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    youtubeId: 'ScMzIvxBSi4',
    thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
    duration: '8:22',
    category: 'Maintenance',
    tags: ['battery', 'maintenance', 'tips'],
    isFeatured: false,
    sortOrder: 3
  },
  {
    title: 'Top 10 Electric Cars Coming in 2025',
    description: 'Preview of the most exciting electric vehicles launching in 2025.',
    youtubeUrl: 'https://www.youtube.com/watch?v=fJ9rUzIMcZQ',
    youtubeId: 'fJ9rUzIMcZQ',
    thumbnail: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/maxresdefault.jpg',
    duration: '18:15',
    category: 'News',
    tags: ['2025', 'upcoming', 'electric cars'],
    isFeatured: true,
    sortOrder: 4
  },
  {
    title: 'Installing a Home EV Charger - DIY Guide',
    description: 'Step-by-step guide to installing a Level 2 EV charger at home.',
    youtubeUrl: 'https://www.youtube.com/watch?v=qrO4YZeyl0I',
    youtubeId: 'qrO4YZeyl0I',
    thumbnail: 'https://img.youtube.com/vi/qrO4YZeyl0I/maxresdefault.jpg',
    duration: '14:08',
    category: 'Tutorial',
    tags: ['installation', 'home charging', 'diy'],
    isFeatured: false,
    sortOrder: 5
  },
  {
    title: 'Electric Vehicle Road Trip Planning',
    description: 'How to plan the perfect road trip with your electric vehicle.',
    youtubeUrl: 'https://www.youtube.com/watch?v=Sagg08DrO5U',
    youtubeId: 'Sagg08DrO5U',
    thumbnail: 'https://img.youtube.com/vi/Sagg08DrO5U/maxresdefault.jpg',
    duration: '11:33',
    category: 'Tutorial',
    tags: ['road trip', 'planning', 'travel'],
    isFeatured: false,
    sortOrder: 6
  }
];

const seedVideos = async () => {
  try {
    console.log('🎥 Starting video seeding...');
    
    // Clear existing videos
    await Video.destroy({ where: {} });
    console.log('🗑️  Cleared existing videos');
    
    // Insert sample videos
    const createdVideos = await Video.bulkCreate(sampleVideos);
    console.log(`✅ Created ${createdVideos.length} sample videos`);
    
    console.log('🎥 Video seeding completed successfully!');
    
    // Log created videos
    createdVideos.forEach(video => {
      console.log(`   - ${video.title} (${video.category})`);
    });
    
  } catch (error) {
    console.error('❌ Error seeding videos:', error);
  }
};

// Run if called directly
if (require.main === module) {
  seedVideos().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
}

module.exports = seedVideos;