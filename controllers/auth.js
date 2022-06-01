const express = require("express")
const { login } = require("../helpers/login")
const router = express.Router()

// ANCHOR: NEW -- GET /users/login -- login form
router.get("/login", async (req, res) => {
  const action = "/login"
  res.render("auth/login", { action })
})

// ANCHOR: CREATE -- POST /users/login -- log the user in (set cookie)
router.post("/login", async (req, res) => {
  await login(req, res)
})

// ANCHOR: DESTROY -- GET /users/logout -- log user out (clear cookie)
router.get("/logout", (req, res) => {
  res.clearCookie("userId")
  req.flash("success", "Logged out")
  res.redirect("/")
})

module.exports = router
