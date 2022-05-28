const chai = require("chai")
const request = require("supertest")
const bcrypt = require("bcryptjs")

const { server } = require("../../server.js")
const db = require("../../models")
const clearDb = require("../clearDb")
const { userFactory, userData } = require("../factories/user.js")

const should = chai.should()

describe("Users model", () => {
  let user

  before(async () => {
    await clearDb()

    user = await userFactory()
  })

  it("Has a username", () => {
    user.username.should.be.a("string")
  })

  it("Has a password hash", () => {
    user.passwordHash.should.be.a("string")
  })
})

describe("user#hashPassword", () => {
  // const { username, password } = await userData()
  let username, password
  // let user = db.user.build({ username, password })
  before(async () => {
    const data = await userData()
    username = data.username
    password = data.password
  })

  it("exists", () => {
    db.user.hashPassword.should.be.a("function")
  })

  it("accepts and returns a string", () => {
    db.user.hashPassword(password).should.be.a("string")
  })
  it("returns a hash", () => {
    db.user.hashPassword(password).should.match(/^\$2[ayb]\$.{56}$/)
  })
  it("returns a hash that matches the input", () => {
    const hash = db.user.hashPassword(password)
    bcrypt.compareSync(password, hash).should.equal(true)
  })
})
