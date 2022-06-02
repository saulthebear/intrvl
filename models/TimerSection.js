"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class TimerSection extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.TimerSection.belongsTo(models.Timer)
    }
  }
  TimerSection.init(
    {
      name: DataTypes.STRING,
      color: DataTypes.STRING,
      duration: DataTypes.INTEGER,
      position: DataTypes.INTEGER,
      TimerId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "TimerSection",
    }
  )
  return TimerSection
}
