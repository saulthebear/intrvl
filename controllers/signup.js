const express = require("express")
const router = express.Router()
const db = require("../models")
const chalk = require("chalk")
const logger = require("../helpers/logger")
const login = require("../helpers/login")

// ANCHOR: NEW -- GET /users/new -- signup form
router.get("/new", async (req, res) => {
  const messages = await req.flash("message")
  res.render("users/new", { messages })
})

// ANCHOR: CREATE -- POST /users -- create a new user
router.post("/", async (req, res) => {
  try {
    const username = req.body.username
    const password = req.body.password

    if (!(username && password)) {
      logger.debug(
        chalk.yellow(
          `Creating User: Invalid credentials: username: ${username}, password: ${password}`
        )
      )
      if (!username) req.flash("message", "Username is required")
      if (!password) req.flash("message", "Password is required")
      res.redirect("/users/new")
      return
    }

    const passwordHash = await db.User.hashPassword(password)

    const [user, wasCreated] = await db.User.findOrCreate({
      where: { username },
      defaults: { passwordHash },
    })

    if (!user) {
      logger.debug(chalk.yellow("Creating User: Invalid Info"))
      req.flash("message", "Unable to create account. Try again.")
      res.status(400)
      res.redirect("/users/new")
      return
    }

    if (!wasCreated) {
      logger.debug(chalk.yellow("Creating User: User already exists"))
      req.flash("message", "Username already taken.")
      res.status(400)
      res.redirect("/users/new")
      return
    }

    logger.debug(chalk.green(`✳️ New user created: ${username}`))
    const loginSuccess = await login(req, res, false)
    if (loginSuccess) {
      logger.debug(chalk.green("New user logged in successfully"))
      res.redirect(`/users/${user.id}`)
    } else {
      logger.debug(chalk.yellow("Unable to log new user in"))
      req.flash("message", "Account created, but unable to login. Try again.")
      res.redirect("/login")
    }
  } catch (error) {
    logger.error(chalk.red("🔥 Error in POST /users"), error)
    res.sendStatus(500)
  }
})

module.exports = router
