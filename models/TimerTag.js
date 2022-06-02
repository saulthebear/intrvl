"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class TimerTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TimerTag.init(
    {
      TimerId: DataTypes.INTEGER,
      TagId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "TimerTag",
    }
  )
  return TimerTag
}
