const { Course, sequelize, testConnection } = require('../models');

const sampleCourses = [
  {
    title: 'Battery Health Workshop',
    description: 'Learn everything about EV battery maintenance, health monitoring, and optimization techniques. This comprehensive workshop covers battery chemistry, charging best practices, thermal management, and troubleshooting common issues.',
    shortDescription: 'Master EV battery maintenance and optimization techniques in this hands-on workshop.',
    image: 'assets/vehicles/renault-scenic.jpg',
    category: 'Workshop',
    level: 'Intermediate',
    duration: '2 days',
    price: 299.99,
    instructor: 'Dr. Sarah Chen',
    location: 'Online',
    maxParticipants: 25,
    currentParticipants: 12,
    startDate: new Date('2026-09-15'),
    endDate: new Date('2026-09-16'),
    registrationDeadline: new Date('2026-09-10'),
    syllabus: [
      'Battery Chemistry Fundamentals',
      'Charging Optimization',
      'Thermal Management',
      'Health Monitoring Tools',
      'Troubleshooting Common Issues',
      'Hands-on Lab Sessions'
    ],
    prerequisites: [
      'Basic understanding of electrical systems',
      'EV ownership or professional experience recommended'
    ],
    tags: ['battery', 'maintenance', 'workshop', 'technical'],
    isFeatured: true,
    isPublished: true,
    isActive: true,
    sortOrder: 1
  },
  {
    title: 'EV for Beginners',
    description: 'A comprehensive introduction to electric vehicles for newcomers. This course covers EV basics, types of electric vehicles, charging infrastructure, cost analysis, and environmental benefits.',
    shortDescription: 'Perfect introduction to electric vehicles for complete beginners.',
    image: 'assets/vehicles/hyundai-ioniq-6.jpg',
    category: 'Course',
    level: 'Beginner',
    duration: '4 hours',
    price: null, // Free course
    instructor: 'Mark Johnson',
    location: 'Online',
    maxParticipants: 50,
    currentParticipants: 28,
    startDate: new Date('2026-09-22'),
    endDate: new Date('2026-09-22'),
    registrationDeadline: new Date('2026-09-18'),
    syllabus: [
      'What are Electric Vehicles?',
      'Types of EVs (BEV, PHEV, HEV)',
      'Charging Infrastructure',
      'Cost Analysis and Savings',
      'Environmental Impact',
      'Choosing Your First EV'
    ],
    prerequisites: [],
    tags: ['beginner', 'introduction', 'basics', 'free'],
    isFeatured: true,
    isPublished: true,
    isActive: true,
    sortOrder: 2
  },
  {
    title: 'Advanced EV Diagnostics',
    description: 'Professional-level course for technicians and engineers working with electric vehicles. Learn advanced diagnostic techniques, software tools, and troubleshooting methodologies.',
    shortDescription: 'Professional diagnostic techniques for EV technicians and engineers.',
    image: 'assets/vehicles/porsche-taycan.jpg',
    category: 'Professional',
    level: 'Advanced',
    duration: '3 days',
    price: 899.99,
    instructor: 'Prof. Michael Rodriguez',
    location: 'San Francisco, CA',
    maxParticipants: 15,
    currentParticipants: 8,
    startDate: new Date('2026-10-06'),
    endDate: new Date('2026-10-08'),
    registrationDeadline: new Date('2026-09-28'),
    syllabus: [
      'Advanced Diagnostic Tools',
      'CAN Bus Analysis',
      'High Voltage Safety',
      'Motor Controller Diagnostics',
      'Battery Management Systems',
      'Software Troubleshooting',
      'Case Studies and Practical Labs'
    ],
    prerequisites: [
      'Automotive technician certification',
      'Basic EV knowledge',
      'High voltage safety training'
    ],
    tags: ['advanced', 'professional', 'diagnostics', 'technical'],
    isFeatured: false,
    isPublished: true,
    isActive: true,
    sortOrder: 3
  },
  {
    title: 'Home Charging Installation',
    description: 'Learn how to safely install and maintain home EV charging stations. This practical workshop covers electrical requirements, safety protocols, and installation best practices.',
    shortDescription: 'Hands-on workshop for home EV charging station installation.',
    image: 'assets/vehicles/tesla-model-3.jpg',
    category: 'Workshop',
    level: 'Intermediate',
    duration: '1 day',
    price: 199.99,
    instructor: 'James Wilson',
    location: 'Multiple Cities',
    maxParticipants: 20,
    currentParticipants: 15,
    startDate: new Date('2026-10-17'),
    endDate: new Date('2026-10-17'),
    registrationDeadline: new Date('2026-10-12'),
    syllabus: [
      'Electrical Requirements Assessment',
      'Safety Protocols and Codes',
      'Equipment Selection',
      'Installation Process',
      'Testing and Commissioning',
      'Maintenance Guidelines'
    ],
    prerequisites: [
      'Basic electrical knowledge',
      'Homeowner or electrician'
    ],
    tags: ['installation', 'charging', 'home', 'practical'],
    isFeatured: false,
    isPublished: true,
    isActive: true,
    sortOrder: 4
  }
];

const seedCourses = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Course seeding is disabled in production.');
  }

  try {
    console.log('🌱 Starting to seed courses...');
    
    // Clear existing courses
    await Course.destroy({ where: {} });
    console.log('🗑️  Cleared existing courses');
    
    // Insert sample courses
    const createdCourses = await Course.bulkCreate(sampleCourses);
    console.log(`✅ Successfully created ${createdCourses.length} courses`);
    
    // Log created courses
    createdCourses.forEach(course => {
      console.log(`   📚 ${course.title} (${course.level})`);
    });
    
    console.log('🎉 Course seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  testConnection()
    .then(() => seedCourses())
    .then(() => sequelize.close())
    .catch(async error => {
      console.error('Course seeding failed:', error);
      await sequelize.close();
      process.exitCode = 1;
    });
}

module.exports = seedCourses;
