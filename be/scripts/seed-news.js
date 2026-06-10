const { News, sequelize } = require('../models');

const sampleNews = [
  {
    title: 'Tesla Sold More Cybertrucks Than Almost All Other EV Trucks Combined',
    content: 'Tesla\'s Cybertruck has achieved remarkable sales figures in its first quarter, outselling nearly all other electric truck models combined. The futuristic design and impressive performance specifications have captured consumer attention, making it one of the most successful EV truck launches in recent history. Industry analysts attribute this success to Tesla\'s brand recognition, innovative features, and competitive pricing strategy.',
    excerpt: 'Tesla\'s Cybertruck has achieved remarkable sales figures in its first quarter, outselling nearly all other electric truck models combined.',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&h=400&fit=crop',
    author: 'EVX News Team',
    category: 'Tesla',
    tags: ['Tesla', 'Cybertruck', 'Electric Trucks', 'Sales'],
    publishedAt: new Date('2024-01-15'),
    isPublished: true,
    isFeatured: true,
    slug: 'tesla-cybertruck-sales-record',
    metaDescription: 'Tesla Cybertruck breaks sales records in electric truck market'
  },
  {
    title: 'The Electric Car Revolution is on Track, Says IEA',
    content: 'The International Energy Agency (IEA) has released its latest report confirming that the global electric vehicle revolution is proceeding as expected. The report highlights significant growth in EV adoption worldwide, with sales increasing by 35% year-over-year. Key factors driving this growth include improved battery technology, expanding charging infrastructure, and supportive government policies. The IEA projects that EVs will represent 30% of all vehicle sales by 2030.',
    excerpt: 'The International Energy Agency confirms that the global electric vehicle revolution is proceeding as expected with 35% growth.',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=400&fit=crop',
    author: 'Sarah Johnson',
    category: 'Industry',
    tags: ['IEA', 'Electric Vehicles', 'Market Growth', 'Global Trends'],
    publishedAt: new Date('2024-01-12'),
    isPublished: true,
    isFeatured: true,
    slug: 'iea-electric-car-revolution-on-track',
    metaDescription: 'IEA report confirms electric vehicle revolution is on track with strong global growth'
  },
  {
    title: 'BMW is a Surprise Winner in Electric Vehicles',
    content: 'BMW has emerged as an unexpected leader in the electric vehicle market, with their iX and i4 models gaining significant market share. The German automaker\'s strategic approach to electrification, combining luxury with performance, has resonated well with consumers. BMW\'s investment in solid-state battery technology and their commitment to carbon-neutral production by 2030 has positioned them as a serious competitor to Tesla and other EV manufacturers.',
    excerpt: 'BMW has emerged as an unexpected leader in the electric vehicle market with their iX and i4 models gaining significant market share.',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=400&fit=crop',
    author: 'Michael Chen',
    category: 'BMW',
    tags: ['BMW', 'Electric Vehicles', 'iX', 'i4', 'Market Share'],
    publishedAt: new Date('2024-01-10'),
    isPublished: true,
    isFeatured: false,
    slug: 'bmw-surprise-winner-electric-vehicles',
    metaDescription: 'BMW emerges as surprise winner in electric vehicle market with iX and i4 success'
  },
  {
    title: 'New Fast-Charging Technology Reduces EV Charging Time to 5 Minutes',
    content: 'A breakthrough in fast-charging technology promises to revolutionize electric vehicle adoption by reducing charging times to just 5 minutes for 80% battery capacity. The new technology, developed by a consortium of tech companies, uses advanced cooling systems and optimized battery chemistry to achieve unprecedented charging speeds without compromising battery life. This development could eliminate one of the main barriers to EV adoption - charging anxiety.',
    excerpt: 'Breakthrough fast-charging technology reduces EV charging time to just 5 minutes for 80% battery capacity.',
    image: 'https://images.unsplash.com/photo-1593941707874-ef2edc59c3c9?w=800&h=400&fit=crop',
    author: 'Dr. Emily Rodriguez',
    category: 'Technology',
    tags: ['Fast Charging', 'Battery Technology', 'Innovation', 'EV Infrastructure'],
    publishedAt: new Date('2024-01-08'),
    isPublished: true,
    isFeatured: true,
    slug: 'fast-charging-technology-5-minutes',
    metaDescription: 'Revolutionary fast-charging technology reduces EV charging time to 5 minutes'
  },
  {
    title: 'Ford F-150 Lightning Wins Truck of the Year Award',
    content: 'The Ford F-150 Lightning has been awarded the prestigious Truck of the Year award, marking a significant milestone for electric pickup trucks. The Lightning impressed judges with its impressive towing capacity, innovative features like vehicle-to-home power capability, and competitive pricing. This recognition validates Ford\'s strategy of electrifying their most popular vehicle and demonstrates the growing acceptance of electric trucks in the mainstream market.',
    excerpt: 'Ford F-150 Lightning wins prestigious Truck of the Year award, marking milestone for electric pickup trucks.',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=400&fit=crop',
    author: 'James Wilson',
    category: 'Ford',
    tags: ['Ford', 'F-150 Lightning', 'Electric Trucks', 'Awards'],
    publishedAt: new Date('2024-01-05'),
    isPublished: true,
    isFeatured: false,
    slug: 'ford-f150-lightning-truck-year-award',
    metaDescription: 'Ford F-150 Lightning wins Truck of the Year award for electric pickup innovation'
  },
  {
    title: 'European Union Announces €50 Billion Investment in EV Infrastructure',
    content: 'The European Union has announced a massive €50 billion investment plan to accelerate the deployment of electric vehicle charging infrastructure across member states. The plan aims to install 3 million public charging points by 2030, ensuring that no driver is more than 60km away from a fast-charging station. This ambitious initiative is part of the EU\'s broader Green Deal strategy to achieve carbon neutrality by 2050.',
    excerpt: 'EU announces €50 billion investment to install 3 million public charging points by 2030.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
    author: 'Anna Kowalski',
    category: 'Policy',
    tags: ['European Union', 'EV Infrastructure', 'Investment', 'Green Deal'],
    publishedAt: new Date('2024-01-03'),
    isPublished: true,
    isFeatured: false,
    slug: 'eu-50-billion-ev-infrastructure-investment',
    metaDescription: 'European Union announces €50 billion investment in EV charging infrastructure'
  }
];

const seedNews = async () => {
  try {
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync the News model
    await News.sync({ force: false });
    console.log('✅ News table synchronized.');

    // Check if news already exist
    const existingNews = await News.count();
    if (existingNews > 0) {
      console.log(`ℹ️  Found ${existingNews} existing news articles. Skipping seed.`);
      return;
    }

    // Insert sample news
    await News.bulkCreate(sampleNews);
    console.log(`✅ Successfully seeded ${sampleNews.length} news articles.`);

    // Display seeded news
    const seededNews = await News.findAll({
      attributes: ['id', 'title', 'category', 'publishedAt'],
      order: [['publishedAt', 'DESC']]
    });

    console.log('\n📰 Seeded News Articles:');
    seededNews.forEach(news => {
      console.log(`   ${news.id}. ${news.title} (${news.category})`);
    });

  } catch (error) {
    console.error('❌ Error seeding news:', error);
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
};

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedNews();
}

module.exports = seedNews;