const express = require("express")
const router = express.Router()
const db = require("../models")
const chalk = require("chalk")
const logger = require("../helpers/logger")
const { isLoggedIn } = require("../helpers/login")

// ANCHOR: NEW -- GET /tags/new -- new tag form
router.get("/new", (req, res) => {
  if (!isLoggedIn(req, res)) return

  res.render("tags/new", { tag: null })
})

// ANCHOR: CREATE - POST /tags
router.post("/", async (req, res) => {
  if (!isLoggedIn(req, res)) return

  try {
    let name = req.body.name
    const color = req.body.color
    const UserId = res.locals.user.id

    if (!name) {
      req.flash("error", "Name is required")
      res.redirect("/tags/new")
      return
    }

    const reservedTags = ["public", "private"]
    if (reservedTags.includes(name.toLowerCase())) {
      req.flash("error", "Invalid tag name. That tag name is reserved.")
      res.redirect("/tags/new")
      return
    }

    const tag = await db.Tag.create({ name, color, UserId })

    if (tag) {
      logger.debug(chalk.green(`🎟 Tag created! id: ${tag.id}`))
      res.redirect(`tags/${tag.id}`)
    } else {
      logger.error(chalk.red("Could not create tag. Redirecting user"))
      req.flash("error", "Unable to create tag. Try again.")
      // res.redirect(422, "/tags/new")
      res.redirect("/tags/new")
    }
  } catch (error) {
    logger.error(chalk.red("Error creating tag:"))
    logger.error(chalk.red(error))
    req.flash("error", "Could not create tag.")
    res.status(500)
    res.render("500")
  }
})

// ANCHOR: SHOW - GET /tags/:id
router.get("/:id", async (req, res) => {
  try {
    const tag = await db.Tag.findByPk(req.params.id, {
      include: {
        model: db.Timer,
        include: db.Tag,
      },
    })

    if (!tag) {
      req.flash("error", "Tag not found")
      res.status(404)
      res.render("404")
      return
    }

    if (!isLoggedIn(req, res, tag.UserId)) return

    res.render("tags/show", { tag })
  } catch (error) {
    logger.error(chalk.red("Error in tag show page:"))
    logger.error(chalk.red(error))
    res.status(500)
    res.render("500")
  }
})

// ANCHOR: EDIT - GET /tags/:id/edit
router.get("/:id/edit", async (req, res) => {
  try {
    const tag = await db.Tag.findByPk(req.params.id)

    if (!tag) {
      res.status(404)
      res.render("404")
      return
    }

    if (!isLoggedIn(req, res, tag.UserId)) return

    res.render("tags/edit", { tag })
  } catch (error) {
    logger.error(chalk.red("Error in tag edit page:"))
    logger.error(chalk.red(error))
    res.status(500)
    res.render("500")
  }
})

// ANCHOR: UPDATE - PUT /tags/:id
router.put("/:id", async (req, res) => {
  try {
    const tag = await db.Tag.findByPk(req.params.id, { include: db.Timer })

    if (!tag) {
      res.status(404)
      res.render("404")
      return
    }

    if (!isLoggedIn(req, res, tag.UserId)) return

    const name = req.body.name
    const color = req.body.color

    if (!name) {
      req.flash("error", "Name is required")
      res.redirect("/tags/new")
      return
    }

    const reservedTags = ["public", "private"]
    if (reservedTags.includes(name.toLowerCase())) {
      req.flash("error", "Invalid tag name. That tag name is reserved.")
      res.redirect("/tags/new")
      return
    }

    await tag.update({ name, color })
    await tag.save()

    res.redirect(`/tags/${tag.id}`)
  } catch (error) {
    logger.error(chalk.red("Error in tag update:"))
    logger.error(chalk.red(error))
    res.status(500)
    res.render("500")
  }
})

// ANCHOR: DESTROY - DELETE /tags/:id
router.delete("/:id", async (req, res) => {
  try {
    const tag = await db.Tag.findByPk(req.params.id)

    if (!tag) {
      res.status(404)
      res.render("404")
      return
    }

    if (!isLoggedIn(req, res, tag.UserId)) return

    await tag.destroy()
    req.flash("success", "Tag deleted")
    res.redirect(`/users/${tag.UserId}`)
  } catch (error) {
    logger.error(chalk.red("Error deleting tag: "), error)
    req.flash("error", "Could not delete tag.")
    res.status(500)
    res.render("500")
  }
})

module.exports = router
