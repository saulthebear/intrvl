const express = require("express")
const db = require("../models")
const logger = require("../helpers/logger")
const chalk = require("chalk")

const router = express.Router()

// ANCHOR new timer form
// GET /timers/new
router.get("/new", async (req, res) => {
  const messages = await req.flash("message")
  res.render("timers/new", { messages, timer: null })
})

// ANCHOR create timer
// POST /timers
router.post("/", async (req, res) => {
  try {
    const name = req.body.name
    const duration = parseInt(req.body.duration)
    const repeat = !!req.body.repeat
    const startText = req.body.startText
    const endText = req.body.endText

    logger.debug(chalk.yellow(Object.keys(req.body)))
    console.log(req.body)

    const user = res.locals.user
    const timer = await user.createTimer({
      name,
      duration,
      repeat,
      startText,
      endText,
    })

    if (timer) {
      logger.debug(chalk.green(`⏲ Timer created! id: ${timer.id}`))
      res.redirect(`/timers/${timer.id}`)
    } else {
      req.flash("message", "Unable to create timer. Try again.")
      res.redirect("/timer/new")
    }
  } catch (error) {
    logger.error(chalk.red("Error creating timer!: "), error)
    res.status(500)
    res.render("500")
  }
})

// ANCHOR show a timer
// GET /timers/:id
router.get("/:id", async (req, res) => {
  try {
    const timer = await db.Timer.findByPk(req.params.id)
    res.render("timers/show", { timer })
  } catch (error) {
    logger.error(chalk.red("Error in timer show page! "), error)
    res.status(500)
    res.render("500")
  }
})

// ANCHOR edit timer form
// GET /timers/:id/edit
router.get("/:id/edit", async (req, res) => {
  try {
    const timer = await db.Timer.findByPk(req.params.id)

    if (!timer) {
      res.status(404)
      res.render("404")
      return
    }

    const messages = await req.flash("message")
    res.render("timers/edit", { messages, timer })
  } catch (error) {
    logger.error(chalk.red("Error showing timer edit form: "), error)
    res.status(500)
    res.render("500")
  }
})

// ANCHOR update timer
// PUT /timers/:id
router.put("/:id", async (req, res) => {
  try {
    const timer = await db.Timer.findByPk(req.params.id)

    if (!timer) throw "Could not find timer!"

    const name = req.body.name
    const duration = parseInt(req.body.duration)
    const repeat = !!req.body.repeat

    await timer.update({ name, duration, repeat })
    await timer.save()

    res.redirect(`/timers/${req.params.id}`)
  } catch (error) {
    logger.error(chalk.red("Error updating timer: "), error)
    res.status(500)
    res.render("500")
  }
})

// ANCHOR delete timer
// DELETE /timers/:id
router.delete("/:id", async (req, res) => {
  try {
    const timer = await db.Timer.findByPk(req.params.id)

    if (!timer) {
      res.status(404)
      res.render("404")
      return
    }

    await timer.destroy()

    req.flash("message", "timer deleted")
    res.redirect(`/users/${res.locals.user.id}`)
  } catch (error) {
    logger.error(chalk.red("Error deleting timer: "), error)
    res.status(500)
    res.render("500")
  }
})

// STUB timers index
// GET /timers
router.get("/", async (req, res) => {
  try {
    const timers = await db.Timer.findAll()
    res.render("timers/index", { timers })
  } catch (error) {
    logger.error(chalk.red("Error showing all timers: "), error)
    res.status(500)
    res.render("500")
  }
})

module.exports = router
