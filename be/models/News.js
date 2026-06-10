const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const News = sequelize.define('News', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Short summary for preview'
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Main image URL for the news article'
  },
  author: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'EVX News Team'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'General'
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: [],
    comment: 'Array of tags for categorization'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'published_at'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    comment: 'URL-friendly version of the title'
  },
  metaDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'SEO meta description'
  }
}, {
  tableName: 'news',
  underscored: true,
  indexes: [
    {
      fields: ['category']
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
      fields: ['slug']
    }
  ]
});

module.exports = News;