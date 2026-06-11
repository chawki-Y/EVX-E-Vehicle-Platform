const { DataTypes } = require('sequelize');
const environment = require('../config/environment');
const sequelize = require('../../config/database');
const models = require('../../models');

const migrations = [
  require('./migrations/001-baseline-schema'),
  require('./migrations/002-consolidate-item-likes')
];

async function ensureMigrationTable(queryInterface) {
  const tables = (await queryInterface.showAllTables())
    .map(table => typeof table === 'string' ? table : table.tableName);

  if (!tables.includes('SequelizeMeta')) {
    await queryInterface.createTable('SequelizeMeta', {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      executed_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });
  }
}

async function runMigrations() {
  await sequelize.authenticate();
  const queryInterface = sequelize.getQueryInterface();
  await ensureMigrationTable(queryInterface);

  const [rows] = await sequelize.query('SELECT name FROM "SequelizeMeta"');
  const completed = new Set(rows.map(row => row.name));

  for (const migration of migrations) {
    if (completed.has(migration.name)) {
      continue;
    }

    const transaction = await sequelize.transaction();
    try {
      await migration.up({ queryInterface, sequelize, models, transaction });
      await queryInterface.bulkInsert(
        'SequelizeMeta',
        [{ name: migration.name, executed_at: new Date() }],
        { transaction }
      );
      await transaction.commit();
      console.log(`Applied migration ${migration.name}`);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

if (require.main === module) {
  runMigrations()
    .then(async () => {
      console.log(`Database migrations complete (${environment.nodeEnv})`);
      await sequelize.close();
    })
    .catch(async error => {
      console.error('Database migration failed:', error);
      await sequelize.close();
      process.exit(1);
    });
}

module.exports = { runMigrations };
