"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class timer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.timer.belongsTo(models.user)
    }
  }
  timer.init(
    {
      userId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      duration: DataTypes.INTEGER,
      repeat: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "timer",
    }
  )
  return timer
}
