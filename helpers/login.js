const db = require("../models")
const chalk = require("chalk")
const logger = require("../helpers/logger")

const login = async (req, res, shouldSendResponse = true) => {
  try {
    const username = req.body.username
    const password = req.body.password

    if ((!username || !password) && !shouldSendResponse) return false

    if (!username) req.flash("error", "Username is required")
    if (!password) req.flash("error", "Password is required")

    if (!username || !password) {
      res.redirect("/login")
      return
    }

    const failedLoginMsg = "Incorrect login credentials"

    // lookup the user
    const user = await db.User.findOne({
      where: { username },
    })

    if (!user) {
      logger.debug(chalk.yellow("🚷 Login attempt: Username not found"))
      if (shouldSendResponse) {
        req.flash("error", failedLoginMsg)
        // res.redirect(400, "/login")
        res.redirect("/login")
        return
      } else {
        return false
      }
    }

    const passwordsMatch = user.verifyPassword(password)
    if (passwordsMatch) {
      // Set cookie to encrypted user id
      res.cookie("userId", user.getEncryptedId())
      logger.debug(chalk.green("✅ Logged in successfully"))
      req.flash("success", "Logged in")
      if (shouldSendResponse) {
        res.redirect(`/users/${user.id}`)
      } else {
        return true
      }
    } else {
      if (shouldSendResponse) {
        req.flash("error", failedLoginMsg)
        // res.redirect(400, "/login")
        res.redirect("/login")
        return
      }

      return false
    }
  } catch (error) {
    logger.error(chalk.red(chalk.red("🔥 Error while logging in:"), error))
    if (shouldSendResponse) {
      res.status(500)
      res.render("500")
    } else {
      return false
    }
  }
}

// Check if a specific user is logged in.
// If no userId is specified, returns true if any user is logged in
function isLoggedIn(req, res, userId, allowPublicAccess = false) {
  let authorized = false

  // No logged in user
  if (!res.locals.user && !allowPublicAccess) {
    req.flash("error", "You must be logged in to access this resource.")
    // res.redirect(401, "/login")
    res.redirect("/login")
    return false
  }

  if (userId === undefined || userId === null) {
    // No specific user required. Any logged in user is fine
    authorized = true
  } else {
    // Logged in user must match the id specified
    authorized = res.locals.user.id == userId
  }

  if (authorized) {
    return true // Let caller know it's fine to proceed
  }

  // Return false to indicate current user is not the user specified,
  // but don't show unauthorized page
  if (allowPublicAccess) {
    return false
  }

  // Unauthorized. Render error page.
  res.status(403)
  res.render("unauthorized")
  return false // Let caller know not to continue
}

module.exports = { login, isLoggedIn }
