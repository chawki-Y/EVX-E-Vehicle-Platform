const { Video, sequelize } = require('../models');

const sampleVideos = [
  {
    title: 'Charging an Electric Car',
    description: 'A concise guide to charging levels, plugging in, and everyday charging habits.',
    youtubeUrl: 'https://www.youtube.com/watch?v=GcLaoQil3H4',
    youtubeId: 'GcLaoQil3H4',
    thumbnail: 'https://img.youtube.com/vi/GcLaoQil3H4/hqdefault.jpg',
    duration: '2:16',
    category: 'Charging',
    tags: ['charging', 'beginner', 'ownership'],
    isFeatured: true,
    sortOrder: 1
  },
  {
    title: 'Electric Car Battery Basics',
    description: 'Battery longevity, common care guidance, and the fundamentals of battery degradation.',
    youtubeUrl: 'https://www.youtube.com/watch?v=XkR6jGxVjYU',
    youtubeId: 'XkR6jGxVjYU',
    thumbnail: 'https://img.youtube.com/vi/XkR6jGxVjYU/hqdefault.jpg',
    duration: '2:01',
    category: 'Battery',
    tags: ['battery', 'maintenance', 'beginner'],
    isFeatured: true,
    sortOrder: 2
  },
  {
    title: 'Ways to Improve Electric Vehicle Range',
    description: 'Practical driving, climate, tire, and preparation tips that can improve real-world range.',
    youtubeUrl: 'https://www.youtube.com/watch?v=rUld-7S5bnA',
    youtubeId: 'rUld-7S5bnA',
    thumbnail: 'https://img.youtube.com/vi/rUld-7S5bnA/hqdefault.jpg',
    duration: '2:26',
    category: 'Ownership',
    tags: ['range', 'efficiency', 'driving'],
    isFeatured: false,
    sortOrder: 3
  }
];

async function seedVideos() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Video seeding is disabled in production.');
  }

  await Video.destroy({ where: {} });
  await Video.bulkCreate(sampleVideos, { validate: true });
  console.log(`Seeded ${sampleVideos.length} educational videos.`);
}

if (require.main === module) {
  seedVideos()
    .then(() => sequelize.close())
    .catch(async error => {
      console.error('Video seeding failed:', error);
      await sequelize.close();
      process.exitCode = 1;
    });
}

module.exports = seedVideos;
