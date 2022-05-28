const db = require("../models")

/**
 * Delete all records from all models
 */
const clearDb = async () => {
  const modelNames = Object.keys(db)

  modelNames.forEach(async (modelName) => {
    console.log("model:", typeof modelName)
    if (["sequelize", "Sequelize"].includes(modelName)) return null

    await db[modelName].destroy({ where: {}, force: true })
  })
}

module.exports = clearDb
