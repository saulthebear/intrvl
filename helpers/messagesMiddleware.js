const logger = require("./logger")
const chalk = require("chalk")

/**
 * If there are flash messages, set as res.local.<category>Messages
 */
const setMessages = async (req, res, next) => {
  try {
    res.locals.messages = await req.flash("message")
    res.locals.errorMessages = await req.flash("error")
    res.locals.infoMessages = await req.flash("info")
    res.locals.successMessages = await req.flash("success")
    next()
  } catch (error) {
    res.locals.messages = null
    logger.error(chalk.red("🔥 Error in messages middleware:"))
    logger.error(chalk.red(error))
    res.status(500)
    res.render("500")
  }
}

module.exports = setMessages
