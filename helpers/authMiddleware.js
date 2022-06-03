const chalk = require("chalk")
const db = require("../models")
const logger = require("../helpers/logger")

/**
 * If there's a login cookie, set find the user and set as res.local.user
 */
const setUser = async (req, res, next) => {
  try {
    // if user cookie exists
    if (req.cookies.userId) {
      // get user id from cookie
      const encryptedUserId = req.cookies.userId

      // Try to find user by cookie
      const user = await db.User.findByEncryptedId(encryptedUserId)

      if (!user) {
        console.warn(chalk.yellow("🔥 Could not find the user using cookie"))
        next()
      }

      // logger.debug(chalk.green(`✅ User ${user.username} is logged in`))

      // mount the user on the res.locals so that later routes can access the logged in user
      res.locals.user = user
    } else {
      // logger.debug(chalk.yellow("User not logged in"))
      // No user cookie
      res.locals.user = null
    }
  } catch (error) {
    res.locals.user = null
    logger.error(chalk.red("🔥 Error in auth middleware:"), error)
    req.flash("error", "Something went wrong logging you in.")
    res.status(500)
    res.render("500")
  } finally {
    next()
  }
}

/**
 * If the user is logged in, call next and allow them to continue
 * If not logged in, redirect to the login page
 */
const requireLogin = (req, res, next) => {
  if (res.locals.user) {
    next()
  } else {
    // res.redirect(401, "/login")
    res.redirect("/login")
  }
}

module.exports = { setUser, requireLogin }
