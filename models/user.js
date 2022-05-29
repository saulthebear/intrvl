"use strict"
const { Model } = require("sequelize")
const bcrypt = require("bcryptjs")
const cryptoJS = require("crypto-js")
const logger = require("../helpers/logger")

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

    static findByEncryptedId(encryptedId) {
      let foundUser
      try {
        const decryptedId = cryptoJS.AES.decrypt(
          encryptedId,
          process.env.ENC_KEY
        ).toString(cryptoJS.enc.Utf8)

        if (!decryptedId) throw "Invalid encryptedId"

        foundUser = user.findByPk(decryptedId)
      } catch (error) {
        logger.debug("Could not find user by encryptedId")
        return null
      }

      return foundUser
    }

    verifyPassword(password) {
      return bcrypt.compareSync(password, this.passwordHash)
    }

    getEncryptedId() {
      const stringId = this.id.toString()
      const encryptedId = cryptoJS.AES.encrypt(stringId, process.env.ENC_KEY)
      return encryptedId.toString()
    }

    verifyEncryptedId(encryptedId) {
      const decryptedId = cryptoJS.AES.decrypt(
        encryptedId,
        process.env.ENC_KEY
      ).toString(cryptoJS.enc.Utf8)
      return decryptedId == this.id
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
