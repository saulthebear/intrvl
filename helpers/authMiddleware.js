const chalk = require("chalk")
const cryptoJS = require("crypto-js")
const db = require("../models")

const setUser = async (req, res, next) => {
  try {
    // if user cookie exists
    if (req.cookies.userId) {
      // get user id from cookie
      const encryptedUserId = req.cookies.userId
      const decryptedUserId = cryptoJS.AES.decrypt(
        encryptedUserId,
        process.env.ENC_KEY
      ).toString(cryptoJS.enc.Utf8)

      // try to find that user in the database
      const user = await db.user.findByPk(decryptedUserId)

      if (!user)
        console.warn(chalk.yellow("🔥 Could not find the user using cookie"))

      console.log(chalk.green(`✅ User ${user.username} is logged in`))

      // mount the user on the res.locals so that later routes can access the logged in user
      res.locals.user = user
    } else {
      console.log(chalk.yellow("User not logged in"))
      // No user cookie
      res.locals.user = null
    }
  } catch (error) {
    res.locals.user = null
    console.warn(chalk.red("🔥 Error in auth middleware:"), error)
    res.send(500)
  } finally {
    next()
  }
}

module.exports = { setUser }
