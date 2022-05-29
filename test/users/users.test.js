require("dotenv").config()
const chai = require("chai")
const bcrypt = require("bcryptjs")
const cryptoJS = require("crypto-js")

const db = require("../../models")
const clearDb = require("../clearDb")
const { userFactory, userData } = require("../factories/user.js")

const should = chai.should()

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

// describe("user routes", () => {
//   describe("GET /users/new", () => {
//     it("shows an HTML page", (done) => {
//       request(app)
//         .get("/users/new")
//         .expect("Content-Type", /text\/html/)
//         .expect(200, done)
//     })
//   })

//   describe("POST /users/login", () => {
//     // describe("Valid credentials", () => {
//     //   let validUsername, validPassword, newUser

//     //   before(async () => {
//     //     // Create a user
//     //     const data = await userData()

//     //     validUsername = data.username
//     //     validPassword = data.password

//     //     const passwordHash = db.user.hashPassword(validPassword)
//     //     newUser = await db.user.create({
//     //       username: validUsername,
//     //       passwordHash: passwordHash,
//     //     })
//     //   })

//     //   it("sets a cookie", () => {
//     //     logger.debug("Test: Sets a cookie")
//     //     logger.debug(
//     //       `Logging in with username: ${validUsername} and password: ${validPassword}`
//     //     )
//     //     // make login request
//     //     request
//     //       .agent(app)
//     //       .post("/users/login")
//     //       .type("form")
//     //       .send({ username: validUsername, password: validPassword })
//     //       .expect(200)
//     //       .expect(Cookies.new({ name: "userId" }))
//     //       .end((err, res) => {
//     //         if (err) throw err
//     //       })
//     //   })

//     //   // it("encrypts user id", (done) => {
//     //   //   // logger.debug("TEST: encrypts user id")
//     //   //   // const agent = request.agent(app)
//     //   //   // // const cookies = {}
//     //   //   // agent
//     //   //   //   .post("/users/login")
//     //   //   //   .type("form")
//     //   //   //   .send({ username: validUsername, password: validPassword })
//     //   //   //   .expect(200)
//     //   //   //   .expect(Cookies.not("set", { name: "bravo" }))
//     //   //   //   // .expect(Cookies.set({ name: "userId", value: newUser.id.toString() }))
//     //   //   //   .end((err, res) => {
//     //   //   //     if (err) throw err
//     //   //   //   })
//     //   //   // done()
//     //   //   // .then(() => done())
//     //   //   // .then((request) => {
//     //   //   //   console.log("Req cookies>>>", request.cookies)
//     //   //   //   const cookies = {}
//     //   //   //   request.headers["set-cookie"][0]
//     //   //   //     .split(",")
//     //   //   //     .map((item) => item.split(";")[0])
//     //   //   //     .forEach((cookieString) => {
//     //   //   //       const [key, val] = cookieString.split("=")
//     //   //   //       cookies[key] = val
//     //   //   //     })
//     //   //   //   return cookies
//     //   //   // })
//     //   //   // .then((cookies) => {
//     //   //   //   const encryptedId = cookies.userId
//     //   //   //   console.log("cookies>>>", cookies)
//     //   //   //   console.log("encryptedId>>>", encryptedId)
//     //   //   //   console.log("key>>>", process.env.ENC_KEY)
//     //   //   //   const decryptedId = cryptoJS.AES.decrypt(
//     //   //   //     encryptedId,
//     //   //   //     process.env.ENC_KEY
//     //   //   //   ).toString(cryptoJS.enc.Utf8)
//     //   //   //   console.log(
//     //   //   //     `decryptedId>>> ${typeof decryptedId} : ${decryptedId} : ${
//     //   //   //       decryptedId.length
//     //   //   //     }`
//     //   //   //   )
//     //   //   //   console.log(decryptedId === newUser.id)
//     //   //   //   console.log(
//     //   //   //     "RESULT >>>",
//     //   //   //     decryptedId.should.equal(newUser.id.toString())
//     //   //   //   )
//     //   //   //   return
//     //   //   // })
//     //   //   // .then(() => done())
//     //   // })

