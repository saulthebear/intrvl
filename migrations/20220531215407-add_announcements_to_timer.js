"use strict"

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn("Timers", "startText", Sequelize.STRING)
    await queryInterface.addColumn("Timers", "endText", Sequelize.STRING)
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn("Timers", "startText")
    await queryInterface.removeColumn("Timers", "endText")
  },
}
