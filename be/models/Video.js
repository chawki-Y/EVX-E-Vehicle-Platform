const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Video = sequelize.define('Video', {
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
  youtubeUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: true
    },
    comment: 'Full YouTube URL'
  },
  youtubeId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'YouTube video ID extracted from URL'
  },
  thumbnail: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'YouTube thumbnail URL or custom thumbnail'
  },
  duration: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Video duration in format like "10:30"'
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Tutorial'
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
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
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
  tableName: 'videos',
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
      fields: ['sort_order']
    },
    {
      fields: ['youtube_id'],
      unique: true
    }
  ]
});

module.exports = Video;