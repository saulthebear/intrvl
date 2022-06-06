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
      const hasManyOptions = { onDelete: "CASCADE", hooks: true }
      models.Timer.belongsTo(models.User)
      models.Timer.belongsToMany(models.Tag, { through: "TimerTags" })
      models.Timer.hasMany(models.TimerSection, hasManyOptions)
      models.Timer.hasMany(models.Favorite, hasManyOptions)
    }
  }
  Timer.init(
    {
      UserId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      repeat: DataTypes.INTEGER,
      startText: DataTypes.STRING,
      endText: DataTypes.STRING,
      public: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Timer",
    }
  )
  return Timer
}
