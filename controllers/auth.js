const express = require("express")
const router = express.Router()
const db = require("../models")
const chalk = require("chalk")
const logger = require("../helpers/logger")

// ANCHOR: NEW -- GET /users/login -- login form
router.get("/login", async (req, res) => {
  const messages = await req.flash("message")
  const action = "/login"
  res.render("auth/login", { messages, action })
})

// ANCHOR: CREATE -- POST /users/login -- log the user in (set cookie)
router.post("/login", async (req, res) => {
  try {
    const failedLoginMsg = "Bad Login Credentials"

    // lookup the user
    const user = await db.User.findOne({
      where: { username: req.body.username },
    })

    if (!user) {
      logger.debug(chalk.yellow("🚷 Login attempt: Username not found"))
      req.flash("message", failedLoginMsg)
      res.redirect("/login")
      return
    }

    const passwordsMatch = user.verifyPassword(req.body.password)
    if (passwordsMatch) {
      // Set cookie to encrypted user id
      res.cookie("userId", user.getEncryptedId())
      logger.debug(chalk.green("✅ Logged in successfully"))
      res.redirect("/")
    }
  } catch (error) {
    logger.error(chalk.red(chalk.red("🔥 Error while logging in:"), error))
    res.sendStatus(500)
  }
})

// ANCHOR: DESTROY -- GET /users/logout -- log user out (clear cookie)
router.get("/logout", (req, res) => {
  res.clearCookie("userId")
  res.redirect("/")
})

module.exports = router
