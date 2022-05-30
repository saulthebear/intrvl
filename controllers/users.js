const express = require("express")
const router = express.Router()
const db = require("../models")
const chalk = require("chalk")
const logger = require("../helpers/logger")
const login = require("../helpers/login")

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
