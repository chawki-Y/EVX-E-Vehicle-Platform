const { News, sequelize } = require('../models');

const sampleNews = [
  {
    title: 'How to Read an Electric Vehicle Range Estimate',
    content: 'Published range figures are useful comparison points, but real-world results vary with speed, temperature, elevation, tire pressure, and cabin heating or cooling. Use the official estimate as a baseline, then leave a practical buffer when planning longer journeys. EVX keeps range alongside battery and charging information so shoppers can compare the full ownership context.',
    excerpt: 'A practical guide to official range figures and the conditions that affect real-world driving distance.',
    image: 'assets/vehicles/hyundai-ioniq-6.jpg',
    author: 'EVX Editorial',
    category: 'Ownership',
    tags: ['range', 'efficiency', 'planning'],
    publishedAt: new Date('2026-01-18'),
    isPublished: true,
    isFeatured: true,
    slug: 'understanding-ev-range-estimates',
    metaDescription: 'Understand electric vehicle range estimates and the factors that affect real-world range.'
  },
  {
    title: 'Home and Public EV Charging Explained',
    content: 'Most owners handle routine charging at home with Level 2 equipment and use DC fast charging during longer trips. Charging speed depends on both the station and the vehicle. A car cannot accept more power than its onboard limits allow, so peak charger output is only one part of the comparison.',
    excerpt: 'The differences between home charging, public Level 2 stations, and DC fast charging.',
    image: 'assets/vehicles/tesla-model-3.jpg',
    author: 'EVX Editorial',
    category: 'Charging',
    tags: ['charging', 'home charging', 'fast charging'],
    publishedAt: new Date('2026-01-12'),
    isPublished: true,
    isFeatured: true,
    slug: 'home-public-ev-charging-explained',
    metaDescription: 'Compare common home and public electric vehicle charging options.'
  },
  {
    title: 'What Changes the Total Cost of EV Ownership?',
    content: 'Purchase price is only the starting point. Energy rates, annual mileage, insurance, financing, depreciation, maintenance, and available incentives can all change the result. The EVX ownership calculator keeps those assumptions visible so users can model scenarios rather than rely on a single headline number.',
    excerpt: 'The assumptions that matter when comparing purchase price with long-term ownership cost.',
    image: 'assets/vehicles/renault-scenic.jpg',
    author: 'EVX Editorial',
    category: 'Cost planning',
    tags: ['TCO', 'cost', 'planning'],
    publishedAt: new Date('2026-01-05'),
    isPublished: true,
    isFeatured: false,
    slug: 'ev-total-cost-of-ownership-factors',
    metaDescription: 'Learn which assumptions affect electric vehicle total cost of ownership.'
  }
];

async function seedNews() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('News seeding is disabled in production.');
  }

  await News.destroy({ where: {} });
  await News.bulkCreate(sampleNews, { validate: true });
  console.log(`Seeded ${sampleNews.length} educational articles.`);
}

if (require.main === module) {
  seedNews()
    .then(() => sequelize.close())
    .catch(async error => {
      console.error('News seeding failed:', error);
      await sequelize.close();
      process.exitCode = 1;
    });
}

module.exports = seedNews;
