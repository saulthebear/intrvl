require("dotenv").config()
const express = require("express")
const ejsLayouts = require("express-ejs-layouts")
const browserSync = require("browser-sync")
const methodOverride = require("method-override")
const rowdy = require("rowdy-logger")
const cookieParser = require("cookie-parser")
const { setUser } = require("./helpers/authMiddleware")
const logger = require("./helpers/logger")
const session = require("express-session")
const flash = require("connect-flash")
const morgan = require("morgan")
const setMessages = require("./helpers/messagesMiddleware")
const setViewHelpers = require("./helpers/viewHelpers")

// ANCHOR: App Config
// dotEnv.config()
const PORT = process.env.PORT || 3000
const app = express()
app.set("view engine", "ejs")
const isProduction = process.env.NODE_ENV === "production"
const isTest = process.env.NODE_ENV === "test"

// ANCHOR: Middleware
const rowdyRes = rowdy.begin(app)
// Session middleware - used for flash messages
app.use(
  session({
    secret: process.env.ENC_KEY,
    saveUninitialized: true,
    resave: false,
    cookie: {
      maxAge: 600000,
    },
  })
)

app.use(flash()) // flash message middleware
app.use(ejsLayouts)
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(methodOverride("_method"))
app.use(morgan("dev")) // Route logging middleware
app.use(express.static("public"))

// Custom middleware
app.use(setMessages) // Flash messages middleware
app.use(setUser) // auth middleware
app.use(setViewHelpers)

// ANCHOR: Routes
app.get("/", (req, res) => {
  res.render("index")
})

// ANCHOR: Controllers
app.use("", require("./controllers/auth"))
app.use("/users", require("./controllers/users"))
app.use("/timers", require("./controllers/timers"))
app.use("/tags", require("./controllers/tags"))

// ANCHOR: Error Routes
app.use((req, res, next) => {
  // render a 404 template
  res.status(404).render("404")
})

app.use((req, res, next) => {
  // render a 500 template
  res.status(500).render("500")
})

// ANCHOR: Start server
app.listen(PORT, listening)

function listening() {
  logger.info(`Server running: http://localhost:${PORT}`)
  if (!isProduction && !isTest) {
    rowdyRes.print()
    browserSync({
      files: ["./**/*.{html,ejs,js,css}", "./src/**/*.{js, css}"],
      online: false,
      open: false,
      port: PORT + 1,
      proxy: "localhost:" + PORT,
      ui: false,
    })
  }
}

module.exports = {
  app,
}
