const express = require("express")
const db = require("../models")
const logger = require("../helpers/logger")
const chalk = require("chalk")
const { isLoggedIn } = require("../helpers/login")

const router = express.Router()

// SECTION: TIMER ROUTES

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
    const timer = await db.Timer.findByPk(req.params.id, {
      include: [db.Tag, db.TimerSection],
    })

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

    const orderedSections = timer.TimerSections.sort((a, b) => {
      if (a.position > b.position) return 1
      if (b.position > a.position) return -1
      return 0
    })

    res.render("timers/show", { timer, unusedTags, orderedSections })
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

// SECTION: TIMER TAG

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

// SECTION: TIMER SECTION

// ANCHOR: POST /timers/:timerId/sections - Create a new section
router.post("/:timerId/sections", async (req, res) => {
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

    const name = req.body.name
    const duration = Number(req.body.duration)
    let color = req.body.color
    let position = Number(req.body.position)

    // Ensure posted fields are valid
    const validColors = Object.keys(res.locals.colors)
    const [isNameValid, isDurationValid, isColorValid, isPositionValid] =
      validateTimerSection(name, duration, color, position, validColors)

    if (!isNameValid) {
      logger.debug(chalk.yellow("Invalid section name"))
      req.flash("error", "Section name is required")
    }

    if (!isDurationValid) {
      logger.debug(chalk.yellow("Invalid section duration"))
      req.flash("error", "Section duration must be greater than 0.")
    }

    if (!isColorValid) {
      logger.debug(chalk.yellow("Invalid section color"))
      color = "red"
    }

    if (!isPositionValid) {
      logger.debug(chalk.yellow("Invalid section position"))
      position = 0
    }

    // If validations fail, redirect user
    if (!(isNameValid && isDurationValid)) {
      res.redirect(`/timers/${req.params.timerId}`)
      return
    }

    await timer.createTimerSection({ name, duration, color, position })

    logger.debug(chalk.green("Timer section created!"))

    res.redirect(`/timers/${req.params.timerId}`)
  } catch (error) {
    logger.error(chalk.red("Error creating timer section!: "))
    logger.error(chalk.red(error))
    req.flash("error", "Could not create timer section.")
    res.status(500)
    res.render("500")
  }
})

// ANCHOR: PUT /timers/:timerId/sections/:sectionId - Update a section
router.put("/:timerId/sections/:sectionId", async (req, res) => {
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

    const name = req.body.name
    const duration = Number(req.body.duration)
    let color = req.body.color
    let position = Number(req.body.position)

    // Ensure posted fields are valid
    const validColors = Object.keys(res.locals.colors)
    const [isNameValid, isDurationValid, isColorValid, isPositionValid] =
      validateTimerSection(name, duration, color, position, validColors)

    if (!isNameValid) {
      logger.debug(chalk.yellow("Invalid section name"))
      req.flash("error", "Section name is required")
    }

    if (!isDurationValid) {
      logger.debug(chalk.yellow("Invalid section duration"))
      req.flash("error", "Section duration must be greater than 0.")
    }

    if (!isColorValid) {
      logger.debug(chalk.yellow("Invalid section color"))
      color = "red"
    }

    if (!isPositionValid) {
      logger.debug(chalk.yellow("Invalid section position"))
      position = 0
    }

    // If validations fail, redirect user
    if (!(isNameValid && isDurationValid)) {
      logger.debug(chalk.yellow("Timer section validations failed"))
      res.redirect(`/timers/${req.params.timerId}`)
      return
    }

    const section = await db.TimerSection.findByPk(req.params.sectionId)

    if (!section) {
      logger.debug(chalk.yellow("Timer section not found"))
      req.flash("error", "Section not found")
      res.status(404)
      res.render("404")
    }

    // Require section to belong to timer
    if (!timer.hasTimerSection(section)) {
      logger.debug(chalk.yellow("Timer section doesn't belong to timer"))
      req.flash("error", "Timer section doesn't belong to timer")
      res.status(400)
      res.redirect(res.redirect(`/timers/${req.params.timerId}`))
      return
    }

    section.update({ name, duration, color, position })
    section.save()

    logger.debug(chalk.green(`Section updated`))
    res.redirect(`/timers/${timer.id}`)
  } catch (error) {
    logger.error(chalk.red("Error updating timer section:"))
    logger.error(chalk.red(error))
    req.flash("error", "Could not update timer section.")
    res.status(500)
    res.render("500")
  }
})

// ANCHOR: DELETE /timers/:timerId/sections/:sectionId - Destroy a section
router.delete("/:timerId/sections/:sectionId", async (req, res) => {
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

    const section = await db.TimerSection.findByPk(req.params.sectionId)

    if (!section) {
      logger.debug(chalk.yellow("Timer section not found"))
      req.flash("error", "Section not found")
      res.status(404)
      res.render("404")
    }

    // Require section to belong to timer
    if (!timer.hasTimerSection(section)) {
      logger.debug(chalk.yellow("Timer section doesn't belong to timer"))
      req.flash("error", "Timer section doesn't belong to timer")
      res.status(400)
      res.redirect(res.redirect(`/timers/${req.params.timerId}`))
      return
    }

    section.destroy()

    logger.debug(chalk.green("Timer section deleted!"))

    res.redirect(`/timers/${req.params.timerId}`)
  } catch (error) {
    logger.error(chalk.red("Error deleting timer section!: "))
    logger.error(chalk.red(error))
    req.flash("error", "Could not delete timer section.")
    res.status(500)
    res.render("500")
  }
})

function validateTimerSection(name, duration, color, position, validColors) {
  let isNameValid = true
  let isDurationValid = true
  let isColorValid = true
  let isPositionValid = true

  if (!name) isNameValid = false
  if (!(Number.isInteger(duration) && duration > 0)) isDurationValid = false
  if (!validColors.includes(color)) isColorValid = false
  if (!(Number.isInteger(position) && position >= 0)) isPositionValid = false

  return [isNameValid, isDurationValid, isColorValid, isPositionValid]
}

module.exports = router
