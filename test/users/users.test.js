const chai = require("chai")
const request = require("supertest")
const bcrypt = require("bcryptjs")

const { server } = require("../../server.js")
const db = require("../../models")
const clearDb = require("../clearDb")
const { userFactory, userData } = require("../factories/user.js")

const should = chai.should()

describe("Users model", async () => {
  let user

  before(async () => {
    await clearDb()

    user = await userFactory()
  })

  it("Has a username", async () => {
    user.username.should.be.a("string")
  })

  it("Has a password hash", async () => {
    user.passwordHash.should.be.a("string")
  })
})

describe("user#hashPassword", async () => {
  const { username, password } = await userData()
  let user = db.user.build({ username, password })

  it("exists", () => {
    user.hashPassword.should.be.a("function")
  })

  it("accepts and returns a string", () => {
    user.hashPassword(password).should.be.a("string")
  })
  it("returns a hash", () => {
    user.hashPassword(password).should.match(/^\$2[ayb]\$.{56}$/)
  })
  it("returns a hash that matches the input", () => {
    const hash = user.hashPassword(password)
    bcrypt.compareSync(password, hash)
  })
})
