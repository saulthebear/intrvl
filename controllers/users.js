const express = require("express")
const router = express.Router()
const db = require("../models")
const cryptoJS = require("crypto-js")
const bcrypt = require("bcryptjs")
const chalk = require("chalk")
const logger = require("../helpers/logger")

// ANCHOR signup
// GET /users/new
router.get("/new", (req, res) => {
  res.render("users/new", { msg: null })
})

// create a new user
// POST /users
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
      // TODO: render error message
      res.sendStatus(400)
      return
    }

    const passwordHash = await db.user.hashPassword(password)

    const [user, wasCreated] = await db.user.findOrCreate({
      where: { username },
      defaults: { passwordHash },
    })

    if (!user) {
      logger.debug(chalk.yellow("Creating User: Invalid credentials"))
      // TODO: render error message
      res.sendStatus(400)
      return
    }

    if (!wasCreated) {
      logger.debug(chalk.yellow("Creating User: User already exists"))
      res.send(400, "User already exists")
      // TODO: render error message
      return
    }

    logger.debug(chalk.green(`New user created: ${username}`))
    res.status(201)
    // TODO: redirect user
    res.send("User created! 🎉")
  } catch (error) {
    logger.error(chalk.red("🔥 Error in POST /users"), error)
    res.sendStatus(500)
  }
})

// STUB login form
// GET /users/login
router.get("/login", (req, res) => {
  res.render("users/login")
})

// STUB log the user in
// POST /users/login
// TODO: table constraint, unique username
router.post("/login", async (req, res) => {
  try {
    const failedLoginMsg = "Bad Login Credentials"

    // lookup the user
    const user = await db.user.findOne({
      where: { username: req.body.username },
    })

    if (!user) {
      logger.debug(chalk.yellow("🚷 Login attempt: Username not found"))
      // TODO: redirect to login form with message
      res.send(failedLoginMsg)
      return
    }

    const passwordsMatch = bcrypt.compareSync(
      req.body.password,
      user.passwordHash
    )
    if (passwordsMatch) {
      // Set cookie to encrypted user id
      const encryptedUserId = cryptoJS.AES.encrypt(
        user.id.toString(),
        process.env.ENC_KEY
      ).toString()
      res.cookie("userId", encryptedUserId)
      logger.debug(chalk.green("✅ Logged in successfully"))
      // TODO: redirect user
      res.send("Successful login")
    }
  } catch (error) {
    logger.error(chalk.red(chalk.red("🔥 Error while logging in:"), error))
    res.send(500)
  }
})

// STUB profile
// GET /users/:id
router.get("/:id", (req, res) => {
  res.render("users/profile")
})

// STUB update profile
// PUT /users/:id
router.put("/:id", (req, res) => {
  res.send("should update user profile")
})

// STUB delete profile
// DELETE /users/:id
router.delete("/:id", (req, res) => {
  res.send("should delete user profile")
})

// STUB edit profile
// GET /users/:id/edit
router.get("/:id/edit", (req, res) => {
  res.render("users/edit")
})

// STUB user's timers index
// GET /users/:id/timers
// router.get("/:id/timers", (req, res) => {
//   res.send("should show user's timers")
// })

module.exports = router
