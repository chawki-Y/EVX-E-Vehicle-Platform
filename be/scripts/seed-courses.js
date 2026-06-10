const { Course } = require('../models');

const sampleCourses = [
  {
    title: 'Battery Health Workshop',
    description: 'Learn everything about EV battery maintenance, health monitoring, and optimization techniques. This comprehensive workshop covers battery chemistry, charging best practices, thermal management, and troubleshooting common issues.',
    shortDescription: 'Master EV battery maintenance and optimization techniques in this hands-on workshop.',
    image: 'https://images.unsplash.com/photo-1593941707882-a5bac6861d75?w=800&h=600&fit=crop',
    category: 'Workshop',
    level: 'Intermediate',
    duration: '2 days',
    price: 299.99,
    instructor: 'Dr. Sarah Chen',
    location: 'Online',
    maxParticipants: 25,
    currentParticipants: 12,
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-02-16'),
    registrationDeadline: new Date('2024-02-10'),
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
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop',
    category: 'Course',
    level: 'Beginner',
    duration: '4 hours',
    price: null, // Free course
    instructor: 'Mark Johnson',
    location: 'Online',
    maxParticipants: 50,
    currentParticipants: 28,
    startDate: new Date('2024-02-20'),
    endDate: new Date('2024-02-20'),
    registrationDeadline: new Date('2024-02-18'),
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
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=600&fit=crop',
    category: 'Professional',
    level: 'Advanced',
    duration: '3 days',
    price: 899.99,
    instructor: 'Prof. Michael Rodriguez',
    location: 'San Francisco, CA',
    maxParticipants: 15,
    currentParticipants: 8,
    startDate: new Date('2024-03-05'),
    endDate: new Date('2024-03-07'),
    registrationDeadline: new Date('2024-02-28'),
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
    image: 'https://images.unsplash.com/photo-1593941707874-ef2edc59c3dc?w=800&h=600&fit=crop',
    category: 'Workshop',
    level: 'Intermediate',
    duration: '1 day',
    price: 199.99,
    instructor: 'James Wilson',
    location: 'Multiple Cities',
    maxParticipants: 20,
    currentParticipants: 15,
    startDate: new Date('2024-02-25'),
    endDate: new Date('2024-02-25'),
    registrationDeadline: new Date('2024-02-22'),
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
  const { testConnection } = require('../models');
  
  const runSeed = async () => {
    try {
      await testConnection();
      await seedCourses();
      process.exit(0);
    } catch (error) {
      console.error('Failed to seed courses:', error);
      process.exit(1);
    }
  };
  
  runSeed();
}

module.exports = seedCourses;