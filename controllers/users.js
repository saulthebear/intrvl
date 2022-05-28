const express = require("express")
const router = express.Router()
const db = require("../models")
const cryptoJS = require("crypto-js")
const bcrypt = require("bcryptjs")

// ANCHOR signup
// GET /users/new
router.get("/new", (req, res) => {
  res.render("users/new", { msg: null })
})

// STUB create a new user
// POST /users
router.post("/", (req, res) => {
  res.send("should create a new user")
})

// STUB login form
// GET /users/login
router.get("/login", (req, res) => {
  res.render("users/login")
})

// STUB log the user in
// POST /users/login
router.post("/login", (req, res) => {
  res.send("should log the user in")
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
