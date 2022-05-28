const express = require("express")
const db = require("../models")

const router = express.Router()

// ANCHOR new timer form
// GET /timers/new
router.get("/new", (req, res) => {
  res.render("timers/new")
})

// STUB create timer
// POST /timers
router.post("/", (req, res) => {
  res.send("should create a timer")
})

// STUB show a timer
// GET /timers/:id
router.get("/:id", (req, res) => {
  res.render("timers/show")
})

// STUB update timer
// PUT /timers/:id
router.put("/:id", (req, res) => {
  res.send("should update timer")
})

// STUB delete timer
// DELETE /timers/:id
router.delete("/:id", (req, res) => {
  res.send("should delete timer")
})

// STUB edit timer form
// GET /timers/:id/edit
router.get("/:id/edit", (req, res) => {
  res.render("timers/edit")
})

// STUB timers index
// GET /timers
router.get("/", (req, res) => {
  res.send("should show all timers")
})

module.exports = router
