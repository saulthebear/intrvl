const express = require("express")
const router = express.Router()
const db = require("../models")
const chalk = require("chalk")
const logger = require("../helpers/logger")

// ANCHOR: SHOW -- GET /users/:id -- user profile
// TODO: show diff data based on login status
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const user = await db.User.findByPk(id)

    if (!user) {
      res.status(404)
      res.render("404")
      return
    }

    const timers = await db.Timer.findAll({
      where: { UserId: user.id },
    })

    res.render("users/profile", { user, timers })
  } catch (error) {
    logger.error(chalk.red("Error showing user profile: "), error)
    res.status(500)
    res.render("500")
  }
})

// ANCHOR: EDIT -- GET /users/:id/edit -- edit profile form
// TODO: Require auth
router.get("/:id/edit", async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const user = await db.User.findByPk(id)

    if (!user) {
      res.status(404)
      res.render("404")
      return
    }

    const messages = await req.flash("message")
    res.render("users/edit", { user, messages })
  } catch (error) {
    logger.error(chalk.red("Error showing user edit form: "), error)
    res.status(500)
    res.render("500")
  }
})

// ANCHOR: UPDATE -- PUT /users/:id -- update profile
// TODO: Require auth
router.put("/:id", async (req, res) => {
  try {
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
  } catch (error) {
    logger.error(chalk.red("Error updating user: "), error)
    res.status(500)
    res.render("500")
  }
})

// ANCHOR: DESTROY -- DELETE /users/:id -- delete user
// TODO: Require auth
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const user = await db.User.findByPk(id)

    if (!user) {
      res.status(404)
      res.render("404")
      return
    }

    await user.destroy()

    req.flash("message", "account deleted")
    res.redirect("/")
  } catch (error) {
    logger.error(chalk.red("Error deleting user: "), error)
    res.status(500)
    res.render("500")
  }
})

module.exports = router
