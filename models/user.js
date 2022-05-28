"use strict"
const { Model } = require("sequelize")
const bcrypt = require("bcryptjs")
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      models.user.hasMany(models.timer)
    }

    static hashPassword(password) {
      return bcrypt.hashSync(password, 12)
    }

    verifyPassword(password) {
      return bcrypt.compareSync(password, this.passwordHash)
    }
  }
  user.init(
    {
      username: DataTypes.STRING,
      passwordHash: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "user",
    }
  )
  return user
}
