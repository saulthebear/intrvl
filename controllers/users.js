const express = require("express")
const router = express.Router()
const db = require("../models")
const chalk = require("chalk")
const logger = require("../helpers/logger")

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
      res.redirect("/user/new")
      return
    }

    if (!wasCreated) {
      logger.debug(chalk.yellow("Creating User: User already exists"))
      req.flash("message", "Username already taken.")
      res.status(400)
      res.redirect("/users/new")
      return
    }

    logger.debug(chalk.green(`New user created: ${username}`))
    res.status(201)
    res.redirect(`/user/${user.id}`)
  } catch (error) {
    logger.error(chalk.red("🔥 Error in POST /users"), error)
    res.sendStatus(500)
  }
})

// ANCHOR: SHOW -- GET /users/:id -- user profile
// TODO: Require auth - show diff data based on login status
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id)
  const user = await db.User.findByPk(id)

  if (!user) {
    res.render("404")
    return
  }

  res.render("users/profile", { user })
})

// ANCHOR: EDIT -- GET /users/:id/edit -- edit profile form
// TODO: require auth
router.get("/:id/edit", async (req, res) => {
  const id = parseInt(req.params.id)
  const user = await db.User.findByPk(id)

  if (!user) {
    res.render("404")
    return
  }

  const messages = await req.flash("message")
  res.render("users/edit", { user, messages })
})

// ANCHOR: UPDATE -- PUT /users/:id -- update profile
// TODO: Require auth
router.put("/:id", async (req, res) => {
  const newUsername = req.body.username
  const newPassword = req.body.password

  if (!(newUsername && newPassword)) {
    req.flash("message", "Username and password are required.")
    res.redirect(`/users/${id}/edit`)
    return
  }

  const id = parseInt(req.params.id)
  const user = await db.User.findByPk(id)

  if (!user) {
    res.render("404")
    return
  }

  const newPasswordHash = db.User.hashPassword(newPassword)

  user.username = newUsername
  user.passwordHash = newPasswordHash
  await user.save()

  req.flash("message", "Profile updated")
  res.redirect(`/users/${user.id}`)
})

// ANCHOR: DESTROY -- DELETE /users/:id -- delete user
// TODO: Require auth
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id)
  const user = await db.User.findByPk(id)

  if (!user) {
    res.sendStatus(404)
  }

  await user.destroy()

  req.flash("message", "account deleted")
  res.redirect("/")
})

module.exports = router
