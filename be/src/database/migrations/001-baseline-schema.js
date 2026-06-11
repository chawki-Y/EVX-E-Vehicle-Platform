module.exports = {
  name: '001-baseline-schema',

  async up({ sequelize }) {
    // Schema creation is explicit here and never runs during API startup.
    await sequelize.sync({ force: false });
  }
};
