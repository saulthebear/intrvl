require("dotenv").config()
const express = require("express")
const ejsLayouts = require("express-ejs-layouts")
const browserSync = require("browser-sync")
const methodOverride = require("method-override")
const rowdy = require("rowdy-logger")
const cookieParser = require("cookie-parser")
const db = require("./models")
const cryptoJS = require("crypto-js")

// ANCHOR: App Config
// dotEnv.config()
const PORT = process.env.PORT || 3000
const app = express()
app.set("view engine", "ejs")
const isProduction = process.env.NODE_ENV === "production"

// ANCHOR: Middleware
const rowdyRes = rowdy.begin(app)
app.use(ejsLayouts)
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())

// ANCHOR: Routes
app.get("/", (req, res) => {
  res.render("index")
})

// ANCHOR: Controllers
app.use("/users", require("./controllers/users"))
app.use("/timers", require("./controllers/timers"))

// ANCHOR: Start server
app.listen(PORT, listening)

function listening() {
  console.log(`Server running: http://localhost:${PORT}`)
  if (!isProduction) {
    rowdyRes.print()
    browserSync({
      files: [".{html,js,css}"],
      online: false,
      open: false,
      port: PORT + 1,
      proxy: "localhost:" + PORT,
      ui: false,
    })
  }
}
