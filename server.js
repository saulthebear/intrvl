import express from "express"
import ejsLayouts from "express-ejs-layouts"
import browserSync from "browser-sync"
import methodOverride from "method-override"
import rowdy from "rowdy-logger"
import cookieParser from "cookie-parser"
import db from "./models/index.cjs"
import cryptoJS from "crypto-js"
import dotEnv from "dotenv"

// ANCHOR: App Config
dotEnv.config()
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
  res.send("hello, world")
})

// ANCHOR: Controllers

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
