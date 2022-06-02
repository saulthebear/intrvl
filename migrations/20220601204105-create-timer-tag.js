"use strict"
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("TimerTags", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      TimerId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      TagId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("TimerTags")
  },
}
