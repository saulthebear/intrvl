"use strict"

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.removeColumn("Timers", "repeat")
    await queryInterface.addColumn("Timers", "repeat", Sequelize.INTEGER, {
      defaultValue: 1,
    })
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Timers", "repeat")
    await queryInterface.addColumn("Timers", "repeat", Sequelize.BOOLEAN, {
      defaultValue: false,
    })
  },
}
