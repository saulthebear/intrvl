const chalk = require("chalk")
const cryptoJS = require("crypto-js")
const db = require("../models")
const logger = require("../helpers/logger")

const setUser = async (req, res, next) => {
  try {
    // if user cookie exists
    if (req.cookies.userId) {
      // get user id from cookie
      const encryptedUserId = req.cookies.userId

      // Try to find user by cookie
      const user = await db.user.findByEncryptedId(encryptedUserId)

      if (!user) {
        console.warn(chalk.yellow("🔥 Could not find the user using cookie"))
        return
      }

      logger.debug(chalk.green(`✅ User ${user.username} is logged in`))

      // mount the user on the res.locals so that later routes can access the logged in user
      res.locals.user = user
    } else {
      logger.debug(chalk.yellow("User not logged in"))
      // No user cookie
      res.locals.user = null
    }
  } catch (error) {
    res.locals.user = null
    logger.error(chalk.red("🔥 Error in auth middleware:"), error)
    res.send(500)
  } finally {
    next()
  }
}

module.exports = { setUser }
