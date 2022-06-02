const setViewHelpers = (req, res, next) => {
  res.locals.colors = {
    red: "bg-red-200",
    orange: "bg-orange-200",
    yellow: "bg-yellow-200",
    green: "bg-green-200",
    blue: "bg-blue-200",
    purple: "bg-purple-200",
  }
  next()
}

module.exports = setViewHelpers
