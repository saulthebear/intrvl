const express = require("express")
const router = express.Router()
const db = require("../models")
const chalk = require("chalk")
const logger = require("../helpers/logger")
const { login, isLoggedIn } = require("../helpers/login")

// ANCHOR: NEW -- GET /users/new -- signup form
router.get("/new", async (req, res) => {
  res.render("users/new")
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
      if (!username) req.flash("error", "Username is required")
      if (!password) req.flash("error", "Password is required")
      res.redirect(422, "/users/new")
      return
    }

    const passwordHash = await db.User.hashPassword(password)

    const [user, wasCreated] = await db.User.findOrCreate({
      where: { username },
      defaults: { passwordHash },
    })

    if (!user) {
      logger.debug(chalk.yellow("Creating User: Invalid Info"))
      req.flash("error", "Unable to create account. Try again.")
      res.redirect(500, "/users/new")
      return
    }

    if (!wasCreated) {
      logger.debug(chalk.yellow("Creating User: User already exists"))
      req.flash("error", "Username already taken.")
      res.redirect(409, "/users/new")
      return
    }

    logger.debug(chalk.green(`✳️ New user created: ${username}`))
    const loginSuccess = await login(req, res, false)
    if (loginSuccess) {
      logger.debug(chalk.green("New user logged in successfully"))
      res.redirect(`/users/${user.id}`)
    } else {
      logger.debug(chalk.yellow("Unable to log new user in"))
      req.flash("error", "Account created, but unable to login. Try again.")
      res.redirect(500, "/login")
    }
  } catch (error) {
    logger.error(chalk.red("🔥 Error in POST /users"), error)
    req.flash("error", "Couldn't create account. Try again.")
    res.status(500)
    res.render("500")
  }
})

// ANCHOR: SHOW -- GET /users/:id -- user profile
// TODO: show diff data based on login status
router.get("/:id", async (req, res) => {
  if (!isLoggedIn(req, res, req.params.id)) return

  try {
    const id = parseInt(req.params.id)
    const user = await db.User.findByPk(id, {
      include: [
        db.Tag,
        {
          model: db.Timer,
          include: db.Tag,
        },
      ],
    })

    if (!user) {
      req.flash("error", "Profile not found.")
      res.status(404)
      res.render("404")
      return
    }

    const timers = await user.Timers
    const tags = await user.Tags

    res.render("users/profile", { user, timers, tags })
  } catch (error) {
    logger.error(chalk.red("Error showing user profile: "), error)
    res.status(500)
    res.render("500")
  }
})

// ANCHOR: EDIT -- GET /users/:id/edit -- edit profile form
router.get("/:id/edit", async (req, res) => {
  if (!isLoggedIn(req, res, req.params.id)) return
  try {
    const id = parseInt(req.params.id)
    const user = await db.User.findByPk(id)

    if (!user) {
      req.flash("error", "Profile not found.")
      res.status(404)
      res.render("404")
      return
    }

    res.render("users/edit", { user })
  } catch (error) {
    logger.error(chalk.red("Error showing user edit form: "), error)
    res.status(500)
    res.render("500")
  }
})

// ANCHOR: UPDATE -- PUT /users/:id -- update profile
router.put("/:id", async (req, res) => {
  if (!isLoggedIn(req, res, req.params.id)) return

  try {
    const newUsername = req.body.username
    const newPassword = req.body.password

    if (!(newUsername && newPassword)) {
      req.flash("error", "Username and password are required.")
      res.redirect(422, `/users/${res.locals.user.id}/edit`)
      return
    }

    const id = parseInt(req.params.id)
    const user = await db.User.findByPk(id)

    if (!user) {
      req.flash("error", "Profile not found.")
      res.status(404)
      res.render("404")
      return
    }

    const newPasswordHash = db.User.hashPassword(newPassword)

    user.username = newUsername
    user.passwordHash = newPasswordHash
    await user.save()

    req.flash("success", "Account updated")
    res.redirect(`/users/${user.id}`)
  } catch (error) {
    logger.error(chalk.red("Error updating user: "), error)
    res.status(500)
    res.render("500")
  }
})

// ANCHOR: DESTROY -- DELETE /users/:id -- delete user
router.delete("/:id", async (req, res) => {
  if (!isLoggedIn(req, res, req.params.id)) return

  try {
    const id = parseInt(req.params.id)
    const user = await db.User.findByPk(id)

    if (!user) {
      req.flash("error", "Profile not found.")
      res.status(404)
      res.render("404")
      return
    }

    res.clearCookie("userId")
    await user.destroy()

    req.flash("success", "Account deleted")
    res.redirect("/")
  } catch (error) {
    logger.error(chalk.red("Error deleting user: "), error)
    res.status(500)
    res.render("500")
  }
})

module.exports = router
