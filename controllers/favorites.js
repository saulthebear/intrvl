const express = require("express")
const db = require("../models")
const logger = require("../helpers/logger")
const chalk = require("chalk")
const { isLoggedIn } = require("../helpers/login")
const { Op } = require("sequelize")

const router = express.Router()

// ANCHOR: Create Favorite -- POST /favorites/:timerId
router.post("/:timerId", async (req, res) => {
  if (!isLoggedIn(req, res)) return

  try {
    const timerId = req.params.timerId

    const timer = await db.Timer.findByPk(timerId)

    if (!timer) {
      res.status(404)
      res.render("404")
      return
    }

    const user = res.locals.user

    await db.Favorite.create({
      UserId: user.id,
      TimerId: timer.id,
    })

    res.redirect(`/timers/${timer.id}`)
  } catch (error) {
    logger.error(chalk.red("Error creating favorite"))
    logger.error(chalk.red(error))
  }
})

// // ANCHOR: Destroy Favorite -- DELETE /favorites/:timerId
router.delete("/:timerId", async (req, res) => {
  if (!isLoggedIn(req, res)) return
  try {
    const timerId = req.params.timerId

    const timer = await db.Timer.findByPk(timerId)

    if (!timer) {
      res.status(404)
      res.render("404")
      return
    }

    const user = res.locals.user

    const fav = await db.Favorite.findOne({
      where: {
        [Op.and]: [{ UserId: user.id }, { TimerId: timer.id }],
      },
    })

    await fav.destroy()

    res.redirect(`/timers/${timerId}`)
  } catch (error) {
    logger.error(chalk.red("Error deleting favorite:"))
    logger.error(chalk.red(error))
  }
})

module.exports = router
