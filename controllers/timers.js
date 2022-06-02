const express = require("express")
const db = require("../models")
const logger = require("../helpers/logger")
const chalk = require("chalk")
const { isLoggedIn } = require("../helpers/login")

const router = express.Router()

// ANCHOR new timer form
// GET /timers/new
router.get("/new", async (req, res) => {
  if (!isLoggedIn(req, res)) return

  res.render("timers/new", { timer: null })
})

// ANCHOR create timer
// POST /timers
router.post("/", async (req, res) => {
  if (!isLoggedIn(req, res)) return

  try {
    const name = req.body.name
    const duration = parseInt(req.body.duration)
    const repeat = req.body.repeat || 1
    const startText = req.body.startText
    const endText = req.body.endText

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
      req.flash("error", "Unable to create timer. Try again.")
      res.redirect(422, "/timers/new")
    }
  } catch (error) {
    logger.error(chalk.red("Error creating timer!: "), error)
    req.flash("error", "Could not create timer.")
    res.status(500)
    res.render("500")
  }
})

// ANCHOR show a timer
// GET /timers/:id
router.get("/:id", async (req, res) => {
  try {
    const timer = await db.Timer.findByPk(req.params.id, { include: db.Tag })

    if (!timer) {
      res.status(404)
      res.render("404")
      return
    }

    // Require owner of this timer to be logged in
    const ownerId = timer.UserId
    if (!isLoggedIn(req, res, ownerId)) return

    const allTags = await res.locals.user.getTags()
    const timerTagNames = timer.Tags.map((tag) => tag.name)
    const unusedTags = allTags.filter(
      (tag) => !timerTagNames.includes(tag.name)
    )

    res.render("timers/show", { timer, unusedTags })
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

    // Require owner of this timer to be logged in
    const ownerId = timer.UserId
    if (!isLoggedIn(req, res, ownerId)) return

    res.render("timers/edit", { timer })
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

    if (!timer) {
      res.status(404)
      res.render("404")
      return
    }

    // Require owner of this timer to be logged in
    const ownerId = timer.UserId
    if (!isLoggedIn(req, res, ownerId)) return

    const name = req.body.name
    const duration = parseInt(req.body.duration)
    const repeat = req.body.repeat || 1

    await timer.update({ name, duration, repeat })
    await timer.save()

    res.redirect(`/timers/${req.params.id}`)
  } catch (error) {
    logger.error(chalk.red("Error updating timer: "), error)
    req.flash("error", "Could not update timer.")
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

    // Require owner of this timer to be logged in
    const ownerId = timer.UserId
    if (!isLoggedIn(req, res, ownerId)) return

    await timer.destroy()

    req.flash("success", "Timer deleted")
    res.redirect(`/users/${res.locals.user.id}`)
  } catch (error) {
    logger.error(chalk.red("Error deleting timer: "), error)
    req.flash("error", "Could not delete timer.")
    res.status(500)
    res.render("500")
  }
})

// STUB timers index
// GET /timers
// TODO: Only show public timers
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

// ANCHOR POST /timers/:timerId/tag/:tagId - Associate a tag with a timer
router.post("/:timerId/tag/:tagId", async (req, res) => {
  try {
    const timer = await db.Timer.findByPk(req.params.timerId)

    if (!timer) {
      req.flash("error", "Timer not found")
      res.status(404)
      res.render("404")
      return
    }

    // Require owner of this timer to be logged in
    if (!isLoggedIn(req, res, timer.UserId)) return

    const tag = await db.Tag.findByPk(req.params.tagId)

    if (!tag) {
      req.flash("error", "Tag not found")
      res.status(404)
      res.render("404")
    }

    // Require owner of this tag to be logged in
    if (!isLoggedIn(req, res, tag.UserId)) return

    timer.addTag(tag)
    logger.debug(chalk.green(`Tag ${tag.name} added to timer ${timer.name}`))
    res.redirect(`/timers/${timer.id}`)
  } catch (error) {
    logger.error(chalk.red("Error adding tag to timer:"))
    logger.error(chalk.red(error))
    req.flash("error", "Could not add tag to timer.")
    res.status(500)
    res.render("500")
  }
})

// ANCHOR POST /timers/:timerId/tag/:tagId - Remove a tag from a timer
router.delete("/:timerId/tag/:tagId", async (req, res) => {
  try {
    const timer = await db.Timer.findByPk(req.params.timerId)

    if (!timer) {
      req.flash("error", "Timer not found")
      res.status(404)
      res.render("404")
      return
    }

    // Require owner of this timer to be logged in
    if (!isLoggedIn(req, res, timer.UserId)) return

    const tag = await db.Tag.findByPk(req.params.tagId)

    if (!tag) {
      req.flash("error", "Tag not found")
      res.status(404)
      res.render("404")
    }

    // Require owner of this tag to be logged in
    if (!isLoggedIn(req, res, tag.UserId)) return

    timer.removeTag(tag)
    logger.debug(chalk.yellow(`Tag ${tag.name} removed timer ${timer.name}`))
    res.redirect(`/timers/${timer.id}`)
  } catch (error) {
    logger.error(chalk.red("Error removing tag from timer:"))
    logger.error(chalk.red(error))
    req.flash("error", "Could not remove tag from timer.")
    res.status(500)
    res.render("500")
  }
})

module.exports = router
