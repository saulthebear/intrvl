require("dotenv").config()
const chai = require("chai")
const bcrypt = require("bcryptjs")
const request = require("supertest")
const express = require("express")
const cookieParser = require("cookie-parser")
const cryptoJS = require("crypto-js")

const db = require("../../models")
const clearDb = require("../clearDb")
const { userFactory, userData } = require("../factories/user.js")
const userRoutes = require("../../controllers/users")

const should = chai.should()
const app = express()
app.use(express.urlencoded({ extended: false }))
app.use("/users", userRoutes)
app.set("view engine", "ejs")
app.use(cookieParser())

describe("Users model", () => {
  describe("Columns", () => {
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

  describe("user.hashPassword", () => {
    let username, password
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

  describe("user#verifyPassword", async () => {
    let username, password, passwordHash, user
    before(async () => {
      const data = await userData()
      username = data.username
      password = data.password
      passwordHash = db.user.hashPassword(password)
      user = await db.user.build({ username, passwordHash })
    })

    it("exists on a model instance", () => {
      user.verifyPassword.should.be.a("function")
    })

    it("returns false if password doesn't match", () => {
      user.verifyPassword("wrong").should.equal(false)
    })

    it("returns true if password matches", () => {
      user.verifyPassword(password).should.equal(true)
    })
  })

  describe("user#getEncryptedId", () => {
    let user
    before(async () => {
      const data = await userData()

      const passwordHash = bcrypt.hashSync(data.password, 12)
      user = await db.user.create({ username: data.username, passwordHash })
    })

    it("exists", () => {
      user.getEncryptedId.should.be.a("function")
    })

    it("returns a string", () => {
      const encryptedId = user.getEncryptedId()
      encryptedId.should.be.a("string")
    })

    it("decrypts to matching id", () => {
      const encryptedId = user.getEncryptedId()
      const decryptedId = cryptoJS.AES.decrypt(
        encryptedId,
        process.env.ENC_KEY
      ).toString(cryptoJS.enc.Utf8)

      decryptedId.should.be.equal(user.id.toString())
    })
  })

  describe("user#verifyEncryptedId", () => {
    let user
    before(async () => {
      const data = await userData()

      const passwordHash = bcrypt.hashSync(data.password, 12)
      user = await db.user.create({ username: data.username, passwordHash })
    })

    it("exists", () => {
      user.verifyEncryptedId.should.be.a("function")
    })

    it("returns a boolean", () => {
      user.verifyEncryptedId("string").should.be.a("boolean")
    })
    it("identifies correct match", () => {
      const encryptedId = cryptoJS.AES.encrypt(
        user.id.toString(),
        process.env.ENC_KEY
      )

      user.verifyEncryptedId(encryptedId).should.equal(true)
    })
    it("identifies incorrect match", () => {
      user.verifyEncryptedId(user.id.toString()).should.equal(false)
    })
  })

  describe("user.findByEncryptedId", () => {
    let user
    before(async () => {
      const data = await userData()

      const passwordHash = bcrypt.hashSync(data.password, 12)
      user = await db.user.create({ username: data.username, passwordHash })
    })
    it("exists", () => {
      db.user.findByEncryptedId.should.be.a("function")
    })
    it("returns a user with valid encrypted id", async () => {
      const id = user.id
      const encryptedId = cryptoJS.AES.encrypt(
        user.id.toString(),
        process.env.ENC_KEY
      )

      const foundUser = await db.user.findByEncryptedId(encryptedId)
      foundUser.should.be.an.instanceof(db.user)
      foundUser.id.should.be.equal(user.id)
    })
    it("returns null with invalid encrypted id", async () => {
      const foundUser = await db.user.findByEncryptedId(
        "U2FsdGVkX19OC0nwb96Nh22oeoMnJk3uXOEcFGPO8bg%3D"
      )
      should.not.exist(foundUser)
    })
  })
})

describe("user routes", () => {
  describe("GET /users/new", () => {
    it("shows an HTML page", (done) => {
      request(app)
        .get("/users/new")
        .expect("Content-Type", /text\/html/)
        .expect(200, done)
    })
  })

  describe("POST /users/login", () => {
    describe("Valid credentials", () => {
      it("sets a cookie")
      // let validUsername, validPassword
      // before(async () => {
      //   // Create a user
      //   const data = await userData()

      //   validUsername = data.username
      //   validPassword = data.password

      //   // console.log("Username >>>", validUsername)
      //   // console.log("Password >>>", validPassword)

      //   const passwordHash = db.user.hashPassword(validPassword)
      //   // console.log("Hash>>>", passwordHash)
      //   await db.user.create({
      //     username: validUsername,
      //     passwordHash: passwordHash,
      //   })
      // })

      // it("sets a cookie", (done) => {
      //   request(app)
      //     .post("/users/login")
      //     .send(`username=${validUsername}, password=${validPassword}`)
      //     .expect((response) => console.log("HEADERS>>>", response.headers))
      //     .expect(200, done)
      // })

      it("encrypts user id")

      it("Redirects")
    })

    describe("Invalid credentials", () => {
      it("doesn't set a cookie")

      it("Redirects")
    })
  })

  describe("POST /users", () => {
    beforeEach(async () => {
      await clearDb()
    })

    describe("Valid values", () => {
      let username, password
      beforeEach(async () => {
        const data = await userData()
        username = data.username
        password = data.password
      })

      it("response status 201", (done) => {
        request(app)
          .post("/users")
          .send(`username=${username}`)
          .send(`password=${password}`)
          .expect(201, done)
      })
      it("creates a new user", async () => {
        await request(app)
          .post("/users")
          .send(`username=${username}`)
          .send(`password=${password}`)
          .expect(201)

        const user = await db.user.findOne({ where: { username } })
        user.should.be.an.instanceof(db.user)
      })
      it("hashes the user's password", async () => {
        await request(app)
          .post("/users")
          .send(`username=${username}`)
          .send(`password=${password}`)
          .expect(201)

        const user = await db.user.findOne({ where: { username } })
        user.passwordHash.should.not.be.equal(password)
      })
      it("logs the user in")
    })

    describe("Invalid values", () => {
      let username, password

      before(async () => {
        const data = await userData()
        username = data.username
        password = data.password
      })

      it("response status 400", (done) => {
        request(app).post("/users").expect(400, done)
      })
      it("requires a username", (done) => {
        request(app)
          .post("/users")
          .send(`password=${password}`)
          .expect(400, done)
      })

      it("requires a password", (done) => {
        request(app)
          .post("/users")
          .send(`username=${username}`)
          .expect(400, done)
      })
    })
  })

  describe("GET /users/login", () => {
    it("shows an HTML page", (done) => {
      request(app)
        .get("/users/login")
        .expect("Content-Type", /text\/html/)
        .expect(200, done)
    })
  })

  describe("GET /users/:id", () => {
    it("shows an HTML page", (done) => {
      request(app)
        .get("/users/1")
        .expect("Content-Type", /text\/html/)
        .expect(200, done)
    })
  })

  describe("GET /users/:id/edit", () => {
    it("shows an HTML page", (done) => {
      request(app)
        .get("/users/1/edit")
        .expect("Content-Type", /text\/html/)
        .expect(200, done)
    })
  })

  describe("PUT /users/:id", () => {
    it("updates a user's information")
  })

  describe("DELETE /users/:id", () => {
    it("deletes a user")
  })
})
