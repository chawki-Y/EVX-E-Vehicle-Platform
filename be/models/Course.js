const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  shortDescription: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Brief description for card display'
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Course image URL'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Workshop'
  },
  level: {
    type: DataTypes.ENUM('Beginner', 'Intermediate', 'Advanced'),
    allowNull: false,
    defaultValue: 'Beginner'
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Course duration like "2 hours" or "3 days"'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'Course price, null for free courses'
  },
  instructor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Physical location or "Online"'
  },
  maxParticipants: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Maximum number of participants'
  },
  currentParticipants: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Course start date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Course end date'
  },
  registrationDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  syllabus: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of course modules/topics'
  },
  prerequisites: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of prerequisites'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of tags for categorization'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Whether the course is currently accepting registrations'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'published_at'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: 'Manual sorting order'
  }
}, {
  tableName: 'courses',
  underscored: true,
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['level']
    },
    {
      fields: ['published_at']
    },
    {
      fields: ['is_published']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['start_date']
    },
    {
      fields: ['sort_order']
    }
  ]
});

module.exports = Course;