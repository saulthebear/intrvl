const db = require("../models")
const chalk = require("chalk")
const logger = require("../helpers/logger")

const login = async (req, res, shouldSendResponse = true) => {
  try {
    const failedLoginMsg = "Bad Login Credentials"

    // lookup the user
    const user = await db.User.findOne({
      where: { username: req.body.username },
    })

    if (!user) {
      logger.debug(chalk.yellow("🚷 Login attempt: Username not found"))
      if (shouldSendResponse) {
        req.flash("message", failedLoginMsg)
        res.redirect("/login")
        return
      } else {
        return false
      }
    }

    const passwordsMatch = user.verifyPassword(req.body.password)
    if (passwordsMatch) {
      // Set cookie to encrypted user id
      res.cookie("userId", user.getEncryptedId())
      logger.debug(chalk.green("✅ Logged in successfully"))
      if (shouldSendResponse) {
        res.redirect("/")
      } else {
        return true
      }
    }
  } catch (error) {
    logger.error(chalk.red(chalk.red("🔥 Error while logging in:"), error))
    if (shouldSendResponse) {
      res.sendStatus(500)
    } else {
      return false
    }
  }
}

module.exports = login