//     //   it("Redirects")
//     // })

//     describe("Invalid credentials", () => {
//       let validUsername, validPassword, newUser

//       before(async () => {
//         // Create a user
//         const data = await userData()

//         validUsername = data.username
//         validPassword = data.password

//         const passwordHash = db.user.hashPassword(validPassword)
//         newUser = await db.user.create({
//           username: validUsername,
//           passwordHash: passwordHash,
//         })
//       })

//       it("doesn't set a cookie", (done) => {
//         request
//           .agent(app)
//           .post("/users/login")
//           .type("form")
//           .send({ username: validUsername, password: validPassword })
//           .expect(200)
//           .expect(Cookies.not("set", { name: "userId" }))
//           .end((err, res) => {
//             if (err) throw err
//           })
//       })

//       it("Redirects")
//     })
//   })

//   // describe("POST /users", () => {
//   //   beforeEach(async () => {
//   //     await clearDb()
//   //   })

//   //   describe("Valid values", () => {
//   //     let username, password
//   //     beforeEach(async () => {
//   //       const data = await userData()
//   //       username = data.username
//   //       password = data.password
//   //     })

//   //     it("response status 201", (done) => {
//   //       request(app)
//   //         .post("/users")
//   //         .send(`username=${username}`)
//   //         .send(`password=${password}`)
//   //         .expect(201, done)
//   //     })
//   //     it("creates a new user", async () => {
//   //       await request(app)
//   //         .post("/users")
//   //         .send(`username=${username}`)
//   //         .send(`password=${password}`)
//   //         .expect(201)

//   //       const user = await db.user.findOne({ where: { username } })
//   //       user.should.be.an.instanceof(db.user)
//   //     })
//   //     it("hashes the user's password", async () => {
//   //       await request(app)
//   //         .post("/users")
//   //         .send(`username=${username}`)
//   //         .send(`password=${password}`)
//   //         .expect(201)

//   //       const user = await db.user.findOne({ where: { username } })
//   //       user.passwordHash.should.not.be.equal(password)
//   //     })
//   //     it("logs the user in")
//   //   })

//   //   describe("Invalid values", () => {
//   //     let username, password

//   //     before(async () => {
//   //       const data = await userData()
//   //       username = data.username
//   //       password = data.password
//   //     })

//   //     it("response status 400", (done) => {
//   //       request(app).post("/users").expect(400, done)
//   //     })
//   //     it("requires a username", (done) => {
//   //       request(app)
//   //         .post("/users")
//   //         .send(`password=${password}`)
//   //         .expect(400, done)
//   //     })

//   //     it("requires a password", (done) => {
//   //       request(app)
//   //         .post("/users")
//   //         .send(`username=${username}`)
//   //         .expect(400, done)
//   //     })
//   //   })
//   // })

//   // describe("GET /users/login", () => {
//   //   it("shows an HTML page", (done) => {
//   //     request(app)
//   //       .get("/users/login")
//   //       .expect("Content-Type", /text\/html/)
//   //       .expect(200, done)
//   //   })
//   // })

//   // describe("GET /users/:id", () => {
//   //   it("shows an HTML page", (done) => {
//   //     request(app)
//   //       .get("/users/1")
//   //       .expect("Content-Type", /text\/html/)
//   //       .expect(200, done)
//   //   })
//   // })

//   // describe("GET /users/:id/edit", () => {
//   //   it("shows an HTML page", (done) => {
//   //     request(app)
//   //       .get("/users/1/edit")
//   //       .expect("Content-Type", /text\/html/)
//   //       .expect(200, done)
//   //   })
//   // })

//   // describe("PUT /users/:id", () => {
//   //   it("updates a user's information")
//   // })

//   // describe("DELETE /users/:id", () => {
//   //   it("deletes a user")
//   // })
// })
