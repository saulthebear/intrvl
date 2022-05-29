const faker = require("@faker-js/faker").faker
const bcrypt = require("bcryptjs")
const db = require("../../models")

/**
 * Generate an object which container attributes needed
 * to successfully create a user instance.
 *
 * @param  {Object} props Properties to use for the user.
 *
 * @return {Object}       An object to build the user from.
 */
const createUserData = async (props = {}) => {
  const defaultProps = {
    username: faker.internet.userName(),
    password: faker.internet.password(),
  }
  return Object.assign({}, defaultProps, props)
}

/**
 * Generates a user instance from the properties provided.
 *
 * @param  {Object} props Properties to use for the user.
 *
 * @return {Object}       A user instance
 */
const createUser = async (props = {}) => {
  const userData = await createUserData(props)
  const passwordHash = bcrypt.hashSync(userData.password, 12)
  userData.passwordHash = passwordHash

  const user = await db.User.create(userData, { logging: false })
  return user
}

module.exports = {
  userFactory: createUser,
  userData: createUserData,
}
