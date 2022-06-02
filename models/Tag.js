"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Tag.belongsToMany(models.Timer, { through: "TimerTags" })
      models.Tag.belongsTo(models.User)
    }
  }
  Tag.init(
    {
      name: DataTypes.STRING,
      color: DataTypes.STRING,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Tag",
    }
  )
  return Tag
}
