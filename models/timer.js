"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class Timer extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Timer.belongsTo(models.User)
    }
  }
  Timer.init(
    {
      UserId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      duration: DataTypes.INTEGER,
      repeat: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Timer",
    }
  )
  return Timer
}
