"use strict"
const { Model } = require("sequelize")
module.exports = (sequelize, DataTypes) => {
  class Favorite extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.Favorite.belongsTo(models.User)
      models.Favorite.belongsTo(models.Timer)
    }
  }
  Favorite.init(
    {
      TimerId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Favorite",
    }
  )
  return Favorite
}
