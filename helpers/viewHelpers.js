const setViewHelpers = (req, res, next) => {
  res.locals.colors = {
    red: "bg-red-200 dark:bg-red-700",
    orange: "bg-orange-200 dark:bg-orange-700",
    yellow: "bg-yellow-200 dark:bg-yellow-700",
    green: "bg-green-200 dark:bg-green-700",
    blue: "bg-blue-200 dark:bg-blue-700",
    purple: "bg-purple-200 dark:bg-purple-700",
  }
  next()
}

module.exports = setViewHelpers
